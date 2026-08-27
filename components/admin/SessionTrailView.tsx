import DepthRail from "@/components/admin/charts/DepthRail";
import { Badge } from "@/components/admin/ui/Panel";
import {
  countryName,
  formatDateTime,
  formatDuration,
  formatElapsed,
  linkKindLabel,
  shortSessionId,
} from "@/lib/analytics-format";
import type { ScoredSession } from "@/lib/analytics-select";
import type { TrailEvent } from "@/types/analytics";

/**
 * One visit, rendered as a story.
 *
 * The density decision that makes this readable: the four scroll milestones
 * collapse into a single depth rail on the page they belong to. Left as
 * separate rows, a four-page visit is twenty rows of noise.
 *
 * Event type is carried by the label and a glyph, never by colour. There are
 * five types and the theme's categorical palette safely seats three, so hue is
 * not available even if it were a good idea.
 */

interface Row {
  elapsedMs: number;
  glyph: string;
  label: string;
  detail?: string;
  depth?: number;
  dwellMs?: number;
  terminal?: boolean;
}

function buildRows(session: ScoredSession): Row[] {
  const start = Date.parse(session.meta.startedAt);
  const exitsByPage = new Map<string, TrailEvent>();
  for (const event of session.events) {
    if (event.type === "exit") exitsByPage.set(event.pageId, event);
  }

  const rows: Row[] = [];
  let seenPageview = false;

  for (const event of session.events) {
    const elapsedMs = Math.max(0, Date.parse(event.at) - start);

    if (event.type === "pageview") {
      const exit = exitsByPage.get(event.pageId);
      rows.push({
        elapsedMs,
        glyph: seenPageview ? ">" : "*",
        label: seenPageview ? event.path : `Arrived at ${event.path}`,
        detail:
          !seenPageview && event.referrerHost && event.referrerHost !== "direct"
            ? `from ${event.referrerHost}`
            : undefined,
        depth: exit?.maxScroll,
        dwellMs: exit?.dwellMs,
      });
      seenPageview = true;
      continue;
    }

    if (event.type === "click") {
      rows.push({
        elapsedMs,
        glyph: event.linkKind === "cv-download" ? "v" : event.linkKind === "mailto" ? "@" : "^",
        label: `${linkKindLabel(event.linkKind ?? "")}: ${event.linkTarget ?? ""}`,
      });
      continue;
    }

    if (event.type === "agent_open") {
      rows.push({ elapsedMs, glyph: "?", label: "Opened the agent console" });
    }
    // Scroll events are collapsed into the depth rail above; exits are folded
    // into their pageview row and summarised by the terminal row below.
  }

  const lastExit = session.events.filter((e) => e.type === "exit").pop();
  if (lastExit) {
    rows.push({
      elapsedMs: Math.max(0, Date.parse(lastExit.at) - start),
      glyph: "o",
      label: `Left from ${lastExit.path}`,
      terminal: true,
    });
  }

  return rows;
}

export default function SessionTrailView({
  session,
  headingLevel = "h3",
}: {
  session: ScoredSession;
  headingLevel?: "h2" | "h3";
}) {
  const rows = buildRows(session);
  const { meta, signal } = session;
  const Heading = headingLevel;

  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--border)] px-4 py-3">
        <Heading className="font-mono text-sm font-bold text-[var(--text-primary)]">
          {shortSessionId(meta.sessionId)}
        </Heading>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {formatDateTime(meta.startedAt)}
        </span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {countryName(meta.country)}
        </span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">{meta.device}</span>
        {meta.dwellMsTotal ? (
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {formatDuration(meta.dwellMsTotal)}
          </span>
        ) : null}
        {signal.bounce ? (
          <span className="ml-auto">
            <Badge tone="muted">bounce</Badge>
          </span>
        ) : null}
      </div>

      {/* Generated from the same rules that scored the session, so the filter is
          auditable rather than magic. */}
      {signal.reasons.length > 0 ? (
        <p className="border-b border-[var(--border)] px-4 py-2 text-xs text-[var(--text-secondary)]">
          {signal.reasons.join(" . ")}
        </p>
      ) : null}

      <ol className="px-4 py-3">
        {rows.map((row, i) => (
          <li key={i} className="flex gap-3 py-1">
            <span className="w-12 shrink-0 pt-px text-right font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
              {formatElapsed(row.elapsedMs)}
            </span>
            <span
              aria-hidden="true"
              className="w-3 shrink-0 pt-px text-center font-mono text-[11px]"
              style={{ color: row.terminal ? "var(--text-muted)" : "var(--accent)" }}
            >
              {row.glyph}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm text-[var(--text-primary)]">
                {row.label}
              </span>
              {row.detail ? (
                <span className="block font-mono text-[11px] text-[var(--text-muted)]">
                  {row.detail}
                </span>
              ) : null}
              {row.depth !== undefined || row.dwellMs !== undefined ? (
                <span className="mt-1 flex flex-wrap items-center gap-3">
                  {row.depth !== undefined ? <DepthRail depth={row.depth} /> : null}
                  {row.dwellMs !== undefined ? (
                    <span className="font-mono text-[11px] tabular-nums text-[var(--text-secondary)]">
                      {formatDuration(row.dwellMs)}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {/*
        Not optional, and placed where someone is most likely to forget it. The
        salt rotates every midnight and the old one is destroyed, so there is no
        way to connect this person to any other day.
      */}
      <p className="border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
        {shortSessionId(meta.sessionId)} is a same-day identifier. If this person came back
        tomorrow, we cannot tell.
      </p>
    </article>
  );
}
