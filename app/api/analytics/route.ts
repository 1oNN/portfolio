import { NextRequest, NextResponse } from "next/server";

import { MAX_ANALYTICS_BODY_BYTES } from "@/lib/analytics-events";
import {
  deviceClassFromUserAgent,
  isBotUserAgent,
  normalizeCountry,
  normalizeReferrerHost,
  validateBatch,
} from "@/lib/analytics-normalize";
import { isAnalyticsConfigured } from "@/lib/analytics-db";
import { getVisitorSalt, computeVisitorId } from "@/lib/analytics-salt";
import { recordBatchIfConfigured } from "@/lib/analytics-write";
import { utcDate } from "@/lib/analytics-schema";
import { bodyTooLarge, clientIp, createRateLimiter } from "@/lib/rate-limit";

/**
 * The analytics beacon collector.
 *
 * Node runtime is not the default here by accident: node:crypto's synchronous
 * createHash and the AWS SDK both need it. On the Edge runtime the visitor hash
 * would have to become an awaited crypto.subtle.digest.
 */
export const runtime = "nodejs";

/**
 * 200 batches per ten minutes per IP.
 *
 * Sizing: an engaged reader produces roughly nine events per page, which is two
 * to four flushes, so a ten-page session is about thirty. A shared egress, a
 * university or an office, can multiplex ten of those at once. 200 clears that
 * comfortably and still bounds the worst case at 5,000 events per IP per window.
 *
 * As lib/rate-limit.ts documents, these counters live in one Lambda instance's
 * memory and reset on a cold start, so this raises the cost of abuse rather than
 * enforcing a cap. Anything that must actually hold a limit belongs in a
 * CloudFront WAF rule in front, not in this process.
 */
const checkAnalyticsRateLimit = createRateLimiter({ limit: 200, windowMs: 10 * 60 * 1000 });

/**
 * Amplify fronts the SSR Lambda with a managed CloudFront distribution, and the
 * viewer-country header only reaches the origin if the origin request policy
 * forwards it. Amplify does not expose that setting, so it had to be confirmed
 * empirically: verified arriving in production on 2026-08-27, giving a correct
 * GB on a real request. The other names are kept as fallbacks in case the site
 * ever moves behind a different CDN.
 */
const COUNTRY_HEADERS = [
  "cloudfront-viewer-country",
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-country",
];

let loggedHeaderNames = false;

function readCountry(req: NextRequest): string {
  for (const name of COUNTRY_HEADERS) {
    const value = req.headers.get(name);
    if (value) return normalizeCountry(value);
  }

  // Kept as a regression canary rather than deleted now the header is
  // confirmed: if CloudFront ever stops forwarding it, every visit silently
  // becomes XX and nothing else would say why. One line per Lambda instance,
  // and only when the header is genuinely absent. Names only, never values,
  // because the header set includes cookies and forwarded addresses.
  if (!loggedHeaderNames) {
    loggedHeaderNames = true;
    console.info("[/api/analytics] no country header; saw:", [...req.headers.keys()].join(","));
  }
  return normalizeCountry(null);
}

function ownHost(): string | undefined {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
}

/**
 * Always 204, including on rejection.
 *
 * Nothing consumes the body, sendBeacon ignores it, and returning no detail
 * removes an oracle for probing which paths the allowlist recognises. The
 * status codes below still differentiate for anyone reading CloudWatch.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!checkAnalyticsRateLimit(clientIp(req))) {
    return new NextResponse(null, { status: 429 });
  }
  if (bodyTooLarge(req, MAX_ANALYTICS_BODY_BYTES)) {
    return new NextResponse(null, { status: 413 });
  }

  const userAgent = req.headers.get("user-agent");

  // Dropped before anything is parsed or written. On a personal portfolio the
  // preview fetchers behind LinkedIn, Slack and Google can plausibly outnumber
  // the humans, and a dashboard that counts them is worse than none.
  if (isBotUserAgent(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  let parsed: unknown;
  try {
    // Read as text and measure before parsing. bodyTooLarge reads content-length
    // and its own comment notes it cannot see a chunked request that omits the
    // header; sendBeacon always sets it, but a hand-rolled client need not.
    const raw = await req.text();
    if (raw.length > MAX_ANALYTICS_BODY_BYTES) {
      return new NextResponse(null, { status: 413 });
    }
    parsed = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const now = Date.now();
  const result = validateBatch(parsed, now);
  if (!result.ok) {
    return new NextResponse(null, { status: 400 });
  }

  if (!isAnalyticsConfigured()) {
    await recordBatchIfConfigured(
      {
        batch: result.batch,
        visitorId: "",
        country: "XX",
        device: "desktop",
        date: utcDate(new Date(now)),
        now,
      },
      false
    );
    return new NextResponse(null, { status: 204 });
  }

  // The server assigns the day from its own receive time. A client clock never
  // decides which rollup a row lands in, and the salt rotates on the same
  // boundary so a visitor id is stable within the day it is counted in.
  const date = utcDate(new Date(now));

  try {
    const salt = await getVisitorSalt(date);
    // The raw address and user agent are used here and then dropped. Neither is
    // stored on any row, so the hash has no preimage anywhere in the table.
    const visitorId = computeVisitorId(clientIp(req), userAgent ?? "", salt);

    const firstPageview = result.batch.events.find((event) => event.t === "pageview");
    const referrerHost =
      firstPageview && firstPageview.t === "pageview" && firstPageview.ref
        ? normalizeReferrerHost(firstPageview.ref, ownHost())
        : undefined;

    await recordBatchIfConfigured(
      {
        batch: result.batch,
        visitorId,
        country: readCountry(req),
        device: deviceClassFromUserAgent(userAgent),
        referrerHost,
        date,
        now,
      },
      true
    );
  } catch (err) {
    // Detail stays in CloudWatch and never reaches the response body. A failed
    // beacon must not surface to the visitor in any form.
    console.error("[/api/analytics] ingest failed:", err);
  }

  return new NextResponse(null, { status: 204 });
}
