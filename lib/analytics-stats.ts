import {
  DWELL_BUCKET_COUNT,
  DWELL_BUCKET_LOWER_MS,
  dwellBucketAttr,
  dwellBucketUpperMs,
} from "./analytics-schema";

/**
 * Statistics over the additive rollup counters.
 *
 * Everything here is pure and works on plain numbers, so the read layer can be
 * tested without a table and the dashboard can call it from a server component
 * without touching AWS.
 */

export type Histogram = number[];

/**
 * Reads the twelve dwellB* attributes off a rollup row into a dense array.
 *
 * Takes `object` rather than Record<string, unknown> so the declared row
 * interfaces can be passed directly: an interface has no implicit index
 * signature, and widening the row types just to satisfy this would lose the
 * per-field checking that makes them worth declaring.
 */
export function histogramFromRow(row: object): Histogram {
  const source = row as Record<string, unknown>;
  const counts: Histogram = [];
  for (let i = 0; i < DWELL_BUCKET_COUNT; i++) {
    const raw = source[dwellBucketAttr(i)];
    counts.push(typeof raw === "number" && Number.isFinite(raw) ? raw : 0);
  }
  return counts;
}

/**
 * Adds histograms elementwise. This is the property the whole approach rests
 * on: a range median is the interpolation of the summed buckets, not a median
 * of medians, which would be wrong.
 */
export function sumHistograms(histograms: Histogram[]): Histogram {
  const total: Histogram = new Array(DWELL_BUCKET_COUNT).fill(0);
  for (const h of histograms) {
    for (let i = 0; i < DWELL_BUCKET_COUNT && i < h.length; i++) {
      total[i] += h[i] ?? 0;
    }
  }
  return total;
}

export function histogramTotal(counts: Histogram): number {
  let n = 0;
  for (const c of counts) n += c;
  return n;
}

/**
 * Linear interpolation inside the bucket that contains the requested quantile.
 *
 * Returns null for an empty histogram rather than 0, because "nobody stayed any
 * time" and "nobody came" are different claims and the caller must not conflate
 * them.
 */
export function percentileFromHistogram(counts: Histogram, p: number): number | null {
  const n = histogramTotal(counts);
  if (n === 0) return null;

  const target = n * Math.min(Math.max(p, 0), 1);
  let cumulative = 0;

  for (let i = 0; i < DWELL_BUCKET_COUNT; i++) {
    const inBucket = counts[i] ?? 0;
    if (inBucket === 0) continue;

    if (cumulative + inBucket >= target) {
      const lo = DWELL_BUCKET_LOWER_MS[i];
      const width = dwellBucketUpperMs(i) - lo;
      if (width <= 0) return lo;
      return Math.round(lo + (width * (target - cumulative)) / inBucket);
    }
    cumulative += inBucket;
  }

  // Only reachable through floating point drift at exactly p = 1.
  return DWELL_BUCKET_LOWER_MS[DWELL_BUCKET_COUNT - 1];
}

export function medianFromHistogram(counts: Histogram): number | null {
  return percentileFromHistogram(counts, 0.5);
}

/**
 * The span the observations actually fell within: the lower edge of the lowest
 * populated bucket to the upper edge of the highest.
 *
 * Used instead of a median when there are too few samples for one. With a
 * single observation the interpolation necessarily lands on the bucket
 * midpoint, so a 4m12s read renders as "6m", which is a fabricated point
 * estimate presented with more confidence than the data supports. A range is
 * the honest form: we genuinely know it fell between these two numbers.
 */
export function histogramRange(counts: Histogram): { lo: number; hi: number } | null {
  let first = -1;
  let last = -1;
  for (let i = 0; i < DWELL_BUCKET_COUNT; i++) {
    if ((counts[i] ?? 0) > 0) {
      if (first === -1) first = i;
      last = i;
    }
  }
  if (first === -1) return null;

  const hi = dwellBucketUpperMs(last);
  const lo = DWELL_BUCKET_LOWER_MS[first];
  // The top bucket has zero width by design, so guard against an inverted span.
  return { lo, hi: Math.max(hi, lo) };
}

/** Sums a set of numeric counters across rollup rows, skipping absent attributes. */
export function sumCounters<K extends string>(
  rows: readonly object[],
  keys: readonly K[]
): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const key of keys) out[key] = 0;
  for (const row of rows) {
    const source = row as Record<string, unknown>;
    for (const key of keys) {
      const raw = source[key];
      if (typeof raw === "number" && Number.isFinite(raw)) out[key] += raw;
    }
  }
  return out;
}

export interface ReadDepth {
  d25: number;
  d50: number;
  d75: number;
  d100: number;
}

/**
 * Scroll reach as a fraction of views.
 *
 * Clamped to 1 because the milestone counters and the view counter are
 * incremented by different events: a page restored from bfcache can cross a
 * milestone again without a matching pageview, which would otherwise render a
 * bar past the end of its track.
 */
export function readDepth(row: { views?: number; s25?: number; s50?: number; s75?: number; s100?: number }): ReadDepth | null {
  const views = row.views ?? 0;
  if (views <= 0) return null;
  const ratio = (n: number | undefined) => Math.min(1, (n ?? 0) / views);
  return {
    d25: ratio(row.s25),
    d50: ratio(row.s50),
    d75: ratio(row.s75),
    d100: ratio(row.s100),
  };
}
