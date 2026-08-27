import { describe, it, expect } from "vitest";
import {
  canShowPercentDelta,
  MIN_NOTABLE,
  resolveRange,
  scoreSession,
  selectSessions,
  summarise,
  type ScoredSession,
} from "./analytics-select";
import type { SessionMeta, TrailEvent } from "@/types/analytics";

// This is the judgement layer, so these tests are really about whether the
// dashboard tells the truth at three visitors a day.

const TODAY = "2026-08-25";

function meta(over: Partial<SessionMeta> = {}): SessionMeta {
  return {
    sessionId: "s1",
    visitorId: "v1",
    date: TODAY,
    startedAt: `${TODAY}T10:00:00.000Z`,
    country: "GB",
    device: "desktop",
    referrerHost: "direct",
    ...over,
  };
}

function pageview(path: string): TrailEvent {
  return { type: "pageview", path, at: "", seq: 0, pageId: path };
}

function exitEvent(path: string, dwellMs: number, maxScroll: number): TrailEvent {
  return { type: "exit", path, at: "", seq: 1, pageId: path, dwellMs, maxScroll };
}

function click(linkKind: TrailEvent["linkKind"], linkTarget: string): TrailEvent {
  return { type: "click", path: "/", at: "", seq: 2, pageId: "/", linkKind, linkTarget };
}

function scored(over: Partial<ScoredSession> & { id: string; startedAt: string; events: TrailEvent[] }): ScoredSession {
  const m = meta({ sessionId: over.id, startedAt: over.startedAt, ...over.meta });
  return { meta: m, events: over.events, signal: scoreSession(m, over.events) };
}

describe("resolveRange", () => {
  it("defaults to 30 days, not today", () => {
    // At three visitors a day, "today" is routinely zero, and a dashboard that
    // opens empty trains its owner not to open it.
    const range = resolveRange({}, TODAY);
    expect(range.preset).toBe("30d");
    expect(range.from).toBe("2026-07-27");
    expect(range.to).toBe(TODAY);
  });

  it("resolves the presets", () => {
    expect(resolveRange({ range: "7d" }, TODAY).from).toBe("2026-08-19");
    expect(resolveRange({ range: "90d" }, TODAY).from).toBe("2026-05-28");
  });

  it("keeps a recent range inside the trail horizon", () => {
    const range = resolveRange({ range: "30d" }, TODAY);
    expect(range.beyondTrailHorizon).toBe(false);
    expect(range.trailsExpired).toBe(false);
    expect(range.trailsFrom).toBe(range.from);
  });

  it("flags a range that reaches past the 90 day horizon and clamps the trail start", () => {
    const range = resolveRange({ range: "12mo" }, TODAY);
    expect(range.beyondTrailHorizon).toBe(true);
    expect(range.trailsExpired).toBe(false);
    expect(range.trailsFrom).toBe("2026-05-28");
    // The rollups still cover the whole year; only the trails are clamped.
    expect(range.from).toBe("2025-08-26");
  });

  it("flags a range entirely older than the horizon as expired, not empty", () => {
    // "The trails expired" and "nobody visited" are different truths and must
    // never share a message.
    const range = resolveRange({ range: "custom", from: "2026-01-01", to: "2026-03-31" }, TODAY);
    expect(range.trailsExpired).toBe(true);
  });

  it("clamps a reversed or future custom range instead of erroring", () => {
    const reversed = resolveRange({ range: "custom", from: "2026-08-20", to: "2026-08-01" }, TODAY);
    expect(reversed.from).toBe("2026-08-01");
    expect(reversed.to).toBe("2026-08-20");

    const future = resolveRange({ range: "custom", from: "2026-08-01", to: "2027-01-01" }, TODAY);
    expect(future.to).toBe(TODAY);
  });

  it("falls back to the default for a junk preset", () => {
    expect(resolveRange({ range: "../../etc" }, TODAY).preset).toBe("30d");
  });
});

describe("summarise", () => {
  it("refuses a median below five samples and hands back the values", () => {
    const result = summarise([180_000, 64_000, 22_000]);
    expect(result.kind).toBe("raw");
    if (result.kind === "raw") expect(result.values).toEqual([180_000, 64_000, 22_000]);
  });

  it("computes a median at or above five samples", () => {
    const result = summarise([10, 20, 30, 40, 50]);
    expect(result).toEqual({ kind: "median", median: 30, n: 5 });
  });

  it("averages the middle pair for an even count", () => {
    const result = summarise([10, 20, 30, 40, 50, 60]);
    expect(result).toEqual({ kind: "median", median: 35, n: 6 });
  });

  it("reports nothing at all for no samples", () => {
    expect(summarise([])).toEqual({ kind: "none" });
  });
});

describe("canShowPercentDelta", () => {
  it("refuses a percentage on small integers", () => {
    // One extra visitor must never render as "+100%".
    expect(canShowPercentDelta(1, 2)).toBe(false);
    expect(canShowPercentDelta(0, 3)).toBe(false);
  });

  it("allows one once both sides are big enough to mean something", () => {
    expect(canShowPercentDelta(40, 55)).toBe(true);
  });
});

describe("scoreSession", () => {
  it("rates a CV download above everything else", () => {
    const signal = scoreSession(meta(), [pageview("/"), click("cv-download", "/cv/ai-ml.pdf")]);
    expect(signal.score).toBeGreaterThanOrEqual(60);
    expect(signal.reasons).toContain("downloaded a CV");
  });

  it("counts a proper read but not a glance", () => {
    const read = scoreSession(meta(), [pageview("/blog/x"), exitEvent("/blog/x", 90_000, 80)]);
    expect(read.deepReads).toBe(1);

    const glance = scoreSession(meta(), [pageview("/blog/x"), exitEvent("/blog/x", 9_000, 80)]);
    expect(glance.deepReads).toBe(0);

    const skim = scoreSession(meta(), [pageview("/blog/x"), exitEvent("/blog/x", 90_000, 30)]);
    expect(skim.deepReads).toBe(0);
  });

  it("credits an outbound link only when it leads to you", () => {
    const personal = scoreSession(meta(), [pageview("/"), click("external", "github.com/1oNN")]);
    const unrelated = scoreSession(meta(), [pageview("/"), click("external", "example.com/x")]);
    expect(personal.score).toBeGreaterThan(unrelated.score);
  });

  it("credits a real referrer but not a direct arrival", () => {
    const referred = scoreSession(meta({ referrerHost: "news.ycombinator.com" }), [pageview("/")]);
    const direct = scoreSession(meta({ referrerHost: "direct" }), [pageview("/")]);
    expect(referred.score).toBeGreaterThan(direct.score);
    expect(referred.reasons.some((r) => r.includes("news.ycombinator.com"))).toBe(true);
  });

  it("classifies a seven second single-page visit as a bounce", () => {
    const signal = scoreSession(meta({ maxScroll: 10 }), [
      pageview("/blog"),
      exitEvent("/blog", 7_000, 10),
    ]);
    expect(signal.bounce).toBe(true);
  });

  it("does not call it a bounce if they clicked something", () => {
    const signal = scoreSession(meta({ maxScroll: 10 }), [
      pageview("/"),
      click("mailto", "someone@example.com"),
      exitEvent("/", 7_000, 10),
    ]);
    expect(signal.bounce).toBe(false);
  });

  it("explains itself, so the filter is auditable rather than magic", () => {
    const signal = scoreSession(meta({ referrerHost: "google.com" }), [
      pageview("/blog/x"),
      exitEvent("/blog/x", 250_000, 100),
      click("cv-download", "/cv/ai-ml.pdf"),
    ]);
    expect(signal.reasons.length).toBeGreaterThan(1);
    expect(signal.reasons).toContain("downloaded a CV");
  });
});

describe("selectSessions", () => {
  const bounce = (id: string, startedAt: string) =>
    scored({ id, startedAt, events: [pageview("/"), exitEvent("/", 4_000, 10)] });

  const strong = (id: string, startedAt: string) =>
    scored({
      id,
      startedAt,
      events: [pageview("/"), click("cv-download", "/cv/ai-ml.pdf"), exitEvent("/", 120_000, 90)],
    });

  it("filters by interest but sorts by recency", () => {
    // Sorting by score would pin the same great visit to the top forever, so
    // the strongest session here is deliberately also the oldest.
    const sessions = [
      strong("strongest-and-oldest", "2026-08-18T10:00:00.000Z"),
      strong("middle", "2026-08-20T10:00:00.000Z"),
      scored({
        id: "newer",
        startedAt: "2026-08-24T10:00:00.000Z",
        events: [pageview("/"), pageview("/blog"), exitEvent("/blog", 70_000, 60)],
      }),
      bounce("b1", "2026-08-23T10:00:00.000Z"),
    ];
    const selection = selectSessions(sessions, "notable");
    expect(selection.relaxed).toBe(false);
    expect(selection.shown[0].meta.sessionId).toBe("newer");
    expect(selection.shown.map((s) => s.meta.sessionId)).not.toContain("b1");
    expect(selection.hiddenCount).toBe(1);
  });

  it("reports how many it hid rather than silently dropping them", () => {
    const sessions = [
      strong("a", "2026-08-24T10:00:00.000Z"),
      strong("b", "2026-08-23T10:00:00.000Z"),
      strong("c", "2026-08-22T10:00:00.000Z"),
      bounce("b1", "2026-08-21T10:00:00.000Z"),
      bounce("b2", "2026-08-20T10:00:00.000Z"),
    ];
    const selection = selectSessions(sessions, "notable");
    expect(selection.shown).toHaveLength(3);
    expect(selection.hiddenCount).toBe(2);
    expect(selection.relaxed).toBe(false);
  });

  it("stands the filter down when there is too little to filter", () => {
    // The single most important behaviour here: hiding two of your three
    // visitors is worse than having no dashboard.
    const sessions = [
      strong("a", "2026-08-24T10:00:00.000Z"),
      bounce("b1", "2026-08-23T10:00:00.000Z"),
      bounce("b2", "2026-08-22T10:00:00.000Z"),
    ];
    const selection = selectSessions(sessions, "notable");
    expect(selection.relaxed).toBe(true);
    expect(selection.shown).toHaveLength(3);
    expect(selection.hiddenCount).toBe(0);
  });

  it("relaxes rather than showing an empty list when everything bounced", () => {
    const selection = selectSessions([bounce("b1", "2026-08-24T10:00:00.000Z")], "notable");
    expect(selection.shown).toHaveLength(1);
    expect(selection.relaxed).toBe(true);
  });

  it("only relaxes below the floor, never above it", () => {
    const many = Array.from({ length: MIN_NOTABLE }, (_, i) =>
      strong(`s${i}`, `2026-08-2${i}T10:00:00.000Z`)
    );
    expect(selectSessions([...many, bounce("b", "2026-08-01T10:00:00.000Z")], "notable").relaxed).toBe(
      false
    );
  });

  it("shows everything including bounces in all mode", () => {
    const selection = selectSessions(
      [strong("a", "2026-08-24T10:00:00.000Z"), bounce("b", "2026-08-23T10:00:00.000Z")],
      "all"
    );
    expect(selection.shown).toHaveLength(2);
    expect(selection.hiddenCount).toBe(0);
  });

  it("keeps only long, deep reads in deep mode", () => {
    const long = scored({
      id: "long",
      startedAt: "2026-08-24T10:00:00.000Z",
      events: [pageview("/blog/x"), exitEvent("/blog/x", 200_000, 90)],
    });
    const short = scored({
      id: "short",
      startedAt: "2026-08-23T10:00:00.000Z",
      events: [pageview("/blog/y"), exitEvent("/blog/y", 65_000, 90)],
    });
    const selection = selectSessions([long, short], "deep");
    expect(selection.shown.map((s) => s.meta.sessionId)).toEqual(["long"]);
    expect(selection.hiddenCount).toBe(1);
  });
});
