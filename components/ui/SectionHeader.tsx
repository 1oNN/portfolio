interface SectionHeaderProps {
  number?: string;
  eyebrow: string;
  title: string;
  description?: string;
  accent?: string;
  /** "lg" = home-page scale; case-study pages keep the denser default */
  size?: "default" | "lg";
  /** Render the description as a display-font statement line (one per page) */
  statement?: boolean;
}

export default function SectionHeader({
  number,
  eyebrow,
  title,
  description,
  accent,
  size = "default",
  statement = false,
}: SectionHeaderProps) {
  return (
    <div className="space-y-3">
      <span
        className="font-mono text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: accent ?? "var(--accent)" }}
      >
        {number && <span style={{ color: "var(--text-muted)" }}>{number} · </span>}
        {eyebrow}
      </span>
      <h2
        className={
          size === "lg"
            ? "font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl"
            : "font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
        }
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      {description &&
        (statement ? (
          // Measures are in rem, not max-w-2xl. The reading column is
          // lg:w-[54%] of max-w-6xl, about 38.9rem, so max-w-2xl (42rem) was
          // wider than its own container and never clamped anything: body copy
          // ran 95-105 characters a line, well past the 60-75 that reads
          // comfortably. These values are narrower than the column, so they bite.
          <p
            className="max-w-[32rem] font-display text-xl font-medium leading-snug sm:text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            {description}
          </p>
        ) : (
          <p
            className="max-w-[34rem] text-base leading-[1.7]"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        ))}
    </div>
  );
}
