import { describe, it, expect } from "vitest";
import {
  addDays,
  aggLinkKey,
  aggPathKey,
  aggTotalsKey,
  batchMarkerKey,
  DWELL_BUCKET_COUNT,
  DWELL_BUCKET_LOWER_MS,
  dwellBucketAttr,
  dwellBucketIndex,
  dwellBucketUpperMs,
  eventKey,
  midnightUtcEpochSeconds,
  rangeEndExclusive,
  rangeStart,
  sessionMetaKey,
  ttlAtMidnightPlusDays,
  ttlFromNow,
  utcDate,
} from "./analytics-schema";

// These are the rules that are invisible when wrong: a sort key that orders
// almost correctly, or a ttl that is quietly in the wrong unit and so never
// expires anything.

describe("session partition ordering", () => {
  it("sorts #META before markers before events", () => {
    const meta = sessionMetaKey("s1").sk;
    const batch = batchMarkerKey("s1", "abcdef123").sk;
    const event = eventKey("s1", 0, "deadbeef99").sk;
    expect(meta < batch).toBe(true);
    expect(batch < event).toBe(true);
  });

  it("zero-pads seq so lexicographic order matches client order past nine", () => {
    const ninth = eventKey("s1", 9, "aaaaaaaa").sk;
    const tenth = eventKey("s1", 10, "bbbbbbbb").sk;
    expect(ninth).toBe("EVT#000009#aaaaaaaa");
    expect(ninth < tenth).toBe(true);
  });

  it("truncates the event id so one key cannot grow without bound", () => {
    expect(eventKey("s1", 1, "0123456789abcdef").sk).toBe("EVT#000001#01234567");
  });

  it("clamps a negative seq rather than emitting a minus sign into the key", () => {
    expect(eventKey("s1", -5, "aaaaaaaa").sk).toBe("EVT#000000#aaaaaaaa");
  });
});

describe("range sentinels", () => {
  it("puts the exclusive upper bound above every row of the last day", () => {
    const upper = rangeEndExclusive("2026-08-25");
    expect(upper).toBe("2026-08-26#");
    expect("2026-08-25#/z" < upper).toBe(true);
    expect("2026-08-25#zzzz" < upper).toBe(true);
  });

  it("puts it below every row of the following day", () => {
    const upper = rangeEndExclusive("2026-08-25");
    // "#" is 0x23, below "/" 0x2F, "-" 0x2D, "." 0x2E, digits, and both cases.
    for (const first of ["/", "-", ".", "0", "9", "A", "Z", "a", "z"]) {
      expect(upper < `2026-08-26#${first}`).toBe(true);
    }
  });

  it("puts the inclusive lower bound below every row of its own day", () => {
    const lower = rangeStart("2026-07-27");
    expect(lower < "2026-07-27#/").toBe(true);
    expect(lower < "2026-07-27#GB").toBe(true);
  });

  it("brackets exactly the intended days", () => {
    const lower = rangeStart("2026-07-27");
    const upper = rangeEndExclusive("2026-07-28");
    const inside = aggPathKey("2026-07-28", "/blog/x").sk;
    const before = aggPathKey("2026-07-26", "/blog/x").sk;
    const after = aggPathKey("2026-07-29", "/blog/x").sk;
    expect(inside >= lower && inside <= upper).toBe(true);
    expect(before >= lower).toBe(false);
    expect(after <= upper).toBe(false);
  });
});

describe("time helpers", () => {
  it("rolls addDays across a month boundary", () => {
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("produces a UTC calendar day", () => {
    expect(utcDate(new Date("2026-08-25T23:59:59.000Z"))).toBe("2026-08-25");
    expect(utcDate(new Date("2026-08-26T00:00:00.000Z"))).toBe("2026-08-26");
  });

  it("emits ttl in seconds, not milliseconds", () => {
    // A millisecond timestamp is a date in the year 58,000, which DynamoDB
    // ignores, so the item silently never expires. Any value above this bound
    // means the conversion was skipped somewhere.
    const ttl = ttlFromNow(90);
    expect(ttl).toBeLessThan(1e11);
    expect(ttl).toBeGreaterThan(1e9);
  });

  it("puts a 90 day ttl 90 days out", () => {
    const now = Date.parse("2026-08-25T12:00:00.000Z");
    expect(ttlFromNow(90, now)).toBe(Math.floor(now / 1000) + 90 * 86_400);
  });

  it("anchors marker ttls to midnight so a day that has closed stays closed", () => {
    expect(ttlAtMidnightPlusDays("2026-08-25", 2)).toBe(
      midnightUtcEpochSeconds("2026-08-27")
    );
  });
});

describe("dwell buckets", () => {
  it("assigns each lower edge to its own bucket", () => {
    DWELL_BUCKET_LOWER_MS.forEach((edge, i) => {
      expect(dwellBucketIndex(edge)).toBe(i);
    });
  });

  it("assigns a value just under an edge to the bucket below", () => {
    expect(dwellBucketIndex(999)).toBe(0);
    expect(dwellBucketIndex(29_999)).toBe(4);
  });

  it("puts anything past the clamp in the top bucket", () => {
    const last = DWELL_BUCKET_COUNT - 1;
    expect(dwellBucketIndex(1_800_000)).toBe(last);
    expect(dwellBucketIndex(99_999_999)).toBe(last);
  });

  it("floors a negative at bucket zero", () => {
    expect(dwellBucketIndex(-1)).toBe(0);
  });

  it("gives the top bucket zero width so it reports its own edge", () => {
    const last = DWELL_BUCKET_COUNT - 1;
    expect(dwellBucketUpperMs(last)).toBe(DWELL_BUCKET_LOWER_MS[last]);
    expect(dwellBucketUpperMs(0)).toBe(DWELL_BUCKET_LOWER_MS[1]);
  });

  it("names attributes predictably", () => {
    expect(dwellBucketAttr(0)).toBe("dwellB0");
    expect(dwellBucketAttr(11)).toBe("dwellB11");
  });
});

describe("rollup keys", () => {
  it("is kind-major so a range is one query", () => {
    expect(aggTotalsKey("2026-08-25")).toEqual({ pk: "AGG#TOTALS", sk: "2026-08-25" });
    expect(aggPathKey("2026-08-25", "/blog/x")).toEqual({
      pk: "AGG#PATH",
      sk: "2026-08-25#/blog/x",
    });
    expect(aggLinkKey("2026-08-25", "cv-download", "/cv/ai-ml.pdf")).toEqual({
      pk: "AGG#LINK",
      sk: "2026-08-25#cv-download#/cv/ai-ml.pdf",
    });
  });
});
