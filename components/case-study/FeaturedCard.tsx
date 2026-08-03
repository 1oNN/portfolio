import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { Project, CaseStudy } from "@/types";
import { getProjectVisuals } from "@/components/project-visuals";

interface Props {
  project: Project;
  caseStudy?: CaseStudy;
}

export default function FeaturedCard({ project, caseStudy }: Props) {
  const visuals = getProjectVisuals(project.id);
  const Hero = visuals?.Hero;
  const accent = caseStudy?.accent ?? "var(--accent)";
  const status = caseStudy?.status ?? project.category;
  const headlineMetrics = (project.metrics ?? []).slice(0, 3);
  const visibleTech = (caseStudy?.primaryStack ?? project.tech).slice(0, 4);

  return (
    <article
      className="group relative grid overflow-hidden rounded-xl border lg:grid-cols-5"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Visual side - 60% on desktop (3 of 5 cols) */}
      <div
        className="relative order-2 lg:order-2 lg:col-span-3"
        style={{
          aspectRatio: "16 / 10",
          backgroundColor: "var(--surface-elevated)",
        }}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.02] group-focus-within:scale-[1.02]">
          {Hero ? (
            <Hero accent={accent} className="h-full w-full" />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: "var(--surface-elevated)" }} />
          )}
        </div>
      </div>

      {/* Text side - 40% (2 of 5) */}
      <div className="order-1 flex flex-col justify-between gap-8 p-8 lg:order-1 lg:col-span-2 lg:p-10">
        <div className="space-y-5">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: accent, fontFamily: "var(--font-mono)" }}
            >
              ★ Featured · {status}
            </span>
          </div>

          <div className="space-y-3">
            <h2
              className="text-3xl font-bold leading-tight tracking-tight lg:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              {project.title}
            </h2>
            <p
              className="text-base font-medium leading-snug"
              style={{ color: accent }}
            >
              {project.tagline}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {project.longDescription}
            </p>
          </div>

          {/* Metrics */}
          {headlineMetrics.length > 0 && (
            <div
              className="grid grid-cols-3 gap-4 border-y py-4"
              style={{ borderColor: "var(--border)" }}
            >
              {headlineMetrics.map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span
                    className="text-2xl font-bold leading-none"
                    style={{ color: accent, fontFamily: "var(--font-mono)" }}
                  >
                    {m.value}
                  </span>
                  <span
                    className="mt-1.5 text-[10px] uppercase tracking-widest leading-tight"
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
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-2 self-start rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:gap-3 focus-visible:gap-3"
          style={{
            color: "var(--accent-contrast)",
            backgroundColor: accent,
          }}
        >
          Read full case study
          <FiArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
