import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SectionHeader from "@/components/ui/SectionHeader";
import { PROJECTS } from "@/lib/constants";
import type { Project } from "@/types";

const CATEGORY_COLOR: Record<Project["category"], string> = {
  research: "var(--status-research)",
  engineering: "var(--status-engineering)",
  ml: "var(--status-ml)",
  fullstack: "var(--status-fullstack)",
};

const CATEGORY_LABEL: Record<Project["category"], string> = {
  research: "Research",
  engineering: "Engineering",
  ml: "ML",
  fullstack: "Full-stack",
};

const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);

/**
 * Compact editorial rows for the narrow home column — the rich card layouts
 * (FeaturedCard/ListingCard) stay on /projects where they have full width.
 */
export default function HomeProjects() {
  return (
    <section id="projects" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="py-14 sm:py-16">
        <SectionHeader
          eyebrow="Selected work"
          title="Projects & case studies"
          description="Selected projects spanning AI research, ML systems, and full-stack engineering — each backed by a full case study on the architecture and the decisions behind it."
        />

        <ul className="mt-6 divide-y divide-[var(--border)]">
          {FEATURED_PROJECTS.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="group block py-7 sm:grid sm:grid-cols-[140px_1fr] sm:gap-5"
              >
                <span
                  className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: CATEGORY_COLOR[project.category] }}
                >
                  {CATEGORY_LABEL[project.category]}
                </span>
                <div className="mt-2 sm:mt-0">
                  <h3 className="font-display text-xl font-medium leading-snug text-[var(--text-primary)] transition-colors duration-200 group-hover:text-[var(--accent)] group-focus-visible:text-[var(--accent)]">
                    {project.title}
                    <span
                      aria-hidden="true"
                      className="ml-2 inline-block text-[var(--text-muted)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)] group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:text-[var(--accent)]"
                    >
                      ↗
                    </span>
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {project.tagline}
                  </p>
                  {(project.metrics?.length ?? 0) > 0 && (
                    <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">
                      {project.metrics!
                        .slice(0, 2)
                        .map((m) => `${m.value} ${m.label.toLowerCase()}`)
                        .join("  ·  ")}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]"
          >
            All projects
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {PROJECTS.length}
            </span>
            <FiArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
