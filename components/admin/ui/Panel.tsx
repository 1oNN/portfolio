import type { ReactNode } from "react";

/**
 * Card and panel shells for the admin surface.
 *
 * Styled with Tailwind utilities over CSS variables, following
 * components/blog/PostCard.tsx rather than the inline-style pattern the older
 * admin pages use. The rule that matters: a property that ever changes on hover
 * or focus must be a Tailwind class, because an inline style on the same
 * property silently kills the hover variant. That trap is why the previous
 * admin dashboard shipped with no hover and no focus states at all.
 */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "muted" | "danger";
}) {
  // color-mix keeps the pill tinted by whatever the active theme's accent is,
  // rather than pinning a colour that only works in one mode.
  //
  // These are 10px uppercase labels, so the 4.5:1 small-text floor applies
  // rather than the 3:1 large-text one. The tones are separated by background
  // weight rather than by text colour, which keeps every one of them clear of
  // that floor in both themes without needing a per-tone contrast check.
  const tones: Record<string, string> = {
    neutral: "text-[var(--text-secondary)] bg-[color-mix(in_srgb,var(--text-muted)_14%,transparent)]",
    accent: "text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]",
    muted: "text-[var(--text-secondary)] bg-[color-mix(in_srgb,var(--text-muted)_8%,transparent)]",
    danger: "text-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
