import Link from "next/link";

/**
 * Four genuinely different truths, which must never share a message:
 * the pipeline has never written anything, nobody visited in this range, the
 * trails for this range have expired, or the filters matched nothing.
 * Conflating them is how a dashboard teaches its owner to distrust it.
 */

const LINK_CLASS =
  "font-mono text-[11px] uppercase tracking-widest text-[var(--accent)] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none";

export function DayOneState({
  configured,
  reachable,
  tableName,
}: {
  configured: boolean;
  reachable: boolean;
  tableName: string | null;
}) {
  return (
    <div className="px-4 py-8">
      <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
        Nothing recorded yet.
      </h3>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--text-secondary)]">
        The beacon fires on every page view. Open the site in another tab and this page will have
        something within a minute.
      </p>

      {/*
        On day one "no traffic" and "the pipeline is broken" produce identical
        screens, and that ambiguity is the most frustrating hour of standing up
        any analytics system. Three checks turn it into a glance.
      */}
      <dl className="mt-5 space-y-2">
        <Check
          label="Beacon"
          ok
          detail="mounted in app/layout.tsx"
          okWord="installed"
          badWord="missing"
        />
        <Check
          label="Table configured"
          ok={configured}
          detail={tableName ?? "DYNAMODB_ANALYTICS_TABLE is not set"}
          okWord="set"
          badWord="unset"
        />
        <Check
          label="Table reachable"
          ok={reachable}
          detail={reachable ? "query succeeded" : "query failed, see CloudWatch"}
          okWord="reachable"
          badWord="unreachable"
        />
      </dl>

      <p className="mt-5">
        <Link href="/" className={LINK_CLASS}>
          Open the site
        </Link>
      </p>
    </div>
  );
}

/** Colour is never the only signal: the word sits next to the dot. */
function Check({
  label,
  ok,
  detail,
  okWord,
  badWord,
}: {
  label: string;
  ok: boolean;
  detail: string;
  okWord: string;
  badWord: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <dt className="w-36 shrink-0 font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="flex items-baseline gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: ok ? "var(--success)" : "var(--danger)" }}
        />
        <span
          className="font-mono text-xs"
          style={{ color: ok ? "var(--success)" : "var(--danger)" }}
        >
          {ok ? okWord : badWord}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{detail}</span>
      </dd>
    </div>
  );
}

export function NoVisitsState({
  from,
  to,
  lastWriteDay,
}: {
  from: string;
  to: string;
  lastWriteDay: string | null;
}) {
  return (
    <div className="px-4 py-8">
      <p className="text-sm text-[var(--text-secondary)]">
        No visits between {from} and {to}.
        {lastWriteDay ? ` The most recent day with any traffic was ${lastWriteDay}.` : ""}
      </p>
    </div>
  );
}

export function TrailsExpiredState({ from, to }: { from: string; to: string }) {
  return (
    <div className="px-4 py-8">
      <p className="max-w-prose text-sm leading-relaxed text-[var(--text-secondary)]">
        No session trails exist for {from} to {to}. Raw events from that period were deleted after
        90 days. The counts, pages, referrers and countries above are complete and are kept
        permanently.
      </p>
      <p className="mt-4">
        <Link href="/admin?range=90d" className={LINK_CLASS}>
          Narrow the range to 90d
        </Link>
      </p>
    </div>
  );
}

export function TrailsClampedNotice({
  rangeFrom,
  trailsFrom,
  shown,
}: {
  rangeFrom: string;
  trailsFrom: string;
  shown: number;
}) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
      <p className="max-w-prose text-xs leading-relaxed text-[var(--text-secondary)]">
        Session trails are kept for 90 days, but your range starts {rangeFrom}. Showing trails from{" "}
        {trailsFrom} onward: {shown === 1 ? "1 visit" : `${shown} visits`}. The counts, pages,
        referrers and countries above cover the full range.
      </p>
    </div>
  );
}
