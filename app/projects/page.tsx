import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PROJECTS } from "@/lib/constants";
import { getCaseStudy } from "@/lib/case-studies";
import FeaturedCard from "@/components/case-study/FeaturedCard";
import ListingCard from "@/components/case-study/ListingCard";
import type { Project } from "@/types";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected engineering and research projects by Hammad Ahmad — AI/ML Engineer.",
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

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
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
            className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--text-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <FiArrowLeft size={15} />
            Back to home
          </Link>
          <span className="font-mono text-sm font-bold" style={{ color: "var(--accent)" }}>
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
          </span>
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
            className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Projects &amp; case studies
          </h1>
          <p
            className="max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Real engineering problems, measurable outcomes, and production results — spanning AI
            research, ML systems, and full-stack. Each entry has a deeper case study explaining
            the architecture and the decisions behind it.
          </p>
        </div>

        {/* Filter row — text links, no chunky pills */}
        <nav
          className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-2 border-y py-4"
          style={{ borderColor: "var(--border)" }}
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
                className="group relative inline-flex items-baseline gap-1.5 text-sm transition-colors"
                style={{
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                <span
                  className={
                    isActive
                      ? "font-semibold underline decoration-2 underline-offset-[6px]"
                      : "group-hover:underline group-hover:underline-offset-[6px]"
                  }
                  style={{
                    textDecorationColor: isActive ? "var(--accent)" : "transparent",
                  }}
                >
                  {f.label}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                >
                  {count}
                </span>
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

            {/* Grid */}
            {rest.length > 0 && (
              <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
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
