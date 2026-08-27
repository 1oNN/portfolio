import type { ReactNode } from "react";

import Sparkline from "@/components/admin/charts/Sparkline";
import { Card } from "./Panel";

/**
 * A headline number with its own qualifier underneath.
 *
 * The value uses the display face at a large size, following the precedent in
 * components/project-visuals/ResultsCharts.tsx where the donut's centre figure
 * is display while every supporting value is mono. Mono at 44px is genuinely
 * worse here: every digit gets the width of a zero, so a three digit number
 * reads loose.
 */
export default function StatTile({
  label,
  qualifier,
  value,
  sub,
  series,
  delta,
}: {
  label: string;
  qualifier?: string;
  value: ReactNode;
  sub?: ReactNode;
  series?: number[];
  delta?: string;
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
          {label}
        </div>
        {qualifier ? (
          <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{qualifier}</div>
        ) : null}
      </div>

      <div className="font-display text-[2.75rem] leading-none font-bold tabular-nums text-[var(--text-primary)]">
        {value}
      </div>

      {sub ? <div className="text-xs text-[var(--text-secondary)]">{sub}</div> : null}

      {series && series.length > 0 ? <Sparkline values={series} /> : null}

      {delta ? (
        <div className="font-mono text-[11px] text-[var(--text-muted)]">{delta}</div>
      ) : null}
    </Card>
  );
}
