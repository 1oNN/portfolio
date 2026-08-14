"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";
import PostCard, { type PostCardView } from "@/components/blog/PostCard";
import { POST_TYPE_LABEL_PLURAL } from "@/lib/post-labels";

const FILTERS = [
  { key: "all", label: "All" },
  // Labels come from lib/post-labels so the filter nav, the cards, the home
  // rows and the post badge cannot drift apart again.
  { key: "blog", label: POST_TYPE_LABEL_PLURAL.blog },
  { key: "case-study", label: POST_TYPE_LABEL_PLURAL["case-study"] },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

/**
 * The filter reads ?type= here rather than in the page's searchParams.
 *
 * Reading searchParams in the server page opted the whole /blog segment out of
 * static rendering, so `export const revalidate` was dead and every single
 * request ran a full DynamoDB table scan. Pulling it into a client leaf behind
 * Suspense lets the page go back to ISR while keeping the filtered URLs
 * shareable and the links crawlable.
 */
export default function BlogList({ posts }: { posts: PostCardView[] }) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("type") as FilterKey | null;
  const active: FilterKey = FILTERS.some((f) => f.key === requested)
    ? (requested as FilterKey)
    : "all";

  const filtered = active === "all" ? posts : posts.filter((p) => p.type === active);

  return (
    <>
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
              aria-current={isActive ? "true" : undefined}
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
    </>
  );
}
