import Link from "next/link";

import RangePicker from "@/components/admin/RangePicker";
import SessionTrailView from "@/components/admin/SessionTrailView";
import { Card, Panel } from "@/components/admin/ui/Panel";
import { TrailsClampedNotice, TrailsExpiredState } from "@/components/admin/ui/EmptyState";
import {
  countryName,
  formatDateTime,
  formatDay,
  formatDuration,
  shortPath,
  shortSessionId,
} from "@/lib/analytics-format";
import { getScoredSessions } from "@/lib/analytics-read";
import {
  resolveRange,
  selectSessions,
  type ScoredSession,
  type SessionListMode,
} from "@/lib/analytics-select";

export const dynamic = "force-dynamic";

const MODES: Array<{ mode: SessionListMode; label: string }> = [
  { mode: "notable", label: "Notable" },
  { mode: "deep", label: "Deep reads" },
  { mode: "all", label: "All" },
];

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = resolveRange({
    range: typeof params.range === "string" ? params.range : undefined,
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
  });

  const mode: SessionListMode =
    params.mode === "deep" || params.mode === "all" ? params.mode : "notable";
  const country = typeof params.country === "string" ? params.country : undefined;

  const all = await getScoredSessions(range);
  const filtered = country ? all.filter((s) => s.meta.country === country) : all;
  const selection = selectSessions(filtered, mode);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <RangePicker range={range} basePath="/admin/sessions" />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {MODES.map((option) => {
          const active = option.mode === mode;
          const query = new URLSearchParams({ range: range.preset, mode: option.mode });
          if (country) query.set("country", country);
          return (
            <Link
              key={option.mode}
              href={`/admin/sessions?${query.toString()}`}
              aria-current={active ? "true" : undefined}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] tracking-wide transition-colors focus-visible:outline-none ${
                active
                  ? "bg-[var(--accent-strong)] text-[var(--accent-contrast)]"
                  : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
              }`}
            >
              {option.label}
            </Link>
          );
        })}

        {country ? (
          <Link
            href={`/admin/sessions?range=${range.preset}&mode=${mode}`}
            className="font-mono text-[11px] text-[var(--accent)] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            Clear {countryName(country)} filter
          </Link>
        ) : null}

        <span className="ml-auto font-mono text-[11px] text-[var(--text-muted)]">
          {selection.shown.length} of {filtered.length}
        </span>
      </div>

      {range.trailsExpired ? (
        <Card className="mt-4">
          <TrailsExpiredState from={formatDay(range.from)} to={formatDay(range.to)} />
        </Card>
      ) : (
        <Panel
          title={mode === "all" ? "All sessions" : mode === "deep" ? "Deep reads" : "Notable visits"}
          subtitle={subtitleFor(selection, filtered.length)}
          className="mt-4"
        >
          {range.beyondTrailHorizon ? (
            <TrailsClampedNotice
              rangeFrom={formatDay(range.from)}
              trailsFrom={formatDay(range.trailsFrom)}
              shown={filtered.length}
            />
          ) : null}

          {selection.shown.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--text-muted)]">
              {country
                ? `No sessions match ${countryName(country)} in this range.`
                : "No sessions recorded in this range."}
            </p>
          ) : (
            <div className="flex flex-col gap-3 p-3">
              {selection.shown.map((session) =>
                // In "all" mode a bounce collapses to a single line. There is
                // room for it at this volume, and the bounce is part of the
                // picture, but it does not deserve a whole card.
                mode === "all" && session.signal.bounce ? (
                  <CompactRow key={session.meta.sessionId} session={session} />
                ) : (
                  <SessionTrailView key={session.meta.sessionId} session={session} />
                )
              )}
            </div>
          )}
        </Panel>
      )}
    </main>
  );
}

function subtitleFor(
  selection: ReturnType<typeof selectSessions>,
  total: number
): string | undefined {
  if (selection.relaxed) return `Showing all ${total}, too few to filter.`;
  if (selection.hiddenCount > 0) {
    return selection.mode === "deep"
      ? `${selection.hiddenCount} shorter visits are not shown.`
      : `${selection.hiddenCount} short visits with no interaction are hidden.`;
  }
  return undefined;
}

function CompactRow({ session }: { session: ScoredSession }) {
  const { meta } = session;
  return (
    <Link
      href={`/admin/sessions/${meta.sessionId}`}
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-secondary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-secondary)] focus-visible:outline-none"
    >
      <span className="text-[var(--text-secondary)]">{shortSessionId(meta.sessionId)}</span>
      <span>{formatDateTime(meta.startedAt)}</span>
      <span>{countryName(meta.country)}</span>
      <span>{formatDuration(meta.dwellMsTotal ?? 0)}</span>
      <span className="truncate">{shortPath(meta.entryPath ?? "/", 24)}</span>
      <span className="ml-auto">bounce</span>
    </Link>
  );
}
