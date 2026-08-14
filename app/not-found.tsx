import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

// No `robots` here: Next already emits noindex for the not-found boundary, and
// setting it again produces two meta robots tags.
export const metadata = {
  title: "Page not found",
};

// id="main" is the target of the skip link the root layout renders on every
// page, so without it the first tab stop on this route went nowhere.
export default function NotFound() {
  return (
    <main
      id="main"
      className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-6 text-center"
    >
      {/* Same page furniture as every other route: grid wash plus one accent glow */}
      <div
        className="grid-bg pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[110px]"
        style={{ backgroundColor: "var(--accent-glow)" }}
        aria-hidden="true"
      />

      <div className="animate-rise relative">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          Error 404
        </p>

        <p
          className="mt-4 font-display text-[clamp(4rem,3rem+6vw,8rem)] font-bold leading-none tracking-[-0.04em] text-[var(--accent)]"
          style={{ textShadow: "0 0 40px var(--accent-glow)" }}
          aria-hidden="true"
        >
          404
        </p>

        <h1 className="mt-4 font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--text-secondary)]">
          That URL doesn&apos;t exist. The case studies and the writing are both still where you
          left them.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-sm">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:text-[var(--accent)]"
          >
            <FiArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
            />
            Back to home
          </Link>
          <Link
            href="/projects"
            className="text-[var(--text-muted)] underline decoration-2 decoration-transparent underline-offset-[6px] transition-colors hover:text-[var(--text-primary)] hover:decoration-[var(--accent)] focus-visible:text-[var(--text-primary)] focus-visible:decoration-[var(--accent)]"
          >
            Projects
          </Link>
          <Link
            href="/blog"
            className="text-[var(--text-muted)] underline decoration-2 decoration-transparent underline-offset-[6px] transition-colors hover:text-[var(--text-primary)] hover:decoration-[var(--accent)] focus-visible:text-[var(--text-primary)] focus-visible:decoration-[var(--accent)]"
          >
            Writing
          </Link>
        </div>
      </div>
    </main>
  );
}
