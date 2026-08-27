import type { ReactNode } from "react";

export interface RankedRow {
  key: string;
  label: ReactNode;
  /** Plain text used for the title attribute, since label may be a node. */
  title?: string;
  value: number;
  trailing?: ReactNode;
}

/**
 * The workhorse of this dashboard: a ranked list as a real table with a CSS bar
 * in the last cell.
 *
 * Chosen over an SVG bar chart deliberately. Text stays selectable and
 * left-aligned, numbers get tabular-nums and right-align, long paths truncate
 * with real text-overflow, there is no viewBox arithmetic, and it IS the table
 * view, so the "every chart needs a table twin" requirement is satisfied by
 * construction rather than by building a second component.
 */
export default function RankedTable({
  rows,
  valueLabel = "count",
  emptyMessage = "Nothing yet.",
  max = 8,
}: {
  rows: RankedRow[];
  valueLabel?: string;
  emptyMessage?: string;
  max?: number;
}) {
  if (rows.length === 0) {
    return <p className="px-4 py-6 text-sm text-[var(--text-muted)]">{emptyMessage}</p>;
  }

  const shown = rows.slice(0, max);
  const peak = Math.max(...shown.map((r) => r.value), 1);
  const remainder = rows.length - shown.length;

  return (
    <div>
      <table className="w-full border-collapse">
        <caption className="sr-only">{valueLabel} by row, highest first</caption>
        <tbody>
          {shown.map((row) => (
            <tr key={row.key} className="border-b border-[var(--border)] last:border-b-0">
              <td
                className="max-w-0 truncate px-4 py-2 text-sm text-[var(--text-primary)]"
                title={row.title}
              >
                {row.label}
              </td>
              <td className="w-12 px-1 py-2 text-right font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                {row.value}
              </td>
              <td className="w-24 py-2 pr-4">
                <div className="h-2 w-full rounded-full bg-[var(--surface-elevated)]">
                  <div
                    // Square baseline, rounded data end: the bar reads as a
                    // measurement from zero rather than a floating pill.
                    className="h-2 rounded-r-full"
                    style={{
                      width: `${Math.max(4, (row.value / peak) * 100)}%`,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
              </td>
              {row.trailing ? (
                <td className="w-20 py-2 pr-4 text-right font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
                  {row.trailing}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {remainder > 0 ? (
        <p className="px-4 py-2 font-mono text-[11px] text-[var(--text-muted)]">
          + {remainder} more
        </p>
      ) : null}
    </div>
  );
}
