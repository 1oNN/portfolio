/**
 * The wire contract between the browser beacon and /api/analytics.
 *
 * Deliberately free of imports. Anything imported here is also imported by the
 * client bundle, and pulling in lib/constants.ts would ship every project
 * description and case-study blurb to every visitor. The server-side route
 * allowlist lives in lib/analytics-normalize.ts for exactly that reason.
 *
 * Keys are short because they are paid for twice: once in every beacon payload
 * and once as string literals in the client bundle.
 */

export const ANALYTICS_ENDPOINT = "/api/analytics";
export const ANALYTICS_SCHEMA_VERSION = 1;

/** Matches the BatchWriteItem ceiling, so one batch is always one write call. */
export const MAX_EVENTS_PER_BATCH = 25;

/** 25 events at roughly 200 bytes plus slack. Well under the 32KB repo default. */
export const MAX_ANALYTICS_BODY_BYTES = 8 * 1024;

export const MAX_PATH_LENGTH = 128;
export const MAX_TARGET_LENGTH = 128;
export const MAX_SESSION_ID_LENGTH = 64;
export const MAX_PAGE_ID_LENGTH = 64;
export const MAX_BATCH_ID_LENGTH = 64;

/**
 * Hard ceiling on a reported dwell. The longest post here is roughly a
 * fifteen-minute read, so thirty minutes is twice any plausible maximum and it
 * coincides with the conventional session-inactivity horizon. A tab left open
 * for eight hours clamps to this.
 */
export const MAX_DWELL_MS = 30 * 60 * 1000;

/** Slack allowed above the server's own wall-clock ceiling, for network delay. */
export const DWELL_CEILING_SLACK_MS = 5_000;

export const SCROLL_MILESTONES = [25, 50, 75, 100] as const;
export type ScrollMilestone = (typeof SCROLL_MILESTONES)[number];

export const LINK_KINDS = ["internal", "external", "cv-download", "mailto", "anchor"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

export const EXIT_REASONS = ["route-change", "hidden", "pagehide", "bfcache"] as const;
export type ExitReason = (typeof EXIT_REASONS)[number];

export const AGENT_OPEN_SOURCES = ["shortcut", "rail", "chip", "event"] as const;
export type AgentOpenSource = (typeof AGENT_OPEN_SOURCES)[number];

export const EVENT_TYPES = ["pageview", "scroll", "click", "exit", "agent_open"] as const;
export type AnalyticsEventType = (typeof EVENT_TYPES)[number];

/**
 * Fields every event carries.
 *
 * `pid` is the page id, and it is the join key that makes an exit idempotent:
 * a page context keeps one pid for its whole life, so a replayed exit
 * overwrites in place rather than appending a second row.
 *
 * `seq` is assigned by the client and is monotonic within a session. It gives
 * three things at once: lexicographic sort equals true client order regardless
 * of clock skew, a retried beacon re-writes an identical key, and no dependency
 * on a monotonic id library. It is spoofable, but a liar can only corrupt their
 * own trail, which is worthless.
 */
interface EventBase {
  pid: string;
  p: string;
  ts: number;
  seq: number;
}

export type AnalyticsEvent =
  | (EventBase & { t: "pageview"; ref?: string })
  | (EventBase & { t: "scroll"; d: ScrollMilestone })
  | (EventBase & { t: "click"; k: LinkKind; h: string })
  | (EventBase & { t: "exit"; ms: number; d: number; r: ExitReason })
  | (EventBase & { t: "agent_open"; src: AgentOpenSource });

export interface AnalyticsBatch {
  v: typeof ANALYTICS_SCHEMA_VERSION;
  /** Tab-scoped, in memory, never persisted to the device. */
  sid: string;
  /** Per-flush, so the server can reject a replayed batch's counter increments. */
  bid: string;
  events: AnalyticsEvent[];
}
