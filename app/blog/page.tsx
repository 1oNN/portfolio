import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { getAllPosts } from "@/lib/blog-db";
import PostCard from "@/components/blog/PostCard";
import AnalyticsBeacon from "@/components/interactive/AnalyticsBeacon";
import type { BlogPost } from "@/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes and case studies on AI/ML engineering, research, and the systems I build.",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "blog", label: "Posts" },
  { key: "case-study", label: "Deep dives" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const requested = params?.type as FilterKey | undefined;
  const active: FilterKey = FILTERS.some((f) => f.key === requested) ? (requested as FilterKey) : "all";

  const posts = await getAllPosts(true);
  const filtered: BlogPost[] = active === "all" ? posts : posts.filter((p) => p.type === active);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <AnalyticsBeacon page="/blog" />
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
          >
            <FiArrowLeft size={15} />
            Back to home
          </Link>
          <Link
            href="/"
            aria-label="Back to home"
            className="font-mono text-sm font-bold text-[var(--accent)] transition-opacity hover:opacity-75 focus-visible:opacity-75"
          >
            ha<span className="text-[var(--accent-secondary)]">.</span>
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        {/* Page title */}
        <div className="space-y-4">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            ✦ Writing
          </span>
          <h1 className="font-display text-[clamp(3rem,2rem+3.5vw,5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[var(--text-primary)]">
            Writing &amp; notes
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            Notes on AI/ML engineering and research, plus deep dives into how specific systems were
            built.
          </p>
        </div>

        {/* Filter row - text links, no chunky pills */}
        <nav
          className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-2 border-y border-[var(--border)] py-4"
          aria-label="Filter posts by type"
        >
          {FILTERS.map((f) => {
            const isActive = active === f.key;
            const href = f.key === "all" ? "/blog" : `/blog?type=${f.key}`;
            const count =
              f.key === "all" ? posts.length : posts.filter((p) => p.type === f.key).length;
            return (
              <Link
                key={f.key}
                href={href}
                className={
                  isActive
                    ? "group relative inline-flex items-baseline gap-1.5 text-sm text-[var(--text-primary)] transition-colors"
                    : "group relative inline-flex items-baseline gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                }
              >
                <span
                  className={
                    isActive
                      ? "font-semibold underline decoration-2 decoration-[var(--accent)] underline-offset-[6px]"
                      : "underline decoration-2 decoration-transparent underline-offset-[6px] transition-colors group-hover:decoration-[var(--text-secondary)] group-focus-visible:decoration-[var(--text-secondary)]"
                  }
                >
                  {f.label}
                </span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{count}</span>
              </Link>
            );
          })}
        </nav>

        {filtered.length === 0 ? (
          <div
            className="mt-20 rounded-xl border border-[var(--border)] p-12 text-center"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <p className="text-[var(--text-secondary)]">
              No posts yet. Meanwhile, the project case studies go deep on the same work.
            </p>
            <Link
              href="/projects"
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
            >
              View the project case studies
              <FiArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
              />
            </Link>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-5">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
