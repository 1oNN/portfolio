/**
 * The real layout in muted blocks, not a spinner.
 *
 * On a range change the App Router holds the previous render until the new one
 * is ready, so this only appears on a cold navigation into the section. Nothing
 * reflows when the real data lands because the shapes match.
 */
export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6" aria-busy="true">
      <span className="sr-only">Loading analytics</span>

      <Block className="h-7 w-80" />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Block key={i} className="h-40" />
        ))}
      </div>

      <Block className="mt-4 h-44" />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Block className="h-72" />
          <Block className="h-56" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block key={i} className="h-44" />
          ))}
        </div>
      </div>
    </main>
  );
}

function Block({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)] ${className}`}
    />
  );
}
