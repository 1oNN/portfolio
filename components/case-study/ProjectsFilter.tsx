"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/types";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "research", label: "Research" },
  { key: "engineering", label: "Engineering" },
  { key: "ml", label: "Machine Learning" },
  { key: "fullstack", label: "Full-stack" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export interface ProjectCard {
  id: string;
  category: Project["category"];
  /** Rendered on the server, so ListingCard and lib/case-studies stay server-side. */
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
 * searchParams, which used to opt the whole segment out of static rendering -
 * so a page whose only data source is a six-item constant was being
 * server-rendered on every request. The cards themselves are still built on the
 * server and passed in as nodes; rendering them here would drag the case-study
 * prose into the browser bundle.
 */
export default function ProjectsFilter({ cards, leadCards }: Props) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("category") as FilterKey | null;
  const active: FilterKey = FILTERS.some((f) => f.key === requested)
    ? (requested as FilterKey)
    : "all";

  const filtered = active === "all" ? cards : cards.filter((c) => c.category === active);

  // The lead pair gets the large treatment, but only in the unfiltered view.
  // Filtered views stay uniform so a small category never reads as a lone-card bug.
  const rest = active === "all" ? filtered.slice(2) : filtered;

  return (
    <>
      {/* Filter row - text links, no chunky pills */}
      <nav
        className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-2 border-y border-[var(--border)] py-4"
        aria-label="Filter projects by category"
      >
        {FILTERS.map((f) => {
          const isActive = active === f.key;
          const href = f.key === "all" ? "/projects" : `/projects?category=${f.key}`;
          const count =
            f.key === "all" ? cards.length : cards.filter((c) => c.category === f.key).length;
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
          className="mt-20 rounded-xl border p-12 text-center"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
        >
          <p style={{ color: "var(--text-secondary)" }}>No projects in this category yet.</p>
        </div>
      ) : (
        <>
          {/* One h2 for the whole list. The lead pair and the rest below are a
              visual split, not separate sections, and without a level here the
              page jumps straight from the h1 to each card's h3. */}
          <h2 className="sr-only">Project list</h2>

          {active === "all" && (
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">{leadCards}</div>
          )}

          {rest.length > 0 && (
            <div
              className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
                active === "all" ? "mt-10" : "mt-12"
              }`}
            >
              {rest.map((c) => (
                <Fragment key={c.id}>{c.node}</Fragment>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
