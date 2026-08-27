import { BatchWriteCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import type { AnalyticsBatch, AnalyticsEvent, LinkKind } from "./analytics-events";
import type { DeviceClass } from "./analytics-normalize";
import { clampDwellMs, pathForRollup } from "./analytics-normalize";
import {
  analyticsTable,
  getAnalyticsDoc,
  isConditionalCheckFailed,
  warnUnconfiguredOnce,
} from "./analytics-db";
import {
  aggGeoKey,
  aggLinkKey,
  aggPathKey,
  aggRefKey,
  aggTotalsKey,
  batchMarkerKey,
  dwellBucketAttr,
  dwellBucketIndex,
  eventKey,
  MARKER_TTL_DAYS,
  MAX_EVENTS_PER_SESSION,
  READ_DEPTH,
  READ_DWELL_MS,
  RETENTION_DAYS,
  sessionMetaKey,
  sessionsIndexPk,
  sessionsIndexSk,
  ttlAtMidnightPlusDays,
  ttlFromNow,
  visitorMarkerKey,
  type TableKey,
} from "./analytics-schema";

/**
 * The analytics write path.
 *
 * Four sequential stages, because each one needs the previous one's answer:
 *
 *   1. Conditionally put the batch marker. This decides whether the counters in
 *      stages 3 and 4 are applied at all, so nothing that ADDs can run before it.
 *   2. Update the session summary and read back its previous state, which gives
 *      the dwell ceiling, whether the session is new, and whether it has rolled
 *      over midnight.
 *   3. Conditionally put the exit rows, which tells us whether each one is a
 *      first report or supersedes an earlier one.
 *   4. Everything else, in parallel.
 *
 * Every write is awaited. Lambda freezes the execution environment the moment
 * the response returns, so a detached promise lands only by luck. This is the
 * same failure that was losing the notification mail in
 * app/api/track-download/route.ts before it was changed to await.
 */

export interface RecordBatchInput {
  batch: AnalyticsBatch;
  visitorId: string;
  country: string;
  device: DeviceClass;
  /** Normalised host from this batch's first pageview, if it carried one. */
  referrerHost?: string;
  /** Server-assigned UTC day. A client clock never decides which day a row belongs to. */
  date: string;
  now: number;
}

interface SessionPrevious {
  exists: boolean;
  date?: string;
  startedAt?: string;
  lastSeenAt?: string;
  events?: number;
  maxScroll?: number;
  referrerHost?: string;
}

type Counters = Record<string, number>;

function bump(target: Counters, key: string, by = 1): void {
  target[key] = (target[key] ?? 0) + by;
}

// ─── Expression building ──────────────────────────────────────────

/**
 * Builds an UpdateCommand from plain delta objects.
 *
 * Every attribute name is aliased without exception. DATE, VIEW, COUNT, PATH,
 * TTL and others are DynamoDB reserved words, and aliasing uniformly removes
 * the whole class of bug rather than requiring a lookup per field. lib/blog-db.ts
 * already does this.
 */
function counterUpdate(
  key: TableKey,
  adds: Counters,
  sets: Record<string, unknown> = {},
  initialisers: Record<string, unknown> = {}
): UpdateCommand | null {
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  const addParts: string[] = [];
  const setParts: string[] = [];
  let i = 0;

  for (const [attr, delta] of Object.entries(adds)) {
    if (!delta) continue;
    const n = `#a${i}`;
    const v = `:a${i}`;
    names[n] = attr;
    values[v] = delta;
    addParts.push(`${n} ${v}`);
    i++;
  }

  for (const [attr, value] of Object.entries(sets)) {
    if (value === undefined) continue;
    const n = `#s${i}`;
    const v = `:s${i}`;
    names[n] = attr;
    values[v] = value;
    setParts.push(`${n} = ${v}`);
    i++;
  }

  for (const [attr, value] of Object.entries(initialisers)) {
    if (value === undefined) continue;
    const n = `#i${i}`;
    const v = `:i${i}`;
    names[n] = attr;
    values[v] = value;
    setParts.push(`${n} = if_not_exists(${n}, ${v})`);
    i++;
  }

  if (addParts.length === 0 && setParts.length === 0) return null;

  const clauses: string[] = [];
  if (setParts.length) clauses.push(`SET ${setParts.join(", ")}`);
  if (addParts.length) clauses.push(`ADD ${addParts.join(", ")}`);

  return new UpdateCommand({
    TableName: analyticsTable(),
    Key: key,
    UpdateExpression: clauses.join(" "),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  });
}

// ─── Rollup deltas ────────────────────────────────────────────────

export interface ExitOutcome {
  /** False when this exit supersedes an earlier report of the same page. */
  first: boolean;
  previousMs?: number;
  previousDepth?: number;
}

/**
 * A read, not a glance. Counted at write time because the joint condition
 * cannot be recovered afterwards: the rollups know how many exits crossed 50%
 * and how many lasted a minute, but not how many did both.
 */
function isRead(dwellMs: number, depth: number): boolean {
  return dwellMs >= READ_DWELL_MS && depth >= READ_DEPTH;
}

export interface RollupDeltas {
  totals: Counters;
  paths: Map<string, Counters>;
  geo: Counters;
  ref: Counters;
  links: Map<string, { kind: LinkKind; target: string; clicks: number }>;
  meta: Counters;
  maxScroll: number;
  exitPath?: string;
}

function pathCounters(deltas: RollupDeltas, path: string): Counters {
  const key = pathForRollup(path);
  let counters = deltas.paths.get(key);
  if (!counters) {
    counters = {};
    deltas.paths.set(key, counters);
  }
  return counters;
}

/**
 * Folds a whole batch into one delta per rollup item before touching DynamoDB.
 *
 * This is what makes the write cost tolerable. BatchWriteItem cannot carry an
 * UpdateExpression and TransactWriteItems costs double, so each rollup item
 * needs its own UpdateCommand. Without merging first, a session's dozen events
 * would each independently update the totals, the path row and the summary,
 * which roughly doubles the write bill for no benefit.
 *
 * Pure, and exported for testing.
 */
export function mergeDeltas(
  events: AnalyticsEvent[],
  context: {
    device: DeviceClass;
    countsAsNewToday: boolean;
    countedAsUnique: boolean;
    exits: Map<string, ExitOutcome>;
  }
): RollupDeltas {
  const deltas: RollupDeltas = {
    totals: {},
    paths: new Map(),
    geo: {},
    ref: {},
    links: new Map(),
    meta: {},
    maxScroll: 0,
  };

  bump(deltas.totals, "events", events.length);
  bump(deltas.totals, "batches");
  bump(deltas.meta, "events", events.length);

  if (context.countsAsNewToday) {
    bump(deltas.totals, "sessions");
    bump(deltas.geo, "sessions");
    bump(deltas.ref, "sessions");
    if (context.countedAsUnique) bump(deltas.totals, "uniques");
  }

  for (const event of events) {
    switch (event.t) {
      case "pageview": {
        bump(deltas.totals, "views");
        bump(deltas.totals, `dev_${context.device}`);
        bump(pathCounters(deltas, event.p), "views");
        bump(deltas.geo, "views");
        bump(deltas.ref, "views");
        bump(deltas.meta, "pageviews");
        break;
      }
      case "scroll": {
        bump(deltas.totals, `s${event.d}`);
        bump(pathCounters(deltas, event.p), `s${event.d}`);
        if (event.d > deltas.maxScroll) deltas.maxScroll = event.d;
        break;
      }
      case "click": {
        bump(deltas.totals, "clicks");
        bump(deltas.totals, `clicks_${event.k}`);
        bump(deltas.meta, "clicks");
        const key = `${event.k}#${event.h}`;
        const existing = deltas.links.get(key);
        if (existing) existing.clicks += 1;
        else deltas.links.set(key, { kind: event.k, target: event.h, clicks: 1 });
        break;
      }
      case "exit": {
        const outcome = context.exits.get(event.pid);
        // An exit whose row could not be written at all contributes nothing,
        // rather than incrementing a counter with no row behind it.
        if (!outcome) break;

        const paths = pathCounters(deltas, event.p);
        const bucket = dwellBucketAttr(dwellBucketIndex(event.ms));

        if (outcome.first) {
          bump(deltas.totals, "exits");
          if (isRead(event.ms, event.d)) {
            bump(deltas.totals, "reads");
            bump(paths, "reads");
          }
          bump(deltas.totals, "dwellMsSum", event.ms);
          bump(deltas.totals, "dwellMsCount");
          bump(deltas.totals, bucket);
          bump(paths, "exits");
          bump(paths, "dwellMsSum", event.ms);
          bump(paths, "dwellMsCount");
          bump(paths, bucket);
          bump(deltas.meta, "dwellMsTotal", event.ms);
        } else {
          // A supersession: the same page reported again with more foreground
          // time, after the reader tabbed away and came back. The exit count is
          // unchanged, but the recorded duration has to move from the old
          // bucket to the new one or the median quietly under-reports every
          // visit that was ever backgrounded.
          const previous = outcome.previousMs ?? 0;
          const difference = event.ms - previous;
          if (difference !== 0) {
            bump(deltas.totals, "dwellMsSum", difference);
            bump(paths, "dwellMsSum", difference);
            bump(deltas.meta, "dwellMsTotal", difference);
          }
          // Coming back to finish an article can turn a glance into a read.
          const wasRead = isRead(previous, outcome.previousDepth ?? event.d);
          const nowRead = isRead(event.ms, event.d);
          if (wasRead !== nowRead) {
            const step = nowRead ? 1 : -1;
            bump(deltas.totals, "reads", step);
            bump(paths, "reads", step);
          }

          const previousBucket = dwellBucketAttr(dwellBucketIndex(previous));
          if (previousBucket !== bucket) {
            bump(deltas.totals, previousBucket, -1);
            bump(deltas.totals, bucket, 1);
            bump(paths, previousBucket, -1);
            bump(paths, bucket, 1);
          }
        }

        if (event.d > deltas.maxScroll) deltas.maxScroll = event.d;
        deltas.exitPath = event.p;
        break;
      }
      case "agent_open": {
        bump(deltas.totals, "agentOpens");
        bump(deltas.meta, "agentOpens");
        break;
      }
    }
  }

  return deltas;
}

// ─── Stages ───────────────────────────────────────────────────────

/**
 * Stage 1. A conditional put on a per-flush marker.
 *
 * visibilitychange and pagehide can both fire and browsers retry beacons, so
 * the same batch can arrive twice. Raw event rows are naturally idempotent
 * because their sort key derives from a client-assigned seq, and a replay
 * rewrites them in place. Counters are not: a replayed ADD double counts and
 * there is no way to detect the drift afterwards.
 */
async function claimBatch(sessionId: string, batchId: string, date: string): Promise<boolean> {
  try {
    await getAnalyticsDoc().send(
      new PutCommand({
        TableName: analyticsTable(),
        Item: {
          ...batchMarkerKey(sessionId, batchId),
          ttl: ttlAtMidnightPlusDays(date, MARKER_TTL_DAYS),
        },
        ConditionExpression: "attribute_not_exists(#pk)",
        ExpressionAttributeNames: { "#pk": "pk" },
      })
    );
    return true;
  } catch (err) {
    if (isConditionalCheckFailed(err)) return false;
    throw err;
  }
}

/** Stage 2. Touch the session summary and read back what it looked like before. */
async function touchSession(input: RecordBatchInput): Promise<SessionPrevious> {
  const { batch, date, visitorId, country, device, referrerHost, now } = input;
  const startedAt = new Date(now).toISOString();
  const firstPath = batch.events.find((e) => e.t === "pageview")?.p ?? batch.events[0]?.p ?? "/";

  const command = counterUpdate(
    sessionMetaKey(batch.sid),
    {},
    {
      sessionId: batch.sid,
      visitorId,
      date,
      lastSeenAt: startedAt,
      ttl: ttlFromNow(RETENTION_DAYS, now),
    },
    {
      startedAt,
      country,
      device,
      referrerHost: referrerHost ?? "direct",
      entryPath: firstPath,
      // The session stays listed under the day it began, so the index is never
      // re-keyed and a session spanning midnight does not appear twice.
      gsi1pk: sessionsIndexPk(date),
      gsi1sk: sessionsIndexSk(startedAt, batch.sid),
    }
  );

  if (!command) return { exists: false };

  const result = await getAnalyticsDoc().send(
    new UpdateCommand({ ...command.input, ReturnValues: "ALL_OLD" })
  );

  const previous = result.Attributes;
  if (!previous) return { exists: false };

  return {
    exists: true,
    date: typeof previous.date === "string" ? previous.date : undefined,
    startedAt: typeof previous.startedAt === "string" ? previous.startedAt : undefined,
    lastSeenAt: typeof previous.lastSeenAt === "string" ? previous.lastSeenAt : undefined,
    events: typeof previous.events === "number" ? previous.events : 0,
    maxScroll: typeof previous.maxScroll === "number" ? previous.maxScroll : 0,
    referrerHost: typeof previous.referrerHost === "string" ? previous.referrerHost : undefined,
  };
}

/**
 * Reads a number off the Item carried by a ConditionalCheckFailedException.
 *
 * That Item arrives as a RAW DynamoDB AttributeValue map even under the
 * document client, because the exception path skips the unmarshalling layer
 * that normal responses go through. So dwellMs is `{ N: "20000" }` rather than
 * `20000`, and a plain typeof check yields undefined, which makes the
 * supersession correct against zero and leaves a negative count in whichever
 * bucket zero falls in. Verified against the real table, not assumed.
 */
export function numberAttr(
  item: Record<string, unknown> | undefined,
  key: string
): number | undefined {
  const raw = item?.[key];
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
  if (raw && typeof raw === "object" && "N" in raw) {
    const parsed = Number((raw as { N: string }).N);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * Stage 3. Exit rows, written conditionally so a supersession is detectable.
 *
 * The client reuses one seq for every exit report of a given page context, so
 * the sort key is stable across resends and the row holds the final duration
 * rather than accumulating a row per report.
 */
async function writeExits(
  input: RecordBatchInput,
  events: AnalyticsEvent[],
  serverCeilingMs: number | undefined,
  common: Record<string, unknown>,
  isFirstDelivery: boolean
): Promise<Map<string, ExitOutcome>> {
  const outcomes = new Map<string, ExitOutcome>();
  const exits = events.filter((e): e is Extract<AnalyticsEvent, { t: "exit" }> => e.t === "exit");
  if (exits.length === 0) return outcomes;

  const doc = getAnalyticsDoc();

  await Promise.all(
    exits.map(async (event) => {
      // The batch validator already applied the static ceiling; this adds the
      // wall-clock one, which needs the session's previous lastSeenAt and so
      // could not be applied earlier.
      const clamped = clampDwellMs(event.ms, serverCeilingMs);
      if (!clamped) return;
      event.ms = clamped.dwellMs;

      const item = {
        ...eventKey(input.batch.sid, event.seq, "exit"),
        ...common,
        type: "exit",
        path: event.p,
        at: new Date(event.ts).toISOString(),
        seq: event.seq,
        pageId: event.pid,
        dwellMs: clamped.dwellMs,
        maxScroll: event.d,
        exitReason: event.r,
        clamped: clamped.clamped,
      };

      try {
        await doc.send(
          new PutCommand({
            TableName: analyticsTable(),
            Item: item,
            ConditionExpression: "attribute_not_exists(#pk)",
            ExpressionAttributeNames: { "#pk": "pk" },
            // Without this the exception carries no Item, so the correction
            // below would run against an undefined previous value and move the
            // histogram from whatever bucket zero happens to fall in.
            ReturnValuesOnConditionCheckFailure: "ALL_OLD",
          })
        );
        outcomes.set(event.pid, { first: true });
      } catch (err) {
        if (!isConditionalCheckFailed(err)) throw err;

        // The row already exists. On a replayed batch that is simply the same
        // exit arriving twice, and it must be left alone: rewriting it would
        // re-clamp the duration against a lastSeenAt that this very session has
        // since moved forward, quietly shrinking a real reading time. Only a
        // first delivery can legitimately supersede.
        if (!isFirstDelivery) return;

        const previous = (err as { Item?: Record<string, unknown> }).Item;
        const previousMs = numberAttr(previous, "dwellMs");
        const previousDepth = numberAttr(previous, "maxScroll");
        // Overwrite so the trail shows one exit per page with the final figure.
        await doc.send(new PutCommand({ TableName: analyticsTable(), Item: item }));
        outcomes.set(event.pid, { first: false, previousMs, previousDepth });
      }
    })
  );

  return outcomes;
}

/**
 * Stage 4a. The unique-visitor marker.
 *
 * A String Set of visitor ids per day would make every ADD cost the size of the
 * whole set, roughly 160 WCU at five thousand visitors, and would breach the
 * 400KB item limit somewhere around twelve thousand. A conditional put on a
 * per-visitor marker is O(1) instead, and DynamoDB serialises conditional
 * writes on a single item, so exactly one concurrent Lambda sees it succeed.
 */
async function claimUniqueVisitor(date: string, visitorId: string): Promise<boolean> {
  try {
    await getAnalyticsDoc().send(
      new PutCommand({
        TableName: analyticsTable(),
        Item: {
          ...visitorMarkerKey(date, visitorId),
          ttl: ttlAtMidnightPlusDays(date, MARKER_TTL_DAYS),
        },
        ConditionExpression: "attribute_not_exists(#pk)",
        ExpressionAttributeNames: { "#pk": "pk" },
      })
    );
    return true;
  } catch (err) {
    if (isConditionalCheckFailed(err)) return false;
    throw err;
  }
}

/** BatchWriteItem rejects a request containing two identical keys outright. */
function dedupeByKey<T extends TableKey>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) seen.set(`${item.pk}|${item.sk}`, item);
  return [...seen.values()];
}

async function writeRawEvents(items: Array<Record<string, unknown> & TableKey>): Promise<void> {
  const unique = dedupeByKey(items);
  if (unique.length === 0) return;

  const doc = getAnalyticsDoc();
  let pending = unique.map((Item) => ({ PutRequest: { Item } }));

  // BatchWriteItem returns UnprocessedItems on partial failure and SDK v3 does
  // not retry them. The loop has to live inside the awaited handler; a detached
  // retry is the lost-promise bug wearing a different hat.
  for (let attempt = 0; attempt < 3 && pending.length > 0; attempt++) {
    const result = await doc.send(
      new BatchWriteCommand({ RequestItems: { [analyticsTable()]: pending } })
    );
    const unprocessed = result.UnprocessedItems?.[analyticsTable()] ?? [];
    if (unprocessed.length === 0) return;
    pending = unprocessed as typeof pending;
    await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
  }

  if (pending.length > 0) {
    console.error(`[analytics] dropped ${pending.length} event rows after retries`);
  }
}

// ─── Entry point ──────────────────────────────────────────────────

export async function recordBatch(input: RecordBatchInput): Promise<void> {
  const { batch, date, visitorId, country, device, now } = input;

  const isFirstDelivery = await claimBatch(batch.sid, batch.bid, date);
  const previous = await touchSession(input);

  const countsAsNewToday = !previous.exists || previous.date !== date;
  const serverCeilingMs = previous.lastSeenAt
    ? now - Date.parse(previous.lastSeenAt)
    : previous.startedAt
      ? now - Date.parse(previous.startedAt)
      : undefined;

  const common = {
    sessionId: batch.sid,
    visitorId,
    date,
    country,
    device,
    ttl: ttlFromNow(RETENTION_DAYS, now),
  };

  // One tab cannot mint rows without bound. Past the cap the counters keep
  // moving but the trail stops growing, which is the right way round: the
  // aggregate stays true and only the replay detail is lost.
  const underRowCap = (previous.events ?? 0) < MAX_EVENTS_PER_SESSION;

  const exits = underRowCap
    ? await writeExits(input, batch.events, serverCeilingMs, common, isFirstDelivery)
    : new Map<string, ExitOutcome>();

  const countedAsUnique = countsAsNewToday ? await claimUniqueVisitor(date, visitorId) : false;

  const deltas = mergeDeltas(batch.events, {
    device,
    countsAsNewToday,
    countedAsUnique,
    exits,
  });

  // The referrer is a property of how the visit began, so later batches reuse
  // the value stored on the session rather than re-reading a header that by
  // then points at our own pages.
  const referrerHost = input.referrerHost ?? previous.referrerHost ?? "direct";

  const tasks: Array<Promise<unknown>> = [];

  if (underRowCap) {
    const rows = batch.events
      .filter((event) => event.t !== "exit")
      .map((event) => rawEventItem(event, batch.sid, common));
    tasks.push(writeRawEvents(rows));
  }

  const metaSets: Record<string, unknown> = {};
  if (deltas.exitPath) metaSets.exitPath = deltas.exitPath;
  if (deltas.maxScroll > (previous.maxScroll ?? 0)) metaSets.maxScroll = deltas.maxScroll;

  const metaAdds = isFirstDelivery ? deltas.meta : {};
  const metaUpdate = counterUpdate(sessionMetaKey(batch.sid), metaAdds, metaSets);
  if (metaUpdate) tasks.push(getAnalyticsDoc().send(metaUpdate));

  if (isFirstDelivery) {
    push(tasks, counterUpdate(aggTotalsKey(date), deltas.totals));
    push(tasks, counterUpdate(aggGeoKey(date, country), deltas.geo, { country }));
    push(tasks, counterUpdate(aggRefKey(date, referrerHost), deltas.ref, { host: referrerHost }));

    for (const [path, counters] of deltas.paths) {
      push(tasks, counterUpdate(aggPathKey(date, path), counters, { path }));
    }
    for (const link of deltas.links.values()) {
      push(
        tasks,
        counterUpdate(aggLinkKey(date, link.kind, link.target), { clicks: link.clicks }, {
          linkKind: link.kind,
          linkTarget: link.target,
        })
      );
    }
  }

  // allSettled rather than all, so one throttled counter never sinks the raw
  // event write. Failures are logged and swallowed: analytics must never break
  // a page, and the caller returns 204 regardless.
  for (const result of await Promise.allSettled(tasks)) {
    if (result.status === "rejected") {
      console.error("[analytics] write failed:", result.reason);
    }
  }
}

function push(tasks: Array<Promise<unknown>>, command: UpdateCommand | null): void {
  if (command) tasks.push(getAnalyticsDoc().send(command));
}

function rawEventItem(
  event: AnalyticsEvent,
  sessionId: string,
  common: Record<string, unknown>
): Record<string, unknown> & TableKey {
  const suffix = event.t === "agent_open" ? "agent" : event.t.slice(0, 8);
  const base = {
    ...eventKey(sessionId, event.seq, `${suffix}${event.pid.slice(0, 4)}`),
    ...common,
    type: event.t,
    path: event.p,
    at: new Date(event.ts).toISOString(),
    seq: event.seq,
    pageId: event.pid,
  };

  switch (event.t) {
    case "pageview":
      return { ...base, referrerHost: event.ref };
    case "scroll":
      return { ...base, milestone: event.d };
    case "click":
      return { ...base, linkKind: event.k, linkTarget: event.h };
    case "agent_open":
      return { ...base, agentSource: event.src };
    default:
      return base;
  }
}

/** Skips the whole write path when the table or credentials are absent. */
export function recordBatchIfConfigured(
  input: RecordBatchInput,
  configured: boolean
): Promise<void> {
  if (!configured) {
    warnUnconfiguredOnce("/api/analytics");
    return Promise.resolve();
  }
  return recordBatch(input);
}
