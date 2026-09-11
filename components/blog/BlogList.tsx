"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import PostCard, { type PostCardView } from "@/components/blog/PostCard";
import FilterRail from "@/components/ui/FilterRail";
import { useListingFilter } from "@/hooks/useListingFilter";
import { chipCounts, matchesChips, matchesQuery } from "@/lib/listing-filter";
import { POST_TYPE_LABEL_PLURAL } from "@/lib/post-labels";

const TAB_KEYS = ["all", "blog", "case-study"] as const;

const TAB_LABELS: Record<string, string> = {
  all: "All",
  // Labels come from lib/post-labels so the filter row, the cards, the home
  // rows and the post badge cannot drift apart again.
  blog: POST_TYPE_LABEL_PLURAL.blog,
  "case-study": POST_TYPE_LABEL_PLURAL["case-study"],
};

/** Everything the search box reads. Body text is deliberately not here: it
 *  stays on the server, and a query that matches a word buried in paragraph
 *  nine returns a card that looks like a false positive. */
function haystack(post: PostCardView): string {
  return [post.title, post.excerpt, ...post.tags].join(" ");
}

/**
 * The list, its filters and its search, with the URL as a mirror.
 *
 * Reading `searchParams` in the server page opted the whole /blog segment out
 * of static rendering, so `export const revalidate` was dead and every request
 * ran a full DynamoDB table scan. That is why the filter lives in a client leaf
 * behind Suspense. It now also means the filter can be instant: state lives in
 * `useListingFilter` and the URL is written with `replaceState`, so narrowing a
 * list already in memory costs no round trip and the links stay shareable.
 */
export default function BlogList({ posts }: { posts: PostCardView[] }) {
  const filter = useListingFilter({
    basePath: "/blog",
    tabParam: "type",
    chipParam: "tag",
    tabKeys: TAB_KEYS,
  });

  const { filtered, tabs, tags } = useMemo(() => {
    const byQuery = posts.filter((p) => matchesQuery(haystack(p), filter.query));

    // Every count has to answer "what am I left with if I click this", which is
    // the rule the facet-counts post argues for, and the two rows need
    // different arithmetic to get there.
    //
    // Tabs are single-select, so clicking one REPLACES the current tab: their
    // counts leave the tab dimension out.
    const forTabs = byQuery.filter((p) => matchesChips(p.tags, filter.chips));
    const filtered = byQuery
      .filter((p) => filter.tab === "all" || p.type === filter.tab)
      .filter((p) => matchesChips(p.tags, filter.chips));

    return {
      filtered,
      tabs: TAB_KEYS.map((key) => ({
        key,
        label: TAB_LABELS[key],
        count: key === "all" ? forTabs.length : forTabs.filter((p) => p.type === key).length,
      })),
      // Chips are additive AND, so clicking one NARROWS what is already on
      // screen. Counting them against the unfiltered set would advertise a 5 on
      // a chip that yields nothing. For a selected chip this is the result
      // count, which is what it is currently contributing to.
      tags: chipCounts(posts.map((p) => p.tags)).map((c) => ({
        ...c,
        count: filtered.filter((p) => p.tags.includes(c.value)).length,
      })),
    };
  }, [posts, filter.query, filter.tab, filter.chips]);

  return (
    <>
      <FilterRail
        filter={filter}
        tabs={tabs}
        tabsLabel="Filter posts by type"
        chips={tags}
        chipsLabel="Tags"
        searchPlaceholder="Search writing"
        resultCount={filtered.length}
        totalCount={posts.length}
        noun={["post", "posts"]}
      />

      {filtered.length === 0 ? (
        <div
          className="mt-12 rounded-xl border border-[var(--border)] p-12 text-center"
          style={{ backgroundColor: "var(--surface)" }}
        >
          {posts.length === 0 ? (
            <>
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
            </>
          ) : (
            <>
              {/* Name what is doing the filtering. "No results" leaves the
                  reader to work out which of three controls emptied the list. */}
              <p className="text-[var(--text-secondary)]">
                Nothing matches{filter.query ? ` “${filter.query.trim()}”` : ""}
                {filter.chips.length > 0 ? ` in ${filter.chips.join(" + ")}` : ""}
                {filter.tab !== "all" ? ` under ${TAB_LABELS[filter.tab]}` : ""}.
              </p>
              <button
                type="button"
                onClick={filter.clear}
                className="mt-4 text-sm font-medium text-[var(--accent)] underline underline-offset-4"
              >
                Clear the filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          // Keyed on the filter so the list animates as a new set rather than
          // silently swapping rows under a reader who is still looking at them.
          key={`${filter.tab}|${filter.query}|${filter.chips.join(",")}`}
          className="filter-reveal mt-10 flex flex-col gap-5"
        >
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
