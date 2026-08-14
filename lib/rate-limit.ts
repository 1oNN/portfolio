import type { NextRequest } from "next/server";

/**
 * Shared fixed-window rate limiting for the API routes.
 *
 * These counters live in the Lambda instance's memory, so they reset on a cold
 * start and are not shared across concurrent instances. That is a deliberate
 * trade for a portfolio site: it raises the cost of abuse without adding a
 * datastore. Anything that must actually hold a limit needs DynamoDB.
 */

type Entry = { count: number; resetAt: number };

/** Ceiling on tracked keys, so a caller rotating keys cannot grow the map without bound. */
const MAX_KEYS = 10_000;

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export function createRateLimiter({ limit, windowMs }: RateLimitOptions) {
  const buckets = new Map<string, Entry>();

  return function check(key: string): boolean {
    const now = Date.now();

    // Entries were previously only overwritten if the same key came back after
    // expiry, so distinct keys accumulated forever. Sweep once the map is large.
    if (buckets.size >= MAX_KEYS) {
      for (const [k, entry] of buckets) {
        if (now > entry.resetAt) buckets.delete(k);
      }
      // Still full of live entries: refuse rather than keep growing.
      if (buckets.size >= MAX_KEYS) return false;
    }

    const entry = buckets.get(key);
    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= limit) return false;
    entry.count += 1;
    return true;
  };
}

/**
 * Client address for rate-limit keying.
 *
 * Takes the RIGHTMOST x-forwarded-for entry, not the leftmost. Proxies append,
 * so every entry to the left is whatever the caller chose to send and is freely
 * spoofable; the last one was written by the hop we actually sit behind.
 * CloudFront is the only hop in front of the Amplify SSR Lambda, so that entry
 * is the address it observed.
 */
/** Default ceiling for a JSON request body. Every route here posts small objects. */
export const MAX_BODY_BYTES = 32 * 1024;

/**
 * True when the request declares a body larger than `maxBytes`.
 *
 * Checked before req.json(), because every route used to parse first and only
 * then check field lengths, so an arbitrarily large body was fully parsed into
 * memory before anything rejected it.
 *
 * This reads content-length, so it does not cover a chunked request that omits
 * the header. The platform's own payload ceiling is the backstop for that case.
 */
export function bodyTooLarge(req: NextRequest, maxBytes: number = MAX_BODY_BYTES): boolean {
  const declared = Number(req.headers.get("content-length"));
  return Number.isFinite(declared) && declared > maxBytes;
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    const nearest = hops[hops.length - 1];
    if (nearest) return nearest;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
