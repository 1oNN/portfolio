/**
 * Four cells for the 25/50/75/100 scroll milestones.
 *
 * Four divs rather than SVG, because that is all this needs. Used inside the
 * session trail, where it collapses what would otherwise be four separate event
 * rows per page into one glyph. Without that collapse a four-page visit renders
 * as twenty rows of noise, and the trail stops being readable.
 */
export default function DepthRail({ depth, label }: { depth: number; label?: string }) {
  const cells = [25, 50, 75, 100];

  return (
    <span className="inline-flex items-center gap-1.5" title={label ?? `Reached ${depth}%`}>
      <span className="inline-flex gap-[2px]" aria-hidden="true">
        {cells.map((cell) => (
          <span
            key={cell}
            className="inline-block h-2 w-2 rounded-[1px]"
            style={{
              backgroundColor: depth >= cell ? "var(--accent)" : "var(--surface-elevated)",
              border: depth >= cell ? "none" : "1px solid var(--border)",
            }}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">{depth}%</span>
    </span>
  );
}
