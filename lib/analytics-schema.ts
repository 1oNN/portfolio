import type { LinkKind } from "./analytics-events";

/**
 * Key builders and the storage-side constants for the analytics table.
 *
 * Pure by design: no AWS import and no process.env read, so every rule in here
 * is unit testable and nothing that imports it drags in the SDK. The table name
 * lives in lib/analytics-db.ts, which is the module allowed to know about the
 * environment.
 */

export const GSI1_NAME = "gsi1";
export const TTL_ATTR = "ttl";

/** Raw events and session summaries. Rollups are kept forever and get no ttl. */
export const RETENTION_DAYS = 90;

/**
 * Replay markers, unique-visitor markers and salts.
 *
 * Two days rather than one because at 00:00:30 a batch may still be finalising
 * an exit that logically belongs to yesterday. TTL deletion is best effort and
 * can lag up to 48 hours anyway, so nothing may depend on this for correctness.
 */
export const MARKER_TTL_DAYS = 2;

/**
 * What counts as a read rather than a glance.
 *
 * Both halves are needed: a minute on a page you never scrolled is a tab left
 * open, and scrolling to the bottom in four seconds is a skim. Kept here so the
 * write path and the session scorer cannot drift apart.
 */
export const READ_DWELL_MS = 60_000;
export const READ_DEPTH = 50;

/** Ceiling on raw event rows per session, so one abusive tab cannot mint items without bound. */
export const MAX_EVENTS_PER_SESSION = 200;

export interface TableKey {
  pk: string;
  sk: string;
}

// ─── Session partition ────────────────────────────────────────────

export function sessionPk(sessionId: string): string {
  return `SESS#${sessionId}`;
}

/**
 * `#META` sorts before every event because "#" (0x23) is below "B" and "E".
 * That lets the trail query exclude markers with begins_with(sk, "EVT#") in the
 * key condition, so they are never read and discarded by a filter.
 */
export function sessionMetaKey(sessionId: string): TableKey {
  return { pk: sessionPk(sessionId), sk: "#META" };
}

/**
 * Zero-padded seq means lexicographic order equals true client order, and a
 * retried beacon rewrites an identical key instead of appending a duplicate.
 */
export function eventKey(sessionId: string, seq: number, eventId: string): TableKey {
  const padded = Math.max(0, Math.trunc(seq)).toString().padStart(6, "0").slice(-6);
  return { pk: sessionPk(sessionId), sk: `EVT#${padded}#${eventId.slice(0, 8)}` };
}

export function batchMarkerKey(sessionId: string, batchId: string): TableKey {
  return { pk: sessionPk(sessionId), sk: `BATCH#${batchId.slice(0, 8)}` };
}

// ─── Rollup partitions ────────────────────────────────────────────

export const AGG_TOTALS = "AGG#TOTALS";
export const AGG_PATH = "AGG#PATH";
export const AGG_REF = "AGG#REF";
export const AGG_GEO = "AGG#GEO";
export const AGG_LINK = "AGG#LINK";

export function aggTotalsKey(date: string): TableKey {
  return { pk: AGG_TOTALS, sk: date };
}

export function aggPathKey(date: string, path: string): TableKey {
  return { pk: AGG_PATH, sk: `${date}#${path}` };
}

export function aggRefKey(date: string, host: string): TableKey {
  return { pk: AGG_REF, sk: `${date}#${host}` };
}

export function aggGeoKey(date: string, country: string): TableKey {
  return { pk: AGG_GEO, sk: `${date}#${country}` };
}

export function aggLinkKey(date: string, kind: LinkKind, target: string): TableKey {
  return { pk: AGG_LINK, sk: `${date}#${kind}#${target}` };
}

export function visitorMarkerKey(date: string, visitorId: string): TableKey {
  return { pk: `VIS#${date}`, sk: visitorId };
}

export function saltKey(date: string): TableKey {
  return { pk: "SALT", sk: date };
}

export function sessionsIndexPk(date: string): string {
  return `SESSIONS#${date}`;
}

export function sessionsIndexSk(startedAt: string, sessionId: string): string {
  return `${startedAt}#${sessionId}`;
}

// ─── Range queries ────────────────────────────────────────────────

/**
 * Inclusive lower and exclusive upper bounds for a `sk BETWEEN` over a
 * `<date>#<value>` sort key.
 *
 * The upper bound is the next day plus "#". Since "#" (0x23) sorts below every
 * character that can legitimately start a path, hostname, country code or link
 * kind ("/" is 0x2F, "-" is 0x2D, digits start at 0x30), that string sits
 * strictly above every row of the last day and strictly below every row of the
 * next. No sentinel character and no UTF-8 byte-order reasoning needed.
 */
export function rangeStart(fromDate: string): string {
  return `${fromDate}#`;
}

export function rangeEndExclusive(toDate: string): string {
  return `${addDays(toDate, 1)}#`;
}

// ─── Time ─────────────────────────────────────────────────────────

/** UTC calendar day. The server always assigns this; a client clock is never trusted. */
export function utcDate(at: Date = new Date()): string {
  return at.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const ms = Date.parse(`${date}T00:00:00.000Z`);
  return new Date(ms + days * 86_400_000).toISOString().slice(0, 10);
}

export function midnightUtcEpochSeconds(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00.000Z`) / 1000);
}

/**
 * DynamoDB TTL wants epoch SECONDS. Date.now() in milliseconds is a timestamp
 * in the year 58,000, which DynamoDB ignores, so the item silently lives
 * forever. Every ttl value in this codebase goes through one of these two
 * helpers so that conversion exists in exactly one place.
 */
export function ttlFromNow(days: number, now: number = Date.now()): number {
  return Math.floor(now / 1000) + days * 86_400;
}

export function ttlAtMidnightPlusDays(date: string, days: number): number {
  return midnightUtcEpochSeconds(date) + days * 86_400;
}

// ─── Dwell histogram ──────────────────────────────────────────────

/**
 * Lower edges of twelve roughly log-spaced dwell buckets, in milliseconds.
 *
 * Medians are not associative so they cannot be ADDed, but bucket counts are.
 * Storing these twelve counters is what lets a ninety-day median be computed as
 * "sum twelve numbers across ninety rows, then interpolate once", and what lets
 * it keep working after the raw events have expired.
 *
 * No bucket is wider than twice its lower edge, which bounds the interpolation
 * error at roughly 25 percent in the worst case. The top bucket holds only
 * values that hit the clamp.
 */
export const DWELL_BUCKET_LOWER_MS = [
  0, 1_000, 3_000, 7_000, 15_000, 30_000, 60_000, 120_000, 240_000, 480_000, 900_000, 1_800_000,
] as const;

export const DWELL_BUCKET_COUNT = DWELL_BUCKET_LOWER_MS.length;

export function dwellBucketIndex(ms: number): number {
  for (let i = DWELL_BUCKET_COUNT - 1; i >= 0; i--) {
    if (ms >= DWELL_BUCKET_LOWER_MS[i]) return i;
  }
  return 0;
}

export function dwellBucketAttr(index: number): string {
  return `dwellB${index}`;
}

/**
 * Notional upper edge. The last bucket returns its own lower edge, giving it
 * zero width, because every value in it was clamped to exactly that ceiling and
 * interpolating across an open interval would invent precision.
 */
export function dwellBucketUpperMs(index: number): number {
  return index < DWELL_BUCKET_COUNT - 1
    ? DWELL_BUCKET_LOWER_MS[index + 1]
    : DWELL_BUCKET_LOWER_MS[DWELL_BUCKET_COUNT - 1];
}
