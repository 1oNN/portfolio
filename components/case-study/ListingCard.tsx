import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { Project, CaseStudy } from "@/types";
import { getProjectVisuals } from "@/components/project-visuals";
import VisualFrame from "@/components/project-visuals/VisualFrame";

interface Props {
  project: Project;
  caseStudy?: CaseStudy;
  /**
   * "lead" is the pair at the top of /projects - the shipped product and the
   * dissertation. Same card, turned up: taller hero, larger title, all three
   * metrics. The hierarchy comes from scale, not from a separate component.
   */
  size?: "lead" | "default";
}

export default function ListingCard({ project, caseStudy, size = "default" }: Props) {
  const isLead = size === "lead";
  const visuals = getProjectVisuals(project.id);
  const Hero = visuals?.Hero;
  const accent = caseStudy?.accent ?? "var(--accent)";
  const status = caseStudy?.status ?? project.category;
  const techLimit = isLead ? 6 : 5;
  const visibleTech = (caseStudy?.primaryStack ?? project.tech).slice(0, techLimit);
  const overflow = (caseStudy?.primaryStack ?? project.tech).length - visibleTech.length;
  const headlineMetrics = (project.metrics ?? []).slice(0, isLead ? 3 : 2);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] transition-colors duration-200 hover:border-[var(--text-secondary)] focus-visible:border-[var(--text-secondary)]"
      style={{
        backgroundColor: "var(--surface)",
      }}
    >
      {/* Hero visual - 16:9, full bleed */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: isLead ? "16 / 10" : "16 / 9",
          backgroundColor: "var(--surface-elevated)",
        }}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]">
          {Hero ? (
            <VisualFrame className="h-full w-full">
              <Hero accent={accent} className="h-full w-full" />
            </VisualFrame>
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: "var(--surface-elevated)" }} />
          )}
        </div>
        {/* Status pill - overlaid bottom-left */}
        <div className="absolute left-4 top-4">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: "var(--surface)",
              color: accent,
              border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
              fontFamily: "var(--font-mono)",
            }}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className={`flex flex-1 flex-col gap-4 ${isLead ? "p-7 sm:p-8" : "p-6"}`}>
        <div className="space-y-1.5">
          <h3
            className={`font-display font-bold leading-tight tracking-tight ${
              isLead ? "text-2xl lg:text-3xl" : "text-xl"
            }`}
            style={{ color: "var(--text-primary)" }}
          >
            {project.title}
          </h3>
          <p
            className={`leading-relaxed ${isLead ? "text-base font-medium" : "text-[0.9375rem]"}`}
            style={{ color: isLead ? accent : "var(--text-secondary)" }}
          >
            {project.tagline}
          </p>
        </div>

        {/* Headline metrics */}
        {headlineMetrics.length > 0 && (
          <div
            className={`flex border-y py-3 ${isLead ? "gap-5 sm:gap-7" : "gap-6"}`}
            style={{ borderColor: "var(--border)" }}
          >
            {headlineMetrics.map((m) => (
              <div key={m.label} className="flex flex-col">
                <span
                  className={`font-bold leading-none ${isLead ? "text-xl sm:text-2xl" : "text-lg"}`}
                  style={{ color: accent, fontFamily: "var(--font-mono)" }}
                >
                  {m.value}
                </span>
                <span
                  className="mt-1 text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tech */}
        <div className="flex flex-wrap gap-1.5">
          {visibleTech.map((t) => (
            <span
              key={t}
              className="rounded px-2 py-0.5 text-[11px]"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--surface-elevated)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {t}
            </span>
          ))}
          {overflow > 0 && (
            <span
              className="rounded px-2 py-0.5 text-[11px]"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            >
              +{overflow}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium" style={{ color: accent }}>
          {isLead ? "Read full case study" : "Read case study"}
          <FiArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}
