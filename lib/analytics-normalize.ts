import { PROJECTS } from "./constants";
import {
  AGENT_OPEN_SOURCES,
  ANALYTICS_SCHEMA_VERSION,
  DWELL_CEILING_SLACK_MS,
  EVENT_TYPES,
  EXIT_REASONS,
  LINK_KINDS,
  MAX_BATCH_ID_LENGTH,
  MAX_DWELL_MS,
  MAX_EVENTS_PER_BATCH,
  MAX_PAGE_ID_LENGTH,
  MAX_PATH_LENGTH,
  MAX_SESSION_ID_LENGTH,
  MAX_TARGET_LENGTH,
  SCROLL_MILESTONES,
  type AnalyticsBatch,
  type AnalyticsEvent,
} from "./analytics-events";

/**
 * Validation, normalisation and abuse defence for the ingest route.
 *
 * Server only. It imports PROJECTS, so importing it from a client component
 * would ship every project description and case-study blurb to every visitor.
 * Everything here is pure, so the whole abuse surface is unit testable.
 */

// ─── Paths ────────────────────────────────────────────────────────

const STATIC_PATHS = new Set(["/", "/blog", "/projects"]);
const PROJECT_PATHS = new Set(PROJECTS.map((p) => `/projects/${p.id}`));

/**
 * Blog slugs are created by the admin at runtime and published without a
 * rebuild, so a build-time allowlist would bucket every new post into /other,
 * which is exactly where reading depth matters most. Fetching the live slug
 * list here would put a table scan on the beacon path. A shape check bounds the
 * key space by charset and length instead, and the route rate limit bounds how
 * fast anyone can walk that space.
 */
const BLOG_SLUG = /^\/blog\/[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

/** Everything unrecognised shares one rollup key, so junk cannot mint dimensions. */
export const OVERFLOW_PATH = "/other";

export type PathClass = "static" | "project" | "blog" | "unknown";

export function normalizePath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) return "/";
  // Query and hash are dropped so ?utm= cannot mint unlimited distinct keys.
  const path = raw.split(/[?#]/)[0] || "/";
  return path.length > MAX_PATH_LENGTH ? path.slice(0, MAX_PATH_LENGTH) : path;
}

export function classifyPath(path: string): PathClass {
  if (STATIC_PATHS.has(path)) return "static";
  // dynamicParams is false on /projects/[slug], so anything else is a hard 404.
  if (PROJECT_PATHS.has(path)) return "project";
  if (BLOG_SLUG.test(path)) return "blog";
  return "unknown";
}

/**
 * The path a rollup counter is keyed on.
 *
 * The raw event row keeps the real path even when unknown, because a 404 people
 * actually reach is information about a broken inbound link. Only the
 * aggregates collapse, and only because their key space has to stay bounded.
 */
export function pathForRollup(path: string): string {
  return classifyPath(path) === "unknown" ? OVERFLOW_PATH : path;
}

// ─── Referrers, countries, targets ────────────────────────────────

const HOST_SHAPE = /^[a-z0-9][a-z0-9.-]{0,63}$/;

export const DIRECT_REFERRER = "direct";
export const OTHER_REFERRER = "other";

/**
 * Referer is caller-controlled and is the one genuinely unbounded dimension, so
 * it gets three defences: it is recorded once per session rather than per
 * pageview, it is shape-validated here, and the route is rate limited.
 */
export function normalizeReferrerHost(raw: unknown, ownHost?: string): string {
  if (typeof raw !== "string" || raw.trim() === "") return DIRECT_REFERRER;
  const host = raw.trim().toLowerCase().replace(/^www\./, "");
  if (!HOST_SHAPE.test(host)) return OTHER_REFERRER;
  if (ownHost && host === ownHost.toLowerCase().replace(/^www\./, "")) return DIRECT_REFERRER;
  return host;
}

export const UNKNOWN_COUNTRY = "XX";

export function normalizeCountry(raw: unknown): string {
  if (typeof raw !== "string") return UNKNOWN_COUNTRY;
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : UNKNOWN_COUNTRY;
}

/** Drops every character at or below space, plus DEL, without a control-char literal. */
function stripControls(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 0x20 && code !== 0x7f) out += value[i];
  }
  return out;
}

export function normalizeLinkTarget(raw: unknown): string {
  if (typeof raw !== "string") return OTHER_REFERRER;
  const target = stripControls(raw);
  if (!target) return OTHER_REFERRER;
  return target.length > MAX_TARGET_LENGTH ? target.slice(0, MAX_TARGET_LENGTH) : target;
}

// ─── User agents ──────────────────────────────────────────────────

/**
 * Bot traffic is dropped before anything is written.
 *
 * This matters more than any of the clamping: on a personal portfolio the
 * preview fetchers behind LinkedIn, Slack and Google, plus whatever uptime
 * checker a recruiter's tooling drags along, can plausibly outnumber the
 * humans, and a dashboard that counts them is worse than no dashboard.
 */
const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python-requests|facebookexternalhit|linkedinbot|slackbot|whatsapp|telegram|discordbot|embedly|pingdom|uptime|gtmetrix|semrush|ahrefs|dataprovider|phantomjs|puppeteer|playwright/i;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  // A beacon arriving with no user agent at all is not a browser.
  if (!userAgent) return true;
  return BOT_UA.test(userAgent);
}

export type DeviceClass = "mobile" | "tablet" | "desktop";

/**
 * Order matters: an iPad reports "Mobile" in its user agent, so tablet has to
 * be tested first or every tablet is counted as a phone.
 */
export function deviceClassFromUserAgent(userAgent: string | null | undefined): DeviceClass {
  if (!userAgent) return "desktop";
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|IEMobile|Opera Mini/i.test(userAgent)) return "mobile";
  return "desktop";
}

// ─── Dwell ────────────────────────────────────────────────────────

export interface ClampedDwell {
  dwellMs: number;
  clamped: boolean;
}

/**
 * The client dwell figure is an upper-bound proposal, not a measurement.
 *
 * serverCeilingMs is how long the server has actually known about this session,
 * which arrives free in the write path ReturnValues response. A session first
 * seen twelve seconds ago cannot report four minutes, which kills the cheapest
 * spoof at no extra read.
 */
export function clampDwellMs(clientMs: unknown, serverCeilingMs?: number): ClampedDwell | null {
  if (typeof clientMs !== "number" || !Number.isFinite(clientMs)) return null;
  const proposed = Math.max(0, Math.trunc(clientMs));

  let dwellMs = Math.min(proposed, MAX_DWELL_MS);
  if (typeof serverCeilingMs === "number" && Number.isFinite(serverCeilingMs)) {
    dwellMs = Math.min(dwellMs, Math.max(0, Math.trunc(serverCeilingMs) + DWELL_CEILING_SLACK_MS));
  }

  return { dwellMs, clamped: dwellMs !== proposed };
}

// ─── Batch validation ─────────────────────────────────────────────

const ID_SHAPE = /^[A-Za-z0-9-]+$/;

const MAX_CLOCK_SKEW_PAST_MS = 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_FUTURE_MS = 5 * 60 * 1000;

export type BatchResult = { ok: true; batch: AnalyticsBatch } | { ok: false; reason: string };

function validId(value: unknown, max: number): value is string {
  return (
    typeof value === "string" && value.length >= 8 && value.length <= max && ID_SHAPE.test(value)
  );
}

function clampTimestamp(raw: unknown, now: number): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return now;
  return Math.min(
    Math.max(Math.trunc(raw), now - MAX_CLOCK_SKEW_PAST_MS),
    now + MAX_CLOCK_SKEW_FUTURE_MS
  );
}

/**
 * A malformed batch is rejected; a malformed event inside a valid batch is
 * dropped. One bad event must not lose the eight good ones next to it, and a
 * client bug should degrade rather than fail.
 */
export function validateBatch(body: unknown, now: number = Date.now()): BatchResult {
  if (typeof body !== "object" || body === null) return { ok: false, reason: "not an object" };
  const raw = body as Record<string, unknown>;

  // The version field is why a schema change later is a deploy rather than a
  // data-corruption incident.
  if (raw.v !== ANALYTICS_SCHEMA_VERSION) return { ok: false, reason: "bad version" };
  if (!validId(raw.sid, MAX_SESSION_ID_LENGTH)) return { ok: false, reason: "bad session id" };
  if (!validId(raw.bid, MAX_BATCH_ID_LENGTH)) return { ok: false, reason: "bad batch id" };
  if (!Array.isArray(raw.events) || raw.events.length === 0) {
    return { ok: false, reason: "no events" };
  }

  // Truncate rather than reject: an over-eager client should lose its tail, not
  // its whole flush.
  const incoming = raw.events.slice(0, MAX_EVENTS_PER_BATCH);
  const events: AnalyticsEvent[] = [];

  for (const candidate of incoming) {
    const event = validateEvent(candidate, now);
    if (event) events.push(event);
  }

  if (events.length === 0) return { ok: false, reason: "no valid events" };

  return { ok: true, batch: { v: ANALYTICS_SCHEMA_VERSION, sid: raw.sid, bid: raw.bid, events } };
}

function validateEvent(candidate: unknown, now: number): AnalyticsEvent | null {
  if (typeof candidate !== "object" || candidate === null) return null;
  const raw = candidate as Record<string, unknown>;

  const type = raw.t;
  if (typeof type !== "string" || !(EVENT_TYPES as readonly string[]).includes(type)) return null;

  if (typeof raw.pid !== "string" || raw.pid.length === 0) return null;
  const pid = raw.pid.slice(0, MAX_PAGE_ID_LENGTH);

  if (typeof raw.seq !== "number" || !Number.isFinite(raw.seq)) return null;
  const seq = Math.max(0, Math.trunc(raw.seq));

  const base = { pid, p: normalizePath(raw.p), ts: clampTimestamp(raw.ts, now), seq };

  switch (type) {
    case "pageview": {
      const ref = typeof raw.ref === "string" ? raw.ref : undefined;
      return ref ? { ...base, t: "pageview", ref } : { ...base, t: "pageview" };
    }
    case "scroll": {
      const depth = raw.d;
      if (typeof depth !== "number" || !(SCROLL_MILESTONES as readonly number[]).includes(depth)) {
        return null;
      }
      return { ...base, t: "scroll", d: depth as (typeof SCROLL_MILESTONES)[number] };
    }
    case "click": {
      const kind = raw.k;
      if (typeof kind !== "string" || !(LINK_KINDS as readonly string[]).includes(kind)) return null;
      return {
        ...base,
        t: "click",
        k: kind as (typeof LINK_KINDS)[number],
        h: normalizeLinkTarget(raw.h),
      };
    }
    case "exit": {
      const dwell = clampDwellMs(raw.ms);
      if (!dwell) return null;
      const reason = raw.r;
      if (typeof reason !== "string" || !(EXIT_REASONS as readonly string[]).includes(reason)) {
        return null;
      }
      const depth = typeof raw.d === "number" && Number.isFinite(raw.d) ? raw.d : 0;
      return {
        ...base,
        t: "exit",
        ms: dwell.dwellMs,
        d: Math.min(100, Math.max(0, Math.trunc(depth))),
        r: reason as (typeof EXIT_REASONS)[number],
      };
    }
    case "agent_open": {
      const source = raw.src;
      if (
        typeof source !== "string" ||
        !(AGENT_OPEN_SOURCES as readonly string[]).includes(source)
      ) {
        return null;
      }
      return { ...base, t: "agent_open", src: source as (typeof AGENT_OPEN_SOURCES)[number] };
    }
    default:
      return null;
  }
}
