import { describe, it, expect } from "vitest";
import { mergeDeltas, numberAttr, type ExitOutcome } from "./analytics-write";
import type { AnalyticsEvent } from "./analytics-events";

// mergeDeltas is where a whole batch collapses into one delta per rollup item.
// It is pure, so the counter arithmetic can be pinned here rather than being
// discovered later as drift in a dashboard nobody can reconcile.

const PAGE = "page-aaaa";

function ctx(over: Partial<Parameters<typeof mergeDeltas>[1]> = {}) {
  return {
    device: "desktop" as const,
    countsAsNewToday: false,
    countedAsUnique: false,
    exits: new Map<string, ExitOutcome>(),
    ...over,
  };
}

function pageview(p = "/", seq = 0): AnalyticsEvent {
  return { t: "pageview", pid: PAGE, p, ts: 1, seq };
}

function scroll(d: 25 | 50 | 75 | 100, p = "/", seq = 1): AnalyticsEvent {
  return { t: "scroll", pid: PAGE, p, ts: 1, seq, d };
}

function exit(ms: number, p = "/", seq = 9, pid = PAGE): AnalyticsEvent {
  return { t: "exit", pid, p, ts: 1, seq, ms, d: 75, r: "pagehide" };
}

describe("numberAttr", () => {
  // Regression. A ConditionalCheckFailedException carries the RAW AttributeValue
  // map even under the document client, so dwellMs arrives as { N: "20000" }.
  // Reading it with a plain typeof check yielded undefined, which made every
  // superseded exit correct against zero and leave a negative bucket behind.
  // This was invisible in unit tests and only showed up against a real table.
  it("reads the raw DynamoDB shape the exception actually carries", () => {
    expect(numberAttr({ dwellMs: { N: "20000" } }, "dwellMs")).toBe(20_000);
    expect(numberAttr({ maxScroll: { N: "30" } }, "maxScroll")).toBe(30);
  });

  it("still reads a plain number, in case the SDK ever unmarshals it", () => {
    expect(numberAttr({ dwellMs: 20_000 }, "dwellMs")).toBe(20_000);
  });

  it("returns undefined rather than zero for anything unusable", () => {
    // Returning 0 here is what caused the bug: it looks like a valid previous
    // value and silently corrects the histogram against the wrong bucket.
    expect(numberAttr(undefined, "dwellMs")).toBeUndefined();
    expect(numberAttr({}, "dwellMs")).toBeUndefined();
    expect(numberAttr({ dwellMs: { S: "nope" } }, "dwellMs")).toBeUndefined();
    expect(numberAttr({ dwellMs: { N: "not-a-number" } }, "dwellMs")).toBeUndefined();
    expect(numberAttr({ dwellMs: Number.NaN }, "dwellMs")).toBeUndefined();
  });
});

describe("mergeDeltas", () => {
  it("counts the batch itself once regardless of how many events it carries", () => {
    const deltas = mergeDeltas([pageview(), scroll(25), scroll(50)], ctx());
    expect(deltas.totals.events).toBe(3);
    expect(deltas.totals.batches).toBe(1);
    expect(deltas.meta.events).toBe(3);
  });

  it("splits a pageview across the totals, the path, the country and the referrer", () => {
    const deltas = mergeDeltas([pageview("/blog/x")], ctx());
    expect(deltas.totals.views).toBe(1);
    expect(deltas.totals.dev_desktop).toBe(1);
    expect(deltas.paths.get("/blog/x")?.views).toBe(1);
    expect(deltas.geo.views).toBe(1);
    expect(deltas.ref.views).toBe(1);
    expect(deltas.meta.pageviews).toBe(1);
  });

  it("collapses an unrecognised path so junk cannot mint rollup dimensions", () => {
    const deltas = mergeDeltas([pageview("/wp-admin/install.php")], ctx());
    expect(deltas.paths.get("/other")?.views).toBe(1);
    expect(deltas.paths.has("/wp-admin/install.php")).toBe(false);
  });

  it("increments sessions only when the session is new to this day", () => {
    const quiet = mergeDeltas([pageview()], ctx());
    expect(quiet.totals.sessions).toBeUndefined();

    const fresh = mergeDeltas([pageview()], ctx({ countsAsNewToday: true }));
    expect(fresh.totals.sessions).toBe(1);
    expect(fresh.geo.sessions).toBe(1);
    expect(fresh.ref.sessions).toBe(1);
  });

  it("increments uniques only when this visitor won the marker race", () => {
    const won = mergeDeltas([pageview()], ctx({ countsAsNewToday: true, countedAsUnique: true }));
    expect(won.totals.uniques).toBe(1);

    const lost = mergeDeltas([pageview()], ctx({ countsAsNewToday: true, countedAsUnique: false }));
    expect(lost.totals.uniques).toBeUndefined();
  });

  it("records every crossed milestone on both the totals and the path", () => {
    const deltas = mergeDeltas([scroll(25, "/blog/x"), scroll(50, "/blog/x")], ctx());
    expect(deltas.totals.s25).toBe(1);
    expect(deltas.totals.s50).toBe(1);
    expect(deltas.paths.get("/blog/x")?.s75).toBeUndefined();
    expect(deltas.maxScroll).toBe(50);
  });

  it("groups clicks by kind and target so one destination is one row", () => {
    const click = (h: string): AnalyticsEvent => ({
      t: "click",
      pid: PAGE,
      p: "/",
      ts: 1,
      seq: 2,
      k: "external",
      h,
    });
    const deltas = mergeDeltas([click("github.com"), click("github.com"), click("doi.org")], ctx());
    expect(deltas.totals.clicks).toBe(3);
    expect(deltas.totals.clicks_external).toBe(3);
    expect(deltas.links.get("external#github.com")?.clicks).toBe(2);
    expect(deltas.links.get("external#doi.org")?.clicks).toBe(1);
  });

  describe("exits", () => {
    const exits = (outcome: ExitOutcome) => new Map([[PAGE, outcome]]);

    it("counts a first exit into the histogram and the sum", () => {
      const deltas = mergeDeltas([exit(187_432, "/blog/x")], ctx({ exits: exits({ first: true }) }));
      expect(deltas.totals.exits).toBe(1);
      expect(deltas.totals.dwellMsCount).toBe(1);
      expect(deltas.totals.dwellMsSum).toBe(187_432);
      expect(deltas.totals.dwellB7).toBe(1);
      expect(deltas.paths.get("/blog/x")?.dwellB7).toBe(1);
      expect(deltas.meta.dwellMsTotal).toBe(187_432);
    });

    it("moves a superseding exit between buckets without recounting it", () => {
      // The reader tabbed away at 45s and came back to finish at 187s. The exit
      // count must not move, but the duration has to leave its old bucket or
      // every backgrounded visit quietly drags the median down.
      const deltas = mergeDeltas(
        [exit(187_432, "/blog/x")],
        ctx({ exits: exits({ first: false, previousMs: 45_000 }) })
      );
      expect(deltas.totals.exits).toBeUndefined();
      expect(deltas.totals.dwellMsCount).toBeUndefined();
      expect(deltas.totals.dwellMsSum).toBe(142_432);
      expect(deltas.totals.dwellB5).toBe(-1);
      expect(deltas.totals.dwellB7).toBe(1);
      expect(deltas.paths.get("/blog/x")?.dwellB5).toBe(-1);
    });

    it("leaves the histogram alone when a supersession stays in one bucket", () => {
      const deltas = mergeDeltas(
        [exit(130_000, "/blog/x")],
        ctx({ exits: exits({ first: false, previousMs: 125_000 }) })
      );
      expect(deltas.totals.dwellMsSum).toBe(5_000);
      expect(deltas.totals.dwellB7).toBeUndefined();
    });

    it("counts a read only when the visit was both long enough and deep enough", () => {
      const read = mergeDeltas(
        [{ ...exit(90_000, "/blog/x"), d: 80 } as AnalyticsEvent],
        ctx({ exits: exits({ first: true }) })
      );
      expect(read.totals.reads).toBe(1);
      expect(read.paths.get("/blog/x")?.reads).toBe(1);

      const tooShort = mergeDeltas(
        [{ ...exit(20_000, "/blog/x"), d: 80 } as AnalyticsEvent],
        ctx({ exits: exits({ first: true }) })
      );
      expect(tooShort.totals.reads).toBeUndefined();

      const tooShallow = mergeDeltas(
        [{ ...exit(90_000, "/blog/x"), d: 20 } as AnalyticsEvent],
        ctx({ exits: exits({ first: true }) })
      );
      expect(tooShallow.totals.reads).toBeUndefined();
    });

    it("promotes a glance to a read when they come back and finish", () => {
      const deltas = mergeDeltas(
        [{ ...exit(120_000, "/blog/x"), d: 80 } as AnalyticsEvent],
        ctx({ exits: exits({ first: false, previousMs: 20_000, previousDepth: 80 }) })
      );
      expect(deltas.totals.reads).toBe(1);
    });

    it("does not double count a read that was already one", () => {
      const deltas = mergeDeltas(
        [{ ...exit(200_000, "/blog/x"), d: 90 } as AnalyticsEvent],
        ctx({ exits: exits({ first: false, previousMs: 120_000, previousDepth: 90 }) })
      );
      expect(deltas.totals.reads).toBeUndefined();
    });

    it("contributes nothing when the exit row could not be written", () => {
      // No outcome means the conditional put failed for a reason other than
      // supersession, so a counter here would have no row behind it.
      const deltas = mergeDeltas([exit(60_000)], ctx({ exits: new Map() }));
      expect(deltas.totals.exits).toBeUndefined();
      expect(deltas.totals.dwellMsSum).toBeUndefined();
    });

    it("records the last exit path for the session summary", () => {
      const deltas = mergeDeltas(
        [exit(1_000, "/blog/x", 9, PAGE), exit(2_000, "/cv", 10, PAGE)],
        ctx({ exits: exits({ first: true }) })
      );
      expect(deltas.exitPath).toBe("/cv");
    });
  });

  it("counts an agent console open on both the totals and the session", () => {
    const deltas = mergeDeltas(
      [{ t: "agent_open", pid: PAGE, p: "/projects/finlaw-uk", ts: 1, seq: 4, src: "chip" }],
      ctx()
    );
    expect(deltas.totals.agentOpens).toBe(1);
    expect(deltas.meta.agentOpens).toBe(1);
  });
});
