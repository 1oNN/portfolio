import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PROJECTS } from "@/lib/constants";
import { getCaseStudy } from "@/lib/case-studies";
import { toJsonLd } from "@/lib/json-ld";
import { pageOpenGraph, SITE_URL } from "@/lib/metadata";
import { Suspense } from "react";
import ListingCard from "@/components/case-study/ListingCard";
import ProjectsFilter, { type ProjectCard } from "@/components/case-study/ProjectsFilter";
import Footer from "@/components/layout/Footer";

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

// No searchParams here on purpose. Reading them made this segment dynamic, so a
// page whose only data source is a six-item constant was being server-rendered
// on every request. The ?category= filter now lives in ProjectsFilter, a client
// leaf; the cards are still built here so lib/case-studies stays server-side.
export default function ProjectsPage() {
  const cards: ProjectCard[] = PROJECTS.map((p) => ({
    id: p.id,
    category: p.category,
    node: <ListingCard project={p} caseStudy={getCaseStudy(p.id)} />,
  }));

  // The lead pair - Jobzyl and FinLaw-UK, the first two in PROJECTS - gets the
  // large treatment. Rendered separately because it is a different card size.
  const leadCards = PROJECTS.slice(0, 2).map((p) => (
    <ListingCard key={p.id} project={p} caseStudy={getCaseStudy(p.id)} size="lead" />
  ));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(collectionLd) }}
      />
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

        {/* Suspense is what lets useSearchParams live below a static page */}
        <Suspense
          fallback={
            <div className="mt-12 h-[4.5rem] border-y border-[var(--border)]" aria-hidden="true" />
          }
        >
          <ProjectsFilter cards={cards} leadCards={leadCards} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
