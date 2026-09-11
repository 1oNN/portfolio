"use client";

import { Fragment, useMemo, type ReactNode } from "react";
import type { Project } from "@/types";
import FilterRail from "@/components/ui/FilterRail";
import { useListingFilter } from "@/hooks/useListingFilter";
import { chipCounts, matchesChips, matchesQuery } from "@/lib/listing-filter";

const TAB_KEYS = ["all", "research", "engineering", "ml", "fullstack"] as const;

const TAB_LABELS: Record<string, string> = {
  all: "All",
  research: "Research",
  engineering: "Engineering",
  ml: "Machine Learning",
  fullstack: "Full-stack",
};

export interface ProjectCard {
  id: string;
  category: Project["category"];
  /**
   * Title, tagline and stack, flattened on the server.
   *
   * The card itself arrives as an already-rendered node, so there is nothing
   * here for the client to read; without this the search box would have no text
   * to match. Rendering the cards in the browser instead would drag the whole
   * of lib/case-studies into the bundle.
   */
  search: string;
  /** Stack chips, also flattened server-side. */
  tech: string[];
  node: ReactNode;
}

interface Props {
  /** Default-size cards, in PROJECTS order. */
  cards: ProjectCard[];
  /** The first two, rendered again at size="lead". Only shown unfiltered. */
  leadCards: ReactNode;
}

/**
 * The ?category= filter reads the URL here rather than in the page's
 * searchParams, which used to opt the whole segment out of static rendering, so
 * a page whose only data source is a six-item constant was server-rendered on
 * every request. Filtering is now instant on top of that: state lives in
 * `useListingFilter` and the URL follows via `replaceState`.
 */
export default function ProjectsFilter({ cards, leadCards }: Props) {
  const filter = useListingFilter({
    basePath: "/projects",
    tabParam: "category",
    chipParam: "tech",
    tabKeys: TAB_KEYS,
  });

  const { filtered, tabs, stack } = useMemo(() => {
    const byQuery = cards.filter((c) => matchesQuery(c.search, filter.query));
    // Tabs are single-select, so a click replaces the current category and the
    // counts leave that dimension out. Chips are additive AND, so their counts
    // are taken against what is already on screen: a chip has to predict its
    // own click or it is decoration. Same rule as the blog listing.
    const forTabs = byQuery.filter((c) => matchesChips(c.tech, filter.chips));
    const filtered = byQuery
      .filter((c) => filter.tab === "all" || c.category === filter.tab)
      .filter((c) => matchesChips(c.tech, filter.chips));

    return {
      filtered,
      tabs: TAB_KEYS.map((key) => ({
        key,
        label: TAB_LABELS[key],
        count: key === "all" ? forTabs.length : forTabs.filter((c) => c.category === key).length,
      })),
      stack: chipCounts(cards.map((c) => c.tech)).map((chip) => ({
        ...chip,
        count: filtered.filter((c) => c.tech.includes(chip.value)).length,
      })),
    };
  }, [cards, filter.query, filter.tab, filter.chips]);

  // The lead pair gets the large treatment, but only in the unfiltered view.
  // Filtered views stay uniform so a small result set never reads as a lone-card bug.
  const showLead = !filter.isFiltering;
  const rest = showLead ? filtered.slice(2) : filtered;

  return (
    <>
      <FilterRail
        filter={filter}
        tabs={tabs}
        tabsLabel="Filter projects by category"
        chips={stack}
        chipsLabel="Stack"
        searchPlaceholder="Search projects"
        resultCount={filtered.length}
        totalCount={cards.length}
        noun={["project", "projects"]}
      />

      {filtered.length === 0 ? (
        <div
          className="mt-12 rounded-xl border p-12 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
        >
          <p style={{ color: "var(--text-secondary)" }}>
            No projects match{filter.query ? ` “${filter.query.trim()}”` : ""}
            {filter.chips.length > 0 ? ` in ${filter.chips.join(" + ")}` : ""}
            {filter.tab !== "all" ? ` under ${TAB_LABELS[filter.tab]}` : ""}.
          </p>
          <button
            type="button"
            onClick={filter.clear}
            className="mt-4 text-sm font-medium underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            Clear the filters
          </button>
        </div>
      ) : (
        <>
          {/* One h2 for the whole list. The lead pair and the rest below are a
              visual split, not separate sections, and without a level here the
              page jumps straight from the h1 to each card's h3. */}
          <h2 className="sr-only">Project list</h2>

          <div
            key={`${filter.tab}|${filter.query}|${filter.chips.join(",")}`}
            className="filter-reveal"
          >
            {showLead && (
              <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">{leadCards}</div>
            )}

            {rest.length > 0 && (
              <div
                className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${showLead ? "mt-10" : "mt-12"}`}
              >
                {rest.map((c) => (
                  <Fragment key={c.id}>{c.node}</Fragment>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
