import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PROJECTS } from "@/lib/constants";
import { getCaseStudy } from "@/lib/case-studies";
import { toJsonLd } from "@/lib/json-ld";
import { pageOpenGraph, SITE_URL } from "@/lib/metadata";
import FeaturedCard from "@/components/case-study/FeaturedCard";
import ListingCard from "@/components/case-study/ListingCard";
import AnalyticsBeacon from "@/components/interactive/AnalyticsBeacon";
import type { Project } from "@/types";

// Canonicals are set per page, never at the root: a root-level canonical is
// inherited by every descendant that does not override it, which would declare
// each page a duplicate of the homepage.
const PAGE_TITLE = "Projects & case studies";
const PAGE_DESCRIPTION =
  "Selected engineering and research projects by Hammad Ahmad - AI/ML Engineer.";

export const metadata: Metadata = {
  title: "Projects",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/projects" },
  openGraph: pageOpenGraph({
    path: "/projects",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

// ItemList so the listing reads as a collection rather than six loose links.
// Derived from PROJECTS, so it cannot drift from what the page renders.
const collectionLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}/projects`,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PROJECTS.length,
    itemListElement: PROJECTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      description: p.tagline,
      url: `${SITE_URL}/projects/${p.id}`,
    })),
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "research", label: "Research" },
  { key: "engineering", label: "Engineering" },
  { key: "ml", label: "Machine Learning" },
  { key: "fullstack", label: "Full-stack" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  const requested = params?.category as FilterKey | undefined;
  const active: FilterKey = FILTERS.some((f) => f.key === requested) ? (requested as FilterKey) : "all";

  const filtered: Project[] =
    active === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === active);

  // FeaturedCard is reserved for the unfiltered "all" view; filtered views use
  // uniform ListingCards so a small category never reads as a lone-card bug.
  const featured = active === "all" ? filtered[0] : undefined;
  const rest = active === "all" ? filtered.slice(1) : filtered;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(collectionLd) }}
      />
      <AnalyticsBeacon page="/projects" />
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
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        {/* Page title */}
        <div className="space-y-4">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            ✦ Selected work
          </span>
          <h1
            className="font-display text-[clamp(3rem,2rem+3.5vw,5rem)] font-bold leading-[1.02] tracking-[-0.03em]"
            style={{ color: "var(--text-primary)" }}
          >
            Projects &amp; case studies
          </h1>
          <p
            className="max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Real engineering problems, measurable outcomes, and production results - spanning AI
            research, ML systems, and full-stack. Each entry has a deeper case study explaining
            the architecture and the decisions behind it.
          </p>
        </div>

        {/* Filter row - text links, no chunky pills */}
        <nav
          className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-2 border-y border-[var(--border)] py-4"
          aria-label="Filter projects by category"
        >
          {FILTERS.map((f) => {
            const isActive = active === f.key;
            const href = f.key === "all" ? "/projects" : `/projects?category=${f.key}`;
            const count =
              f.key === "all"
                ? PROJECTS.length
                : PROJECTS.filter((p) => p.category === f.key).length;
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
            className="mt-20 rounded-xl border p-12 text-center"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
          >
            <p style={{ color: "var(--text-secondary)" }}>No projects in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Featured card */}
            {featured && (
              <div className="mt-12">
                <FeaturedCard project={featured} caseStudy={getCaseStudy(featured.id)} />
              </div>
            )}

            {/* Grid - mt-12 when it's the first block after the filter row (filtered view,
                no FeaturedCard above it), mt-10 when it follows the FeaturedCard */}
            {rest.length > 0 && (
              <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${featured ? "mt-10" : "mt-12"}`}>
                {rest.map((p) => (
                  <ListingCard key={p.id} project={p} caseStudy={getCaseStudy(p.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
