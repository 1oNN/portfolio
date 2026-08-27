import { describe, it, expect } from "vitest";
import { createPageTimer } from "./analytics-client";

// The tab-away, tab-back, leave sequence is the piece of the capture layer most
// likely to be quietly wrong, which is why the clock is injectable. Everything
// below runs with a fake clock and no DOM.

function harness() {
  let t = 0;
  const timer = createPageTimer(() => t);
  return {
    timer,
    advance(ms: number) {
      t += ms;
    },
  };
}

let seq = 0;
const allocate = () => seq++;

describe("createPageTimer", () => {
  it("reports nothing before a page has begun", () => {
    const { timer } = harness();
    expect(timer.state()).toBeNull();
    expect(timer.pageId()).toBeNull();
    expect(timer.takeReport()).toBeNull();
  });

  it("accumulates foreground time only", () => {
    // Read for 10s, tab away for a minute, come back and read for 20s more.
    // The answer is 30 seconds, not 90, and not 10.
    const { timer, advance } = harness();
    timer.begin("p1", "/blog/x", true);
    advance(10_000);
    timer.pause();
    advance(60_000);
    timer.resume();
    advance(20_000);
    timer.end();

    expect(timer.takeReport()?.ms).toBe(30_000);
  });

  it("includes the in-flight segment when reporting while still active", () => {
    const { timer, advance } = harness();
    timer.begin("p1", "/", true);
    advance(5_000);
    expect(timer.takeReport()?.ms).toBe(5_000);
  });

  it("accrues nothing while the page starts hidden", () => {
    // A background tab opened with ctrl-click should not bank time it never had.
    const { timer, advance } = harness();
    timer.begin("p1", "/", false);
    advance(30_000);
    expect(timer.state()).toBe("hidden");
    expect(timer.takeReport()?.ms).toBe(0);
  });

  it("sends one exit for many tab switches with no reading in between", () => {
    const { timer, advance } = harness();
    timer.begin("p1", "/", true);
    advance(10_000);

    timer.pause();
    expect(timer.takeReport()?.ms).toBe(10_000);

    // Four more flicks, each adding a few milliseconds of foreground time.
    for (let i = 0; i < 4; i++) {
      timer.resume();
      advance(20);
      timer.pause();
      expect(timer.takeReport()).toBeNull();
    }
  });

  it("reports again once a whole second of new reading has accrued", () => {
    const { timer, advance } = harness();
    timer.begin("p1", "/", true);
    advance(10_000);
    timer.pause();
    expect(timer.takeReport()?.ms).toBe(10_000);

    timer.resume();
    advance(4_000);
    timer.pause();
    expect(timer.takeReport()?.ms).toBe(14_000);
  });

  it("guards pause so a double fire cannot double count", () => {
    // Browsers disagree on whether visibilitychange or pagehide fires first
    // when navigating away, so both orders have to converge.
    const { timer, advance } = harness();
    timer.begin("p1", "/", true);
    advance(10_000);
    timer.pause();
    advance(5_000);
    timer.pause();
    expect(timer.takeReport()?.ms).toBe(10_000);
  });

  it("makes end idempotent", () => {
    const { timer, advance } = harness();
    timer.begin("p1", "/", true);
    advance(8_000);
    timer.end();
    advance(5_000);
    timer.end();
    expect(timer.state()).toBe("ended");
    expect(timer.takeReport()?.ms).toBe(8_000);
  });

  it("ignores resume unless the page is hidden", () => {
    const { timer, advance } = harness();
    timer.begin("p1", "/", true);
    advance(3_000);
    timer.resume();
    advance(3_000);
    expect(timer.takeReport()?.ms).toBe(6_000);
  });

  describe("exit seq", () => {
    it("reuses one seq for every exit report of a page", () => {
      // The sort key is derived from this, so reusing it means a resent exit
      // overwrites the row with the final duration rather than appending.
      const { timer } = harness();
      timer.begin("p1", "/", true);
      const first = timer.exitSeq(allocate);
      const second = timer.exitSeq(allocate);
      expect(second).toBe(first);
    });

    it("allocates a fresh one for the next page", () => {
      const { timer } = harness();
      timer.begin("p1", "/", true);
      const first = timer.exitSeq(allocate);
      timer.begin("p2", "/blog", true);
      expect(timer.exitSeq(allocate)).not.toBe(first);
    });
  });

  describe("scroll milestones", () => {
    it("fires each milestone once", () => {
      const { timer } = harness();
      timer.begin("p1", "/blog/x", true);
      expect(timer.observeDepth(30, true)).toEqual([25]);
      expect(timer.observeDepth(35, true)).toEqual([]);
      expect(timer.observeDepth(60, true)).toEqual([50]);
    });

    it("fires every newly crossed milestone on a jump, so the funnel stays monotonic", () => {
      const { timer } = harness();
      timer.begin("p1", "/blog/x", true);
      expect(timer.observeDepth(100, true)).toEqual([25, 50, 75, 100]);
    });

    it("emits no milestones on a page shorter than the viewport", () => {
      // Such a page is already fully scrolled at load and would fire all four
      // instantly, which is noise that ruins the read-depth funnel.
      const { timer } = harness();
      timer.begin("p1", "/", true);
      expect(timer.observeDepth(100, false)).toEqual([]);
    });

    it("still records max depth on an unscrollable page", () => {
      const { timer } = harness();
      timer.begin("p1", "/", true);
      timer.observeDepth(100, false);
      expect(timer.takeReport()?.depth).toBe(100);
    });

    it("keeps the deepest reading, not the latest", () => {
      const { timer } = harness();
      timer.begin("p1", "/blog/x", true);
      timer.observeDepth(90, true);
      timer.observeDepth(20, true);
      expect(timer.takeReport()?.depth).toBe(90);
    });

    it("resets milestones for a new page", () => {
      const { timer } = harness();
      timer.begin("p1", "/blog/x", true);
      timer.observeDepth(100, true);
      timer.begin("p2", "/blog/y", true);
      expect(timer.observeDepth(30, true)).toEqual([25]);
    });

    it("stops recording once the page has ended", () => {
      const { timer } = harness();
      timer.begin("p1", "/blog/x", true);
      timer.end();
      expect(timer.observeDepth(100, true)).toEqual([]);
    });
  });
});
