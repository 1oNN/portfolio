import { GetCommand, QueryCommand, type QueryCommandInput } from "@aws-sdk/lib-dynamodb";

import type {
  DashboardData,
  GeoRow,
  LinkRow,
  PathRow,
  RefRow,
  ResolvedRange,
  SessionMeta,
  SessionTrail,
  TotalsRow,
  TrailEvent,
} from "@/types/analytics";
import { scoreSession, type ScoredSession } from "./analytics-select";
import {
  analyticsTable,
  getAnalyticsDoc,
  isAnalyticsConfigured,
  warnUnconfiguredOnce,
} from "./analytics-db";
import {
  AGG_GEO,
  AGG_LINK,
  AGG_PATH,
  AGG_REF,
  AGG_TOTALS,
  GSI1_NAME,
  rangeEndExclusive,
  rangeStart,
  sessionMetaKey,
  sessionPk,
  sessionsIndexPk,
} from "./analytics-schema";

/**
 * Every dashboard query.
 *
 * There is not a single Scan in this file, and the IAM policy for the analytics
 * table deliberately does not grant one, so it cannot regress into one. Each
 * function degrades to an empty result when the subsystem is unconfigured
 * rather than throwing, which is what lets the dashboard render its own
 * "nothing recorded yet" state instead of a 500.
 */

/** A bad range must not be able to page a Lambda into an out-of-memory kill. */
const MAX_ITEMS = 20_000;

/**
 * Ceiling on how many sessions get their trail fetched for scoring. One small
 * query each, run in parallel, so the cost is bounded rather than growing with
 * the selected range.
 */
const MAX_SCORED_SESSIONS = 60;

async function queryAll<T>(input: QueryCommandInput, cap: number = MAX_ITEMS): Promise<T[]> {
  const doc = getAnalyticsDoc();
  const items: T[] = [];
  let cursor: Record<string, unknown> | undefined;

  do {
    const result = await doc.send(
      new QueryCommand({ ...input, ExclusiveStartKey: cursor as QueryCommandInput["ExclusiveStartKey"] })
    );
    items.push(...((result.Items ?? []) as T[]));
    cursor = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    if (items.length >= cap) {
      console.warn(`[analytics-read] hit the ${cap} item cap for ${input.ExpressionAttributeValues?.[":pk"]}`);
      break;
    }
  } while (cursor);

  return items;
}

/**
 * One partition, one BETWEEN over the date-prefixed sort key.
 *
 * This is why the rollups are kind-major rather than date-major: the dashboard
 * essentially never asks for exactly one day, and this way a range is a single
 * Query instead of one Query per day.
 */
function rangeQuery(pk: string, range: { from: string; to: string }, dated: boolean): QueryCommandInput {
  return {
    TableName: analyticsTable(),
    KeyConditionExpression: "#pk = :pk AND #sk BETWEEN :from AND :to",
    ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
    ExpressionAttributeValues: {
      ":pk": pk,
      // AGG#TOTALS has a bare date as its sort key; the others are
      // "<date>#<value>", so they need the separator on both bounds.
      ":from": dated ? rangeStart(range.from) : range.from,
      ":to": dated ? rangeEndExclusive(range.to) : range.to,
    },
  };
}

/**
 * Every rollup getter goes through here, so the unconfigured check cannot be
 * forgotten at a call site.
 *
 * It was: getDashboard guarded, but a later caller reached for getTotalsRange
 * directly to fetch the previous window for the deltas, and an unset table
 * threw straight through the dashboard's day-one state. Guarding the getters
 * rather than the aggregate makes that mistake unavailable.
 */
async function rollupRows<T>(pk: string, range: ResolvedRange, dated: boolean): Promise<T[]> {
  if (!isAnalyticsConfigured()) return [];
  return queryAll<T>(rangeQuery(pk, range, dated));
}

/** Q1 and Q8. The headline numbers and the daily strip are the same round trip. */
export function getTotalsRange(range: ResolvedRange): Promise<TotalsRow[]> {
  return rollupRows<TotalsRow>(AGG_TOTALS, range, false);
}

/** Q2, Q6 and Q7. Top pages, read depth and per-post dwell all come from this one set. */
export function getPathRows(range: ResolvedRange): Promise<PathRow[]> {
  return rollupRows<PathRow>(AGG_PATH, range, true);
}

export function getReferrerRows(range: ResolvedRange): Promise<RefRow[]> {
  return rollupRows<RefRow>(AGG_REF, range, true);
}

export function getCountryRows(range: ResolvedRange): Promise<GeoRow[]> {
  return rollupRows<GeoRow>(AGG_GEO, range, true);
}

export function getLinkRows(range: ResolvedRange): Promise<LinkRow[]> {
  return rollupRows<LinkRow>(AGG_LINK, range, true);
}

/**
 * Q9. Recent sessions, newest first, off the sparse GSI.
 *
 * gsi1sk is "<startedAt>#<sessionId>", so descending order is newest first with
 * the id only breaking ties. Projection is ALL, so the list renders straight
 * from the index with no follow-up BatchGet.
 */
export async function listRecentSessions(
  range: ResolvedRange,
  limit: number
): Promise<SessionMeta[]> {
  if (!isAnalyticsConfigured()) return [];

  const doc = getAnalyticsDoc();
  const sessions: SessionMeta[] = [];

  // Walk backwards a day at a time from the end of the range. Sessions are
  // partitioned per day in the index, so there is no single partition holding
  // "everything recent".
  let day = range.to;
  const floor = range.trailsFrom;

  while (day >= floor && sessions.length < limit) {
    const result = await doc.send(
      new QueryCommand({
        TableName: analyticsTable(),
        IndexName: GSI1_NAME,
        KeyConditionExpression: "#g1 = :g1",
        ExpressionAttributeNames: { "#g1": "gsi1pk" },
        ExpressionAttributeValues: { ":g1": sessionsIndexPk(day) },
        ScanIndexForward: false,
        Limit: limit - sessions.length,
      })
    );
    sessions.push(...((result.Items ?? []) as SessionMeta[]));
    day = previousDay(day);
  }

  return sessions.slice(0, limit);
}

function previousDay(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) - 86_400_000).toISOString().slice(0, 10);
}

/**
 * Q10. One full trail, in client order.
 *
 * begins_with on the key condition rather than a FilterExpression, so the
 * #META and BATCH# markers are never read and discarded. Ordering is seq
 * driven, which makes it immune to clock skew and to batch arrival order.
 */
export async function getTrailEvents(sessionId: string): Promise<TrailEvent[]> {
  if (!isAnalyticsConfigured()) return [];
  return queryAll<TrailEvent>({
    TableName: analyticsTable(),
    KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :evt)",
    ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
    ExpressionAttributeValues: { ":pk": sessionPk(sessionId), ":evt": "EVT#" },
    ScanIndexForward: true,
  });
}

export async function getSessionTrail(sessionId: string): Promise<SessionTrail | null> {
  if (!isAnalyticsConfigured()) return null;

  const doc = getAnalyticsDoc();
  const [metaResult, events] = await Promise.all([
    doc.send(new GetCommand({ TableName: analyticsTable(), Key: sessionMetaKey(sessionId) })),
    getTrailEvents(sessionId),
  ]);

  const meta = metaResult.Item as SessionMeta | undefined;
  if (!meta) return null;

  return { meta, events };
}

/**
 * Sessions with their trails attached and scored.
 *
 * Scoring needs the events, because #META knows how many clicks a session had
 * but not what kind, and a CV download versus an idle outbound click is the
 * whole difference between an interesting visit and a boring one.
 *
 * That means one small partition query per session. They run in parallel and
 * are hard-capped, so the cost is bounded and predictable rather than growing
 * with the range.
 */
export async function getScoredSessions(
  range: ResolvedRange,
  limit = MAX_SCORED_SESSIONS
): Promise<ScoredSession[]> {
  if (!isAnalyticsConfigured() || range.trailsExpired) return [];

  const metas = await listRecentSessions(range, Math.min(limit, MAX_SCORED_SESSIONS));
  if (metas.length === 0) return [];

  const trails = await Promise.all(
    metas.map(async (meta) => {
      try {
        return await getTrailEvents(meta.sessionId);
      } catch (err) {
        // One unreadable trail must not blank the whole list.
        console.error(`[analytics-read] trail failed for ${meta.sessionId}:`, err);
        return [] as TrailEvent[];
      }
    })
  );

  return metas.map((meta, i) => ({
    meta,
    events: trails[i],
    signal: scoreSession(meta, trails[i]),
  }));
}

/** Fans out the rollup queries in parallel. Serial round trips are a visible stall on a cold Lambda. */
export async function getDashboard(range: ResolvedRange): Promise<DashboardData> {
  if (!isAnalyticsConfigured()) {
    warnUnconfiguredOnce("analytics-read");
    return {
      configured: false,
      range,
      totals: [],
      paths: [],
      referrers: [],
      countries: [],
      links: [],
    };
  }

  const [totals, paths, referrers, countries, links] = await Promise.all([
    getTotalsRange(range),
    getPathRows(range),
    getReferrerRows(range),
    getCountryRows(range),
    getLinkRows(range),
  ]);

  return { configured: true, range, totals, paths, referrers, countries, links };
}

/**
 * Whether anything has ever been recorded, and when.
 *
 * Used by the day-one empty state to tell "nobody has visited" apart from "the
 * pipeline is broken", which otherwise render identically and are the most
 * frustrating hour of standing up any analytics system.
 */
export async function getPipelineStatus(): Promise<{
  configured: boolean;
  reachable: boolean;
  lastWriteDate: string | null;
}> {
  if (!isAnalyticsConfigured()) {
    return { configured: false, reachable: false, lastWriteDate: null };
  }

  try {
    const result = await getAnalyticsDoc().send(
      new QueryCommand({
        TableName: analyticsTable(),
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: { "#pk": "pk" },
        ExpressionAttributeValues: { ":pk": AGG_TOTALS },
        ScanIndexForward: false,
        Limit: 1,
      })
    );
    const latest = result.Items?.[0] as TotalsRow | undefined;
    return { configured: true, reachable: true, lastWriteDate: latest?.date ?? null };
  } catch (err) {
    console.error("[analytics-read] pipeline check failed:", err);
    return { configured: true, reachable: false, lastWriteDate: null };
  }
}
