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
          <p
            className="max-w-2xl font-display text-xl font-medium leading-snug sm:text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            {description}
          </p>
        ) : (
          <p
            className="max-w-2xl text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        ))}
    </div>
  );
}
