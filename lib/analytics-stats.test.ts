import { describe, it, expect } from "vitest";
import {
  histogramFromRow,
  histogramRange,
  histogramTotal,
  medianFromHistogram,
  percentileFromHistogram,
  readDepth,
  sumCounters,
  sumHistograms,
} from "./analytics-stats";
import { DWELL_BUCKET_COUNT } from "./analytics-schema";

// The histogram is the only reason a ninety-day median is affordable, so these
// tests pin the interpolation rather than trusting it to look about right.

/** Builds a dense histogram from a sparse {bucketIndex: count} map. */
function hist(spec: Record<number, number>): number[] {
  const counts = new Array(DWELL_BUCKET_COUNT).fill(0);
  for (const [i, n] of Object.entries(spec)) counts[Number(i)] = n;
  return counts;
}

describe("medianFromHistogram", () => {
  it("returns null for an empty histogram rather than zero", () => {
    // "Nobody stayed any time" and "nobody came" are different claims.
    expect(medianFromHistogram(hist({}))).toBeNull();
  });

  it("interpolates to the midpoint of a single populated bucket", () => {
    // B3 is [7s, 15s). Ten observations, so the median sits half way in.
    expect(medianFromHistogram(hist({ 3: 10 }))).toBe(11_000);
  });

  it("interpolates across a bucket boundary", () => {
    // B0 [0,1s) has 4, B1 [1s,3s) has 6. Target is 5, so one sixth into B1.
    expect(medianFromHistogram(hist({ 0: 4, 1: 6 }))).toBe(1_333);
  });

  it("returns the clamp value when everything landed in the overflow bucket", () => {
    // The top bucket has zero width on purpose: every value in it hit the
    // thirty-minute ceiling, so interpolating would invent precision.
    expect(medianFromHistogram(hist({ 11: 7 }))).toBe(1_800_000);
  });

  it("lands at the top of the lower bucket when two observations straddle a gap", () => {
    // Any value between the two is a defensible median; the standard
    // convention picks the bucket where the cumulative count first reaches
    // n/2, which is the lower one.
    expect(medianFromHistogram(hist({ 0: 1, 5: 1 }))).toBe(1_000);
  });

  it("skips empty buckets when locating the median bucket", () => {
    // B0 has 1, B5 [30s,60s) has 9. Target is 5, so four ninths into B5.
    expect(medianFromHistogram(hist({ 0: 1, 5: 9 }))).toBe(43_333);
  });

  it("is unaffected by how far into the tail the outliers sit", () => {
    // This is the actual reason the dashboard reports a median: clamping piles
    // mass at the ceiling, which would drag a mean but cannot move this.
    const near = medianFromHistogram(hist({ 2: 9, 9: 1 }));
    const far = medianFromHistogram(hist({ 2: 9, 11: 1 }));
    expect(near).toBe(far);
  });
});

describe("histogramRange", () => {
  it("reports the span a single observation actually fell in", () => {
    // B8 is [4m, 8m). A 4m12s read interpolates to a 6m "median", which is a
    // point estimate one sample cannot support. The range does not invent it.
    const span = histogramRange(hist({ 8: 1 }));
    expect(span).toEqual({ lo: 240_000, hi: 480_000 });
  });

  it("spans from the lowest populated bucket to the highest", () => {
    expect(histogramRange(hist({ 2: 1, 6: 1, 7: 1 }))).toEqual({ lo: 3_000, hi: 240_000 });
  });

  it("returns null for an empty histogram", () => {
    expect(histogramRange(hist({}))).toBeNull();
  });

  it("does not invert on the zero-width top bucket", () => {
    const span = histogramRange(hist({ 11: 2 }));
    expect(span).not.toBeNull();
    expect(span!.hi).toBeGreaterThanOrEqual(span!.lo);
  });
});

describe("percentileFromHistogram", () => {
  it("puts p0 at the bottom of the first populated bucket", () => {
    expect(percentileFromHistogram(hist({ 4: 10 }), 0)).toBe(15_000);
  });

  it("orders p50 below p90", () => {
    const counts = hist({ 1: 5, 4: 5, 8: 5 });
    const p50 = percentileFromHistogram(counts, 0.5)!;
    const p90 = percentileFromHistogram(counts, 0.9)!;
    expect(p50).toBeLessThan(p90);
  });

  it("clamps an out-of-range p instead of throwing", () => {
    expect(percentileFromHistogram(hist({ 2: 4 }), -1)).toBe(3_000);
    expect(percentileFromHistogram(hist({ 2: 4 }), 5)).not.toBeNull();
  });
});

describe("sumHistograms", () => {
  it("adds elementwise so a range median is one interpolation over summed buckets", () => {
    const summed = sumHistograms([hist({ 1: 2, 3: 1 }), hist({ 1: 3, 7: 4 })]);
    expect(summed[1]).toBe(5);
    expect(summed[3]).toBe(1);
    expect(summed[7]).toBe(4);
    expect(histogramTotal(summed)).toBe(10);
  });

  it("returns a zeroed histogram for no rows", () => {
    expect(histogramTotal(sumHistograms([]))).toBe(0);
  });

  it("gives the same median as pooling the observations", () => {
    const a = hist({ 0: 4 });
    const b = hist({ 1: 6 });
    expect(medianFromHistogram(sumHistograms([a, b]))).toBe(
      medianFromHistogram(hist({ 0: 4, 1: 6 }))
    );
  });
});

describe("histogramFromRow", () => {
  it("treats absent bucket attributes as zero", () => {
    const counts = histogramFromRow({ dwellB2: 3, views: 99 });
    expect(counts).toHaveLength(DWELL_BUCKET_COUNT);
    expect(counts[2]).toBe(3);
    expect(counts[0]).toBe(0);
    expect(histogramTotal(counts)).toBe(3);
  });

  it("ignores a non-numeric attribute rather than producing NaN", () => {
    expect(histogramTotal(histogramFromRow({ dwellB1: "seven" }))).toBe(0);
  });
});

describe("sumCounters", () => {
  it("sums the requested keys and skips missing ones", () => {
    const out = sumCounters([{ views: 3, clicks: 1 }, { views: 4 }], ["views", "clicks"]);
    expect(out).toEqual({ views: 7, clicks: 1 });
  });

  it("returns zeros for no rows so the dashboard renders 0, not undefined", () => {
    expect(sumCounters([], ["views"])).toEqual({ views: 0 });
  });
});

describe("readDepth", () => {
  it("returns fractions of views", () => {
    expect(readDepth({ views: 10, s25: 8, s50: 6, s75: 4, s100: 2 })).toEqual({
      d25: 0.8,
      d50: 0.6,
      d75: 0.4,
      d100: 0.2,
    });
  });

  it("returns null with no views instead of dividing by zero", () => {
    expect(readDepth({ views: 0, s25: 3 })).toBeNull();
  });

  it("clamps past 100 percent, because bfcache can recross a milestone", () => {
    expect(readDepth({ views: 2, s25: 5 })?.d25).toBe(1);
  });
});
