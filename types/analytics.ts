import type { LinkKind } from "@/lib/analytics-events";
import type { DeviceClass } from "@/lib/analytics-normalize";

// ─── Rollup rows ──────────────────────────────────────────────────
//
// Every counter is optional because rollup rows are built by UpdateItem with
// ADD, so an attribute only exists once something has incremented it. Reading
// them as `number | undefined` and defaulting at the point of use is the honest
// shape; pretending they are always present would mean writing 0 into every row
// on creation, which is a write we do not need.

export interface DwellBuckets {
  dwellB0?: number;
  dwellB1?: number;
  dwellB2?: number;
  dwellB3?: number;
  dwellB4?: number;
  dwellB5?: number;
  dwellB6?: number;
  dwellB7?: number;
  dwellB8?: number;
  dwellB9?: number;
  dwellB10?: number;
  dwellB11?: number;
}

export interface ScrollCounters {
  s25?: number;
  s50?: number;
  s75?: number;
  s100?: number;
}

export interface TotalsRow extends DwellBuckets, ScrollCounters {
  date: string;
  views?: number;
  uniques?: number;
  sessions?: number;
  events?: number;
  batches?: number;
  clicks?: number;
  clicks_internal?: number;
  clicks_external?: number;
  "clicks_cv-download"?: number;
  clicks_mailto?: number;
  clicks_anchor?: number;
  agentOpens?: number;
  dev_mobile?: number;
  dev_tablet?: number;
  dev_desktop?: number;
  exits?: number;
  /** Exits that were both long enough and deep enough to count as reading. */
  reads?: number;
  dwellMsSum?: number;
  dwellMsCount?: number;
}

export interface PathRow extends DwellBuckets, ScrollCounters {
  date: string;
  path: string;
  views?: number;
  exits?: number;
  reads?: number;
  dwellMsSum?: number;
  dwellMsCount?: number;
}

export interface RefRow {
  date: string;
  host: string;
  sessions?: number;
  views?: number;
}

export interface GeoRow {
  date: string;
  country: string;
  sessions?: number;
  views?: number;
}

export interface LinkRow {
  date: string;
  linkKind: LinkKind;
  linkTarget: string;
  clicks?: number;
}

// ─── Sessions ─────────────────────────────────────────────────────

export interface SessionMeta {
  sessionId: string;
  visitorId: string;
  date: string;
  startedAt: string;
  lastSeenAt?: string;
  country: string;
  device: DeviceClass;
  referrerHost: string;
  entryPath?: string;
  exitPath?: string;
  events?: number;
  pageviews?: number;
  clicks?: number;
  agentOpens?: number;
  maxScroll?: number;
  dwellMsTotal?: number;
}

export type TrailEventType = "pageview" | "scroll" | "click" | "exit" | "agent_open";

export interface TrailEvent {
  type: TrailEventType;
  path: string;
  at: string;
  seq: number;
  pageId: string;
  milestone?: number;
  linkKind?: LinkKind;
  linkTarget?: string;
  dwellMs?: number;
  maxScroll?: number;
  exitReason?: string;
  agentSource?: string;
  referrerHost?: string;
  clamped?: boolean;
}

export interface SessionTrail {
  meta: SessionMeta;
  events: TrailEvent[];
}

// ─── Ranges ───────────────────────────────────────────────────────

export interface ResolvedRange {
  /** Inclusive UTC day, yyyy-mm-dd. */
  from: string;
  /** Inclusive UTC day, yyyy-mm-dd. */
  to: string;
  /** The preset that produced this, for highlighting the control. */
  preset: RangePreset;
  /** True when `from` predates the 90 day trail horizon. */
  beyondTrailHorizon: boolean;
  /** The earliest day trails still exist for, always within the range. */
  trailsFrom: string;
  /** True when the whole range is older than the horizon, so no trail can exist. */
  trailsExpired: boolean;
}

export type RangePreset = "7d" | "30d" | "90d" | "12mo" | "all" | "custom";

// ─── Dashboard payload ────────────────────────────────────────────

export interface DashboardData {
  configured: boolean;
  range: ResolvedRange;
  totals: TotalsRow[];
  paths: PathRow[];
  referrers: RefRow[];
  countries: GeoRow[];
  links: LinkRow[];
}
