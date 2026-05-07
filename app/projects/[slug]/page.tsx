import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PROJECTS } from "@/lib/constants";
import PipelineDiagramView from "@/components/ui/PipelineDiagram";
import { FiArrowLeft, FiGithub, FiExternalLink, FiCheckCircle } from "react-icons/fi";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  if (!project) return { title: "Project Not Found" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.dev";
  return {
    title: `${project.title} | Hammad Ahmad`,
    description: project.tagline,
    alternates: { canonical: `${siteUrl}/projects/${project.id}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.tagline,
      url: `${siteUrl}/projects/${project.id}`,
    },
  };
}

const STATUS_COLOR: Record<string, string> = {
  research: "var(--status-research)",
  engineering: "var(--status-engineering)",
  ml: "var(--status-ml)",
  fullstack: "var(--status-fullstack)",
};

const STATUS_LABEL: Record<string, string> = {
  research: "Research",
  engineering: "In Production",
  ml: "Machine Learning",
  fullstack: "Full Stack",
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);
  if (!project) notFound();

  const color = STATUS_COLOR[project.category] ?? "var(--accent)";
  const label = STATUS_LABEL[project.category] ?? project.category;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <FiArrowLeft size={15} />
            All projects
          </Link>
          <span className="font-mono text-sm font-bold" style={{ color: "var(--accent)" }}>
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
          </span>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-4xl px-6 py-12 space-y-12">
        {/* Hero */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold font-mono"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 9%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 21%, transparent)` }}
            >
              {label}
            </span>
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                style={{ color: "var(--text-secondary)", borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}>
                <FiGithub size={13} /> GitHub
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                style={{ color: "var(--accent)", borderColor: "rgba(139,92,246,0.3)", backgroundColor: "var(--accent-muted)" }}>
                <FiExternalLink size={13} /> Live demo
              </a>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {project.title}
          </h1>
          <p className="text-base font-semibold font-mono" style={{ color: "var(--accent)" }}>
            {project.tagline}
          </p>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            {project.longDescription}
          </p>
        </section>

        {/* Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <section
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest font-mono mb-5" style={{ color: "var(--text-muted)" }}>
              Key Metrics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {project.metrics.map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="text-3xl font-bold font-mono leading-none" style={{ color }}>
                    {m.value}
                  </span>
                  <span className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Architecture diagram */}
        {project.pipeline && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest font-mono mb-4" style={{ color: "var(--text-muted)" }}>
              Architecture
            </h2>
            <div
              className="relative rounded-2xl border overflow-hidden"
              style={{
                height: "320px",
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <PipelineDiagramView diagram={project.pipeline} />
            </div>
          </section>
        )}

        {/* Highlights */}
        {project.highlights.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest font-mono mb-4" style={{ color: "var(--text-muted)" }}>
              Key Highlights
            </h2>
            <ul className="space-y-3">
              {project.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  <FiCheckCircle size={16} className="mt-0.5 shrink-0" style={{ color }} />
                  {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tech stack */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest font-mono mb-4" style={{ color: "var(--text-muted)" }}>
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-sm font-medium font-mono"
                style={{
                  backgroundColor: "var(--accent-muted)",
                  color: "var(--accent)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* Back link */}
        <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <FiArrowLeft size={14} />
            Back to all projects
          </Link>
        </div>
      </main>
    </div>
  );
}
