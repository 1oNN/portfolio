import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCalendar,
  FiUser,
  FiActivity,
  FiCpu,
  FiGithub,
  FiExternalLink,
  FiFileText,
  FiBookOpen,
  FiMessageCircle,
} from "react-icons/fi";
import type { Project, CaseStudy } from "@/types";
import { getProjectVisuals } from "@/components/project-visuals";
import VisualFrame from "@/components/project-visuals/VisualFrame";
import CountUp from "@/components/interactive/CountUp";
import { getCaseStudy } from "@/lib/case-studies";
import { PROJECTS } from "@/lib/constants";
import ListingCard from "./ListingCard";
import SectionHeader from "@/components/ui/SectionHeader";

interface Props {
  project: Project;
  caseStudy: CaseStudy;
}

export default function CaseStudyLayout({ project, caseStudy }: Props) {
  const visuals = getProjectVisuals(project.id);
  const Hero = visuals?.Hero;
  const Architecture = visuals?.Architecture;
  const Results = visuals?.Results;
  const Demo = visuals?.Demo;
  const accent = caseStudy.accent;

  const links: { label: string; href: string; icon: React.ReactNode }[] = [];
  const githubUrl = caseStudy.links.github ?? project.githubUrl;
  const liveUrl = caseStudy.links.live ?? project.liveUrl;
  if (githubUrl) links.push({ label: "GitHub", href: githubUrl, icon: <FiGithub size={13} /> });
  if (liveUrl) links.push({ label: "Live demo", href: liveUrl, icon: <FiExternalLink size={13} /> });
  if (caseStudy.links.paper) links.push({ label: "Paper", href: caseStudy.links.paper, icon: <FiFileText size={13} /> });
  if (caseStudy.links.docs) links.push({ label: "Docs", href: caseStudy.links.docs, icon: <FiBookOpen size={13} /> });

  const relatedProjects = caseStudy.related
    .map((id) => {
      const p = PROJECTS.find((proj) => proj.id === id);
      const cs = getCaseStudy(id);
      return p ? { project: p, caseStudy: cs } : null;
    })
    .filter((x): x is { project: Project; caseStudy: CaseStudy | undefined } => x !== null)
    .slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
          >
            <FiArrowLeft size={15} />
            All projects
          </Link>
          <Link
            href="/"
            aria-label="Back to home"
            className="font-mono text-sm font-bold transition-opacity hover:opacity-75 focus-visible:opacity-75"
            style={{ color: accent }}
          >
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
          </Link>
        </div>
      </header>

      <main id="main">
        {/* 1. HERO */}
        <section className="mx-auto max-w-5xl px-6 pb-12 pt-16 sm:pt-20">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
                style={{
                  color: accent,
                  backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {caseStudy.status}
              </span>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                {project.category}
              </span>
            </div>
            <h1
              className="font-display text-[clamp(3rem,2rem+2.6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.03em]"
              style={{ color: "var(--text-primary)" }}
            >
              {project.title}
            </h1>
            <p
              className="max-w-2xl text-lg leading-snug sm:text-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {project.tagline}
            </p>
          </div>

          {/* Hero visual */}
          {Hero && (
            <VisualFrame
              className="mt-10 overflow-hidden rounded-xl border"
              style={{
                aspectRatio: "16 / 10",
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <Hero accent={accent} className="h-full w-full" />
            </VisualFrame>
          )}
        </section>

        {/* 2. QUICK FACTS STRIP */}
        <section
          className="border-y"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
        >
          <div className="mx-auto max-w-5xl px-6 py-6">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              {caseStudy.timeline && (
                <Fact icon={<FiCalendar size={13} />} label="Timeline" value={caseStudy.timeline} />
              )}
              <Fact icon={<FiUser size={13} />} label="Role" value={caseStudy.role} />
              <Fact icon={<FiActivity size={13} />} label="Status" value={caseStudy.status} accent={accent} />
              <Fact
                icon={<FiCpu size={13} />}
                label="Primary stack"
                value={caseStudy.primaryStack.join(" · ")}
              />
            </dl>
            <div className="mt-5 flex flex-wrap items-center gap-2 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                {links.map((l) => {
                  // Live demo is the strongest CTA on the page - solid accent fill
                  const primary = l.label === "Live demo";
                  return primary ? (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 focus-visible:opacity-90"
                      style={{ color: "var(--accent-contrast)", backgroundColor: accent }}
                    >
                      {l.icon}
                      {l.label}
                      <FiArrowUpRight size={11} style={{ opacity: 0.7 }} />
                    </a>
                  ) : (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--text-secondary)] focus-visible:border-[var(--text-secondary)]"
                      style={{
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--surface-elevated)",
                      }}
                    >
                      {l.icon}
                      {l.label}
                      <FiArrowUpRight size={11} style={{ opacity: 0.5 }} />
                    </a>
                  );
                })}
                <Link
                  href="/#agent"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
                >
                  <FiMessageCircle size={13} />
                  Ask my agent about this project
                </Link>
            </div>
          </div>
        </section>

        {/* 3. HEADLINE METRICS */}
        {project.metrics && project.metrics.length > 0 && (
          <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <SectionHeader eyebrow="By the numbers" title="Headline metrics" accent={accent} />
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {project.metrics.slice(0, 3).map((m) => (
                <div key={m.label} className="space-y-2 border-l-2 pl-5" style={{ borderColor: accent }}>
                  <div
                    className="text-5xl font-bold leading-none tracking-tight sm:text-6xl"
                    style={{ color: accent, fontFamily: "var(--font-mono)" }}
                  >
                    <CountUp value={m.value} />
                  </div>
                  <div
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3b. THE PAIR - the whole case study in two lines, for the reader who
            will not scroll. Deliberately placed above the long-form prose, and
            deliberately not a repeat of it: these condense the problem and
            results sections rather than introducing anything new. */}
        <section
          className="mx-auto max-w-5xl px-6 py-14 sm:py-16"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <dl className="grid gap-10 sm:grid-cols-2 sm:gap-12">
            <div>
              <dt
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              >
                What it tackles
              </dt>
              <dd
                className="mt-4 border-l-2 pl-5 text-lg leading-relaxed"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {caseStudy.tackles}
              </dd>
            </div>
            <div>
              <dt
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: accent, fontFamily: "var(--font-mono)" }}
              >
                What it delivers
              </dt>
              <dd
                className="mt-4 border-l-2 pl-5 text-lg leading-relaxed"
                style={{ borderColor: accent, color: "var(--text-primary)" }}
              >
                {caseStudy.delivers}
              </dd>
            </div>
          </dl>
        </section>

        {/* 4. PROBLEM - told as a stepped story, each beat revealing on scroll */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Titled as the expansion of the one-line "What it tackles" above,
              rather than repeating it word for word. */}
          <SectionHeader eyebrow="The problem" title="The problem in full" accent={accent} />
          <div className="mt-12 max-w-3xl">
            {caseStudy.problem.map((p, i) => {
              const isLast = i === caseStudy.problem.length - 1;
              return (
                <div key={i} className="animate-reveal relative flex gap-5 sm:gap-7">
                  {/* Story rail: numbered beat + connecting thread */}
                  <div className="flex flex-col items-center">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                      style={{
                        color: accent,
                        backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="my-2 w-px flex-1"
                        style={{
                          background: `linear-gradient(to bottom, color-mix(in srgb, ${accent} 35%, transparent), var(--border))`,
                        }}
                      />
                    )}
                  </div>
                  <p
                    className={
                      i === 0
                        ? `pt-0.5 text-lg leading-[1.75] ${isLast ? "" : "pb-10"}`
                        : `pt-0.5 text-[1.0625rem] leading-[1.85] ${isLast ? "" : "pb-10"}`
                    }
                    style={{ color: i === 0 ? "var(--text-primary)" : "var(--text-secondary)" }}
                  >
                    {p}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. APPROACH + ARCHITECTURE */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" style={{ borderTop: "1px solid var(--border)" }}>
          <SectionHeader eyebrow="Approach" title="System design" accent={accent} />
          {Architecture && (
            <div
              className="mt-10 overflow-x-auto rounded-xl border p-6 sm:p-8"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              <VisualFrame style={{ minWidth: "720px" }}>
                <Architecture accent={accent} className="w-full" />
              </VisualFrame>
            </div>
          )}
          <div className="mt-10 max-w-3xl space-y-5">
            {caseStudy.approach.map((p, i) => (
              <p key={i} className="text-[1.0625rem] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* 5b. INTERACTIVE DEMO - real verified data only, never generated output */}
        {Demo && (
          <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" style={{ borderTop: "1px solid var(--border)" }}>
            <SectionHeader
              eyebrow={visuals?.demoHeader?.eyebrow ?? "Try it"}
              title={visuals?.demoHeader?.title ?? "Explore the data"}
              accent={accent}
            />
            <Demo accent={accent} className="mt-10" />
          </section>
        )}

        {/* 6. KEY DECISIONS - numbered cards that lift on hover */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" style={{ borderTop: "1px solid var(--border)" }}>
          <SectionHeader eyebrow="Engineering" title="Key technical decisions" accent={accent} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {caseStudy.decisions.map((d, i) => (
              <div
                key={d.title}
                className="animate-reveal group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--cs-accent)] hover:shadow-[var(--shadow)]"
                style={{ ["--cs-accent" as string]: accent }}
              >
                {/* Accent top edge - draws across on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-[11px] font-bold"
                  style={{
                    color: accent,
                    backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="mt-4 font-display text-lg font-semibold leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {d.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] leading-[1.75]" style={{ color: "var(--text-secondary)" }}>
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. RESULTS - measured numbers as a chart first, prose below */}
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" style={{ borderTop: "1px solid var(--border)" }}>
          <SectionHeader eyebrow="Results" title="What it delivers" accent={accent} />
          {Results && (
            <div
              className="mt-10 overflow-x-auto rounded-xl border p-6 sm:p-8"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              <VisualFrame style={{ minWidth: "720px" }}>
                <Results accent={accent} className="w-full" />
              </VisualFrame>
            </div>
          )}
          <div className="mt-10 max-w-3xl space-y-6">
            {caseStudy.results.map((p, i) => (
              <p key={i} className="text-[1.0625rem] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* 8. REFLECTIONS */}
        <ProseSection eyebrow="Reflections" title="What I'd do next" accent={accent} paragraphs={caseStudy.reflections} />

        {/* 9. RELATED */}
        {relatedProjects.length > 0 && (
          <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" style={{ borderTop: "1px solid var(--border)" }}>
            <SectionHeader eyebrow="Other case studies" title="Continue reading" accent={accent} />
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {relatedProjects.map(({ project: p, caseStudy: cs }) => (
                <ListingCard key={p.id} project={p} caseStudy={cs} />
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
              >
                <FiArrowLeft size={14} />
                All projects
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="space-y-1">
      <dt
        className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
      >
        {icon}
        {label}
      </dt>
      <dd
        className="text-sm font-medium leading-snug"
        style={{ color: accent ?? "var(--text-primary)" }}
      >
        {value}
      </dd>
    </div>
  );
}

function ProseSection({
  eyebrow,
  title,
  accent,
  paragraphs,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  paragraphs: string[];
}) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20" style={{ borderTop: "1px solid var(--border)" }}>
      <SectionHeader eyebrow={eyebrow} title={title} accent={accent} />
      <div className="mt-10 max-w-3xl space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[1.0625rem] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
