import Link from "next/link";

import { formatRange } from "@/lib/analytics-format";
import type { RangePreset, ResolvedRange } from "@/types/analytics";

/**
 * Presets are links, not buttons, so the common path ships no client JS, the
 * back button works, and a range is shareable.
 *
 * The divider after 90d is the point of the control: presets to its right carry
 * rollups only, because session trails are deleted after 90 days. Putting that
 * boundary in the control means it is visible before you click rather than
 * discovered as a mysteriously empty session list.
 */

const WITH_TRAILS: Array<{ preset: RangePreset; label: string }> = [
  { preset: "7d", label: "7d" },
  { preset: "30d", label: "30d" },
  { preset: "90d", label: "90d" },
];

const ROLLUPS_ONLY: Array<{ preset: RangePreset; label: string }> = [
  { preset: "12mo", label: "12mo" },
  { preset: "all", label: "All" },
];

export default function RangePicker({ range, basePath }: { range: ResolvedRange; basePath: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Range
      </span>

      <div className="flex items-center gap-1">
        {WITH_TRAILS.map((option) => (
          <Preset key={option.preset} {...option} active={range.preset} basePath={basePath} />
        ))}
      </div>

      <span aria-hidden="true" className="h-5 w-px bg-[var(--border)]" />

      <div className="flex items-center gap-1">
        {ROLLUPS_ONLY.map((option) => (
          <Preset
            key={option.preset}
            {...option}
            active={range.preset}
            basePath={basePath}
            rollupsOnly
          />
        ))}
      </div>

      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        {formatRange(range.from, range.to)}
      </span>
    </div>
  );
}

function Preset({
  preset,
  label,
  active,
  basePath,
  rollupsOnly = false,
}: {
  preset: RangePreset;
  label: string;
  active: RangePreset;
  basePath: string;
  rollupsOnly?: boolean;
}) {
  const isActive = active === preset;

  return (
    <Link
      href={`${basePath}?range=${preset}`}
      aria-current={isActive ? "true" : undefined}
      title={rollupsOnly ? "Rollups only. Session trails are kept 90 days." : undefined}
      className={`inline-flex items-center rounded-md px-2.5 py-1 font-mono text-[11px] tracking-wide transition-colors focus-visible:outline-none ${
        isActive
          ? // accent-contrast, never #fff: white on the dark-mode green is 1.92:1.
            "bg-[var(--accent-strong)] text-[var(--accent-contrast)]"
          : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
      }`}
    >
      {label}
      {rollupsOnly ? (
        <sup className="ml-0.5 text-[8px] text-current opacity-70">R</sup>
      ) : null}
    </Link>
  );
}
