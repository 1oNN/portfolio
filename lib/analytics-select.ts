import type { RangePreset, ResolvedRange, SessionMeta, TrailEvent } from "@/types/analytics";
import { addDays, READ_DEPTH, READ_DWELL_MS, RETENTION_DAYS, utcDate } from "./analytics-schema";

/**
 * The editorial layer: which sessions are worth showing, and when a number is
 * honest enough to display.
 *
 * Deliberately pure, with no AWS import, because the judgement here IS the
 * feature. Tangled into a DynamoDB query it could never be tuned with
 * confidence; as plain functions it can be tested against fixture sessions.
 */

// ─── Ranges ───────────────────────────────────────────────────────

const PRESET_DAYS: Record<Exclude<RangePreset, "custom" | "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12mo": 365,
};

/** Far enough back to cover every rollup that will ever exist for this site. */
const ALL_TIME_DAYS = 365 * 5;

export function isRangePreset(value: unknown): value is RangePreset {
  return (
    value === "7d" ||
    value === "30d" ||
    value === "90d" ||
    value === "12mo" ||
    value === "all" ||
    value === "custom"
  );
}

function isIsoDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Resolves the range control into concrete days, and works out where it sits
 * relative to the trail horizon.
 *
 * The default is 30 days rather than today or 7 days. At three visitors a day
 * "today" is routinely zero, and a dashboard that opens empty by default trains
 * its owner not to open it.
 */
export function resolveRange(
  params: { range?: string; from?: string; to?: string } = {},
  today: string = utcDate()
): ResolvedRange {
  const preset: RangePreset = isRangePreset(params.range) ? params.range : "30d";

  let from: string;
  let to = today;

  if (preset === "custom" && isIsoDay(params.from) && isIsoDay(params.to)) {
    from = params.from;
    to = params.to;
    // Clamp rather than error. A reversed or future range is a fat-fingered URL,
    // not something worth showing an error page for.
    if (from > to) [from, to] = [to, from];
    if (to > today) to = today;
  } else if (preset === "all") {
    from = addDays(today, -ALL_TIME_DAYS);
  } else if (preset === "custom") {
    from = addDays(today, -(PRESET_DAYS["30d"] - 1));
  } else {
    from = addDays(today, -(PRESET_DAYS[preset] - 1));
  }

  // Raw events and session summaries carry a 90 day TTL; rollups are kept
  // forever. The UI has to know the difference or it silently shows an empty
  // session list for an old range and looks broken.
  const horizon = addDays(today, -(RETENTION_DAYS - 1));
  const trailsFrom = from < horizon ? horizon : from;

  return {
    from,
    to,
    preset,
    beyondTrailHorizon: from < horizon,
    trailsFrom,
    trailsExpired: to < horizon,
  };
}

// ─── The n-gate ───────────────────────────────────────────────────

/** Below this, a derived statistic claims more precision than the data supports. */
export const N_GATE = 5;

export type Summary =
  | { kind: "median"; median: number; n: number }
  | { kind: "raw"; values: number[]; n: number }
  | { kind: "none" };

/**
 * A median of three samples is a number wearing a lab coat.
 *
 * Below the gate the values themselves are returned, because a list of three
 * durations is more informative than their median and claims less. Every
 * consumer branches on `kind` rather than reaching for a number.
 */
export function summarise(values: number[]): Summary {
  const usable = values.filter((v) => Number.isFinite(v));
  if (usable.length === 0) return { kind: "none" };
  if (usable.length < N_GATE) {
    return { kind: "raw", values: [...usable].sort((a, b) => b - a), n: usable.length };
  }
  const sorted = [...usable].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
  return { kind: "median", median, n: usable.length };
}

/**
 * Percentage change on small integers is the commonest way a small-site
 * dashboard lies to its owner: one extra visitor becomes "+100%".
 */
export const DELTA_PERCENT_FLOOR = 20;

export function canShowPercentDelta(previous: number, current: number): boolean {
  return previous >= DELTA_PERCENT_FLOOR && current >= DELTA_PERCENT_FLOOR;
}

// ─── Session scoring ──────────────────────────────────────────────

const DEEP_READ_MS = READ_DWELL_MS;
const DEEP_READ_DEPTH = READ_DEPTH;
const LONG_READ_MS = 120_000;
const LONG_READ_DEPTH = 75;
const SESSION_DWELL_MS = 3 * 60_000;
const BOUNCE_MS = 10_000;
const BOUNCE_DEPTH = 25;

/** Somewhere they went looking for more of you, as opposed to any outbound link. */
const PERSONAL_HOSTS = /github\.com|linkedin\.com|orcid\.org|scholar\.google|doi\.org/i;

export const NOTABLE_FLOOR = 20;

/**
 * Below this many notable sessions the filter turns itself off.
 *
 * This is the most important single behaviour in the dashboard. A relevance
 * filter tuned for volume is actively harmful at low volume, and a panel that
 * hides two of your three visitors is worse than no panel at all.
 */
export const MIN_NOTABLE = 3;

export interface SessionSignal {
  score: number;
  /** Why this surfaced, in the owner's terms. Rendered as the chip under the header. */
  reasons: string[];
  bounce: boolean;
  deepReads: number;
  pages: number;
}

export interface ScoredSession {
  meta: SessionMeta;
  events: TrailEvent[];
  signal: SessionSignal;
}

export function scoreSession(meta: SessionMeta, events: TrailEvent[]): SessionSignal {
  const pageviews = events.filter((e) => e.type === "pageview");
  const exits = events.filter((e) => e.type === "exit");
  const clicks = events.filter((e) => e.type === "click");

  const pages = new Set(pageviews.map((e) => e.path)).size;
  const deepReads = exits.filter(
    (e) => (e.dwellMs ?? 0) >= DEEP_READ_MS && (e.maxScroll ?? 0) >= DEEP_READ_DEPTH
  ).length;

  const cvDownloads = clicks.filter((e) => e.linkKind === "cv-download").length;
  const mailtos = clicks.filter((e) => e.linkKind === "mailto").length;
  const personalOutbound = clicks.filter(
    (e) => e.linkKind === "external" && PERSONAL_HOSTS.test(e.linkTarget ?? "")
  ).length;
  const agentOpens = events.filter((e) => e.type === "agent_open").length;

  const totalDwell = meta.dwellMsTotal ?? exits.reduce((sum, e) => sum + (e.dwellMs ?? 0), 0);
  const hasRealReferrer = meta.referrerHost !== "direct" && meta.referrerHost !== "other";

  let score = 0;
  const reasons: string[] = [];

  if (cvDownloads > 0) {
    score += 60;
    reasons.push(cvDownloads === 1 ? "downloaded a CV" : `downloaded ${cvDownloads} CVs`);
  }
  if (agentOpens > 0) {
    score += 40;
    reasons.push("opened the agent console");
  }
  if (mailtos > 0) {
    score += 25;
    reasons.push("clicked through to email you");
  }
  if (personalOutbound > 0) {
    score += 20;
    reasons.push("followed a link to your profiles");
  }
  if (deepReads > 0) {
    score += 15 * deepReads;
    reasons.push(deepReads === 1 ? "read one page properly" : `read ${deepReads} pages properly`);
  }
  if (pages > 1) {
    score += 10 * (pages - 1);
    if (deepReads === 0) reasons.push(`looked at ${pages} pages`);
  }
  if (hasRealReferrer) {
    score += 8;
    reasons.push(`arrived from ${meta.referrerHost}`);
  }
  if (totalDwell >= SESSION_DWELL_MS) {
    score += 5;
  }

  const bounce =
    pageviews.length <= 1 &&
    totalDwell < BOUNCE_MS &&
    clicks.length === 0 &&
    (meta.maxScroll ?? 0) <= BOUNCE_DEPTH;

  return { score, reasons, bounce, deepReads, pages };
}

export function isDeepRead(session: ScoredSession): boolean {
  return session.events.some(
    (e) =>
      e.type === "exit" && (e.dwellMs ?? 0) >= LONG_READ_MS && (e.maxScroll ?? 0) >= LONG_READ_DEPTH
  );
}

export type SessionListMode = "notable" | "deep" | "all";

export interface SessionSelection {
  shown: ScoredSession[];
  hiddenCount: number;
  /** True when the filter stood down because there was too little to filter. */
  relaxed: boolean;
  mode: SessionListMode;
}

/**
 * Filters by interest, then sorts by recency. Not the other way round.
 *
 * Sorting by score would pin the same excellent visit from three weeks ago to
 * the top forever, and the page would stop being worth opening. What is wanted
 * is interesting things, newest first.
 */
export function selectSessions(
  sessions: ScoredSession[],
  mode: SessionListMode
): SessionSelection {
  const byRecency = [...sessions].sort((a, b) => b.meta.startedAt.localeCompare(a.meta.startedAt));

  if (mode === "all") {
    return { shown: byRecency, hiddenCount: 0, relaxed: false, mode };
  }

  if (mode === "deep") {
    const deep = byRecency.filter(isDeepRead);
    return { shown: deep, hiddenCount: byRecency.length - deep.length, relaxed: false, mode };
  }

  const notable = byRecency.filter((s) => !s.signal.bounce && s.signal.score >= NOTABLE_FLOOR);

  if (notable.length < MIN_NOTABLE) {
    return { shown: byRecency, hiddenCount: 0, relaxed: true, mode };
  }

  return { shown: notable, hiddenCount: byRecency.length - notable.length, relaxed: false, mode };
}
