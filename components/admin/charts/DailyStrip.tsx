import { formatDay } from "@/lib/analytics-format";

export interface DayPoint {
  date: string;
  value: number;
  /** True when this day is older than the 90 day trail horizon. */
  beyondHorizon?: boolean;
}

/**
 * One column per day, single series, hand-rolled SVG.
 *
 * Columns rather than a line because integer counts between zero and eight are
 * not continuous, and a line would draw slopes that were never measured. One
 * series means no legend is needed: the panel title names it.
 */
export default function DailyStrip({
  points,
  height = 120,
  label,
}: {
  points: DayPoint[];
  height?: number;
  label: string;
}) {
  if (points.length === 0) return null;

  // Floor the axis. Without it, a peak of two renders a full-height column and
  // a quiet month looks like a spike, which is a lie of scale.
  const peak = Math.max(...points.map((p) => p.value), 5);

  const width = 100;
  const gap = 0.35;
  const slot = width / points.length;
  const barWidth = Math.max(slot - gap, 0.4);
  const plot = height - 18;

  const firstBeyond = points.findIndex((p) => !p.beyondHorizon);
  const horizonX = firstBeyond > 0 ? firstBeyond * slot : null;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-[120px] w-full"
        role="img"
        aria-label={`${label}. Peak ${Math.max(...points.map((p) => p.value))} on a ${points.length} day range.`}
      >
        {/* Solid hairlines at zero and max only. Dashed gridlines read as a
            threshold or a projection when they are just a grid. */}
        <line x1="0" y1={plot} x2={width} y2={plot} stroke="var(--border)" strokeWidth="0.4" />
        <line x1="0" y1="2" x2={width} y2="2" stroke="var(--border)" strokeWidth="0.3" />

        {horizonX !== null ? (
          <line
            x1={horizonX}
            y1="0"
            x2={horizonX}
            y2={plot}
            stroke="var(--text-muted)"
            strokeWidth="0.3"
            opacity="0.6"
          />
        ) : null}

        {points.map((point, i) => {
          const x = i * slot + gap / 2;
          // A zero day is drawn as a baseline tick, never omitted. A gap reads
          // as missing data; a tick reads as nobody came.
          const barHeight = point.value === 0 ? 0.8 : Math.max(1.5, (point.value / peak) * plot);
          return (
            <rect
              key={point.date}
              x={x}
              y={plot - barHeight}
              width={barWidth}
              height={barHeight}
              rx={point.value === 0 ? 0 : 0.6}
              fill={point.value === 0 ? "var(--border)" : "var(--accent)"}
              opacity={point.beyondHorizon ? 0.4 : 1}
            >
              <title>{`${formatDay(point.date)}: ${point.value === 0 ? "nobody" : point.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
        <span>{formatDay(points[0].date)}</span>
        <span>
          {peak === 5 && Math.max(...points.map((p) => p.value)) < 5 ? "scale to 5" : `peak ${peak}`}
        </span>
        <span>{formatDay(points[points.length - 1].date)}</span>
      </figcaption>
    </figure>
  );
}
