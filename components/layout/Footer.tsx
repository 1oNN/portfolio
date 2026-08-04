export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 font-mono text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>© {year} Hammad Ahmad · Built with Next.js</p>
        <a
          href="#top"
          className="transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
