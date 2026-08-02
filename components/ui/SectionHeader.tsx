interface SectionHeaderProps {
  number?: string;
  eyebrow: string;
  title: string;
  description?: string;
  accent?: string;
}

export default function SectionHeader({
  number,
  eyebrow,
  title,
  description,
  accent,
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
        className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="max-w-2xl text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
