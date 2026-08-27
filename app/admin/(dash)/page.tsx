import { Suspense } from "react";
import Link from "next/link";

import DailyStrip, { type DayPoint } from "@/components/admin/charts/DailyStrip";
import DepthRail from "@/components/admin/charts/DepthRail";
import RangePicker from "@/components/admin/RangePicker";
import SessionTrailView from "@/components/admin/SessionTrailView";
import { Card, Panel } from "@/components/admin/ui/Panel";
import RankedTable, { type RankedRow } from "@/components/admin/ui/RankedTable";
import StatTile from "@/components/admin/ui/StatTile";
import {
  DayOneState,
  NoVisitsState,
  TrailsClampedNotice,
  TrailsExpiredState,
} from "@/components/admin/ui/EmptyState";
import {
  countryName,
  formatDay,
  formatDelta,
  formatDuration,
  formatPercent,
  linkKindLabel,
  pluralise,
  referrerLabel,
  shortPath,
} from "@/lib/analytics-format";
import {
  getDashboard,
  getPipelineStatus,
  getScoredSessions,
  getTotalsRange,
} from "@/lib/analytics-read";
import { N_GATE, resolveRange, selectSessions } from "@/lib/analytics-select";
import {
  histogramFromRow,
  histogramRange,
  medianFromHistogram,
  readDepth,
  sumCounters,
  sumHistograms,
} from "@/lib/analytics-stats";
import { addDays } from "@/lib/analytics-schema";
import { ANALYTICS_TABLE } from "@/lib/analytics-db";
import type { PathRow, ResolvedRange, TotalsRow } from "@/types/analytics";

/**
 * Never cached, never prerendered at build. Admin analytics that were correct
 * an hour ago are not analytics.
 */
export const dynamic = "force-dynamic";

/** How many notable visits render expanded before the list defers to /admin/sessions. */
const TRAILS_ON_DASHBOARD = 6;

export default async function AnalyticsDashboard({
  searchParams,
}: {
  // In Next 16 searchParams is a Promise and has to be awaited.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = resolveRange({
    range: typeof params.range === "string" ? params.range : undefined,
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
  });

  // Fanned out rather than awaited in sequence: serial DynamoDB round trips on
  // a cold Lambda are a visible stall.
  const [data, status, previous] = await Promise.all([
    getDashboard(range),
    getPipelineStatus(),
    getTotalsRange(previousWindow(range)),
  ]);

  const hasAnyData = data.totals.length > 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-2">
        <RangePicker range={range} basePath="/admin" />
        <p className="text-[11px] text-[var(--text-muted)]">
          Cookieless. &quot;Visitors&quot; means same-day uniques, so the same person on two days
          counts twice. Returning visitors are not measurable and are never shown.
        </p>
      </div>

      {!status.configured || !hasAnyData ? (
        <Card className="mt-6">
          {!status.configured || status.lastWriteDate === null ? (
            <DayOneState
              configured={status.configured}
              reachable={status.reachable}
              tableName={ANALYTICS_TABLE ?? null}
            />
          ) : (
            <NoVisitsState
              from={formatDay(range.from)}
              to={formatDay(range.to)}
              lastWriteDay={formatDay(status.lastWriteDate)}
            />
          )}
        </Card>
      ) : (
        <>
          <Kpis data={data} previous={previous} />

          <Panel
            title="Visitors per day"
            subtitle={range.beyondTrailHorizon ? "faded days are past the trail horizon" : undefined}
            className="mt-4"
          >
            <div className="px-4 py-3">
              <DailyStrip points={dailyPoints(data.totals, range)} label="Visitors per day" />
            </div>
          </Panel>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-4">
              <Suspense fallback={<Panel title="Notable visits"><p className="px-4 py-6 text-sm text-[var(--text-muted)]">Loading trails...</p></Panel>}>
                {/* Suspended separately so the tiles and the strip paint from
                    the fast rollup query while the heavier trail fan-out runs. */}
                <NotableVisits range={range} />
              </Suspense>
              <WhatTheyRead paths={data.paths} />
            </div>

            <div className="flex flex-col gap-4">
              <Panel title="Top pages">
                <RankedTable rows={topPaths(data.paths)} emptyMessage="No page views yet." />
              </Panel>

              <Panel title="Referrers">
                <RankedTable
                  rows={topReferrers(data)}
                  valueLabel="visits"
                  emptyMessage="No referrers yet."
                />
              </Panel>

              <Panel title="Countries">
                <RankedTable rows={topCountries(data)} emptyMessage="No locations yet." />
              </Panel>

              <Panel title="Links opened">
                <RankedTable rows={topLinks(data)} max={10} emptyMessage="No clicks yet." />
              </Panel>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// ─── Panels ───────────────────────────────────────────────────────

function Kpis({
  data,
  previous,
}: {
  data: Awaited<ReturnType<typeof getDashboard>>;
  previous: TotalsRow[];
}) {
  const KEYS = ["views", "uniques", "reads", "agentOpens", "clicks_cv-download"] as const;
  const totals = sumCounters(data.totals, KEYS);
  const before = sumCounters(previous, KEYS);

  const readPaths = new Set(data.paths.filter((p) => (p.reads ?? 0) > 0).map((p) => p.path));
  const series = (key: "uniques" | "views" | "reads") =>
    data.totals.map((row) => (row[key] as number | undefined) ?? 0);

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* Real reads leads, not pageviews. At this traffic "18 people actually
          read something" is a number you can act on; "231 pageviews" is not. */}
      <StatTile
        label="Real reads"
        qualifier="60s or more, at least half way down"
        value={totals.reads}
        sub={
          readPaths.size > 0
            ? `across ${pluralise(readPaths.size, "page")}`
            : "nobody has finished a page yet"
        }
        series={series("reads")}
        delta={formatDelta(totals.reads, before.reads, "read")}
      />
      <StatTile
        label="Visitors"
        qualifier="same-day uniques"
        value={totals.uniques}
        sub={pluralise(totals.views, "pageview")}
        series={series("uniques")}
        delta={formatDelta(totals.uniques, before.uniques, "visit")}
      />
      <StatTile
        label="CV downloads"
        value={totals["clicks_cv-download"]}
        sub={totals["clicks_cv-download"] === 0 ? "none yet" : "from the beacon"}
        delta={formatDelta(totals["clicks_cv-download"], before["clicks_cv-download"], "download")}
      />
      <StatTile
        label="Agent chats"
        value={totals.agentOpens}
        sub={totals.agentOpens === 0 ? "none yet" : "console opened"}
        delta={formatDelta(totals.agentOpens, before.agentOpens, "chat")}
      />
    </div>
  );
}

/** The window immediately before this one, same length, for the deltas. */
function previousWindow(range: ResolvedRange): ResolvedRange {
  const days =
    Math.round((Date.parse(`${range.to}T00:00:00Z`) - Date.parse(`${range.from}T00:00:00Z`)) / 86_400_000) + 1;
  return { ...range, from: addDays(range.from, -days), to: addDays(range.from, -1) };
}

async function NotableVisits({ range }: { range: ResolvedRange }) {
  if (range.trailsExpired) {
    return (
      <Panel title="Notable visits">
        <TrailsExpiredState from={formatDay(range.from)} to={formatDay(range.to)} />
      </Panel>
    );
  }

  const sessions = await getScoredSessions(range);
  const selection = selectSessions(sessions, "notable");
  const shown = selection.shown.slice(0, TRAILS_ON_DASHBOARD);

  return (
    <Panel
      title="Notable visits"
      subtitle={
        selection.relaxed
          ? `Showing all ${sessions.length}, too few to filter.`
          : selection.hiddenCount > 0
            ? `${selection.hiddenCount} short visits with no interaction are hidden.`
            : undefined
      }
      action={
        <Link
          href="/admin/sessions"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          All sessions
        </Link>
      }
    >
      {range.beyondTrailHorizon ? (
        <TrailsClampedNotice
          rangeFrom={formatDay(range.from)}
          trailsFrom={formatDay(range.trailsFrom)}
          shown={sessions.length}
        />
      ) : null}

      {shown.length === 0 ? (
        <p className="px-4 py-6 text-sm text-[var(--text-muted)]">
          No visits recorded in this range.
        </p>
      ) : (
        <div className="flex flex-col gap-3 p-3">
          {shown.map((session) => (
            <SessionTrailView key={session.meta.sessionId} session={session} />
          ))}
        </div>
      )}
    </Panel>
  );
}

function WhatTheyRead({ paths }: { paths: PathRow[] }) {
  const byPath = new Map<string, PathRow[]>();
  for (const row of paths) {
    if (!row.path.startsWith("/blog/") && !row.path.startsWith("/projects/")) continue;
    const list = byPath.get(row.path) ?? [];
    list.push(row);
    byPath.set(row.path, list);
  }

  const rows = [...byPath.entries()]
    .map(([path, group]) => {
      const counts = sumCounters(group, ["views", "reads", "exits", "dwellMsSum", "dwellMsCount"] as const);
      const histogram = sumHistograms(group.map(histogramFromRow));
      const depth = readDepth({
        views: counts.views,
        ...sumCounters(group, ["s25", "s50", "s75", "s100"] as const),
      });
      return { path, counts, histogram, depth };
    })
    .sort((a, b) => b.counts.reads - a.counts.reads || b.counts.views - a.counts.views)
    .slice(0, 8);

  return (
    <Panel title="What they read" subtitle="blog posts and case studies only">
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-[var(--text-muted)]">Nothing read yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <Th>Page</Th>
              <Th align="right">Reads</Th>
              <Th align="right">Dwell</Th>
              <Th>Depth</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.path} className="border-b border-[var(--border)] last:border-b-0">
                <td className="max-w-0 truncate px-4 py-2 text-sm text-[var(--text-primary)]" title={row.path}>
                  {shortPath(row.path)}
                </td>
                <td className="px-2 py-2 text-right font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                  {row.counts.reads}
                </td>
                <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-[var(--text-secondary)]">
                  <Dwell histogram={row.histogram} n={row.counts.dwellMsCount} />
                </td>
                <td className="py-2 pr-4">
                  {row.depth ? <DepthRail depth={Math.round(row.depth.d100 * 100)} label={`${formatPercent(row.depth.d100)} reached the end`} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
}

/**
 * Below five observations this prints the durations themselves rather than a
 * median. Three numbers are more informative than their median and claim less.
 */
function Dwell({ histogram, n }: { histogram: number[]; n: number }) {
  if (n === 0) return <span className="text-[var(--text-muted)]">-</span>;

  // Below the gate, a median is a point estimate the data cannot support: with
  // one observation the interpolation lands on the bucket midpoint, so a 4m12s
  // read would render as "6m". The range is what is actually known.
  if (n < N_GATE) {
    const span = histogramRange(histogram);
    if (!span) return <span className="text-[var(--text-muted)]">-</span>;
    return (
      <span
        className="text-[var(--text-muted)]"
        title={`${n} reading${n === 1 ? "" : "s"}, too few for a median`}
      >
        {formatDuration(span.lo)} to {formatDuration(span.hi)}{" "}
        <span className="opacity-70">(n={n})</span>
      </span>
    );
  }

  const median = medianFromHistogram(histogram);
  if (median === null) return <span className="text-[var(--text-muted)]">-</span>;
  return <span>{formatDuration(median)}</span>;
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      scope="col"
      className={`px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// ─── Row builders ─────────────────────────────────────────────────

function dailyPoints(totals: { date: string; uniques?: number }[], range: ResolvedRange): DayPoint[] {
  const byDate = new Map(totals.map((row) => [row.date, row.uniques ?? 0]));
  const points: DayPoint[] = [];

  // Every day in the range gets a column, including the empty ones. A gap reads
  // as missing data; a zero-height tick reads as nobody came.
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
    points.push({
      date: day,
      value: byDate.get(day) ?? 0,
      beyondHorizon: day < range.trailsFrom,
    });
  }
  return points;
}

function collapse<T>(rows: T[], key: (row: T) => string, value: (row: T) => number) {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(key(row), (totals.get(key(row)) ?? 0) + value(row));
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

function topPaths(paths: PathRow[]): RankedRow[] {
  return collapse(paths, (r) => r.path, (r) => r.views ?? 0).map(([path, views]) => ({
    key: path,
    label: shortPath(path),
    title: path,
    value: views,
  }));
}

function topReferrers(data: { referrers: { host: string; sessions?: number }[] }): RankedRow[] {
  // Sorted by sessions, not views: a referrer sends a visit, and a visit that
  // reads five pages is still one referral.
  return collapse(data.referrers, (r) => r.host, (r) => r.sessions ?? 0).map(([host, sessions]) => ({
    key: host,
    label: referrerLabel(host),
    title: host,
    value: sessions,
  }));
}

function topCountries(data: { countries: { country: string; views?: number }[] }): RankedRow[] {
  return collapse(data.countries, (r) => r.country, (r) => r.views ?? 0).map(([code, views]) => ({
    key: code,
    label: countryName(code),
    title: code,
    value: views,
  }));
}

function topLinks(data: { links: { linkKind: string; linkTarget: string; clicks?: number }[] }): RankedRow[] {
  // Faceted by kind in the label rather than coloured by it: link kind has five
  // values and the theme's categorical palette safely seats three.
  const interesting = data.links.filter((row) => row.linkKind !== "anchor" && row.linkKind !== "internal");
  return collapse(
    interesting,
    (r) => `${r.linkKind}#${r.linkTarget}`,
    (r) => r.clicks ?? 0
  ).map(([key, clicks]) => {
    const [kind, ...rest] = key.split("#");
    const target = rest.join("#");
    return {
      key,
      label: shortPath(target, 28),
      title: `${linkKindLabel(kind)}: ${target}`,
      value: clicks,
      trailing: linkKindLabel(kind),
    };
  });
}
