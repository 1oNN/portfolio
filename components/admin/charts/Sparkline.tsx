/**
 * A dot strip, never a line.
 *
 * At counts between zero and three a line draws slopes that do not exist, which
 * is the fastest way to make a quiet month look like a trend. Cells encode
 * magnitude by opacity and height instead, and a zero day is drawn as a
 * baseline tick rather than a gap: a gap reads as missing data, a tick reads as
 * nobody came.
 */
export default function Sparkline({ values, cells = 15 }: { values: number[]; cells?: number }) {
  const series = values.slice(-cells);
  const max = Math.max(...series, 1);

  return (
    <div className="flex h-4 items-end gap-[2px]" aria-hidden="true">
      {series.map((value, i) => {
        const ratio = value / max;
        return (
          <span
            key={i}
            className="w-full rounded-[1px]"
            style={{
              // Floor at 2px so a zero day is a visible tick.
              height: value === 0 ? "2px" : `${Math.max(20, ratio * 100)}%`,
              backgroundColor: value === 0 ? "var(--border)" : "var(--accent)",
              opacity: value === 0 ? 1 : 0.35 + ratio * 0.65,
            }}
          />
        );
      })}
    </div>
  );
}
