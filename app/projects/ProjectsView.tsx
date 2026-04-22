"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FiArrowLeft, FiGithub, FiExternalLink, FiCheckCircle } from "react-icons/fi";
import {
  SiPython, SiPytorch, SiFastapi, SiDocker, SiTypescript, SiReact,
  SiPostgresql, SiMongodb, SiScikitlearn, SiFlask,
} from "react-icons/si";
import { PROJECTS } from "@/lib/constants";
import type { Project } from "@/types";
import StarField from "@/components/interactive/StarField";

const TECH_ICONS: Record<string, React.ReactNode> = {
  Python: <SiPython size={13} />,
  PyTorch: <SiPytorch size={13} />,
  FastAPI: <SiFastapi size={13} />,
  Docker: <SiDocker size={13} />,
  TypeScript: <SiTypescript size={13} />,
  "React.js": <SiReact size={13} />,
  PostgreSQL: <SiPostgresql size={13} />,
  MongoDB: <SiMongodb size={13} />,
  "scikit-learn": <SiScikitlearn size={13} />,
  Flask: <SiFlask size={13} />,
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "research", label: "Research" },
  { key: "engineering", label: "Engineering" },
  { key: "ml", label: "ML" },
  { key: "fullstack", label: "Full Stack" },
] as const;

const STATUS: Record<Project["category"], { label: string; color: string }> = {
  research: { label: "Research", color: "#a78bfa" },
  engineering: { label: "In Production", color: "#2dd4bf" },
  ml: { label: "Machine Learning", color: "#f59e0b" },
  fullstack: { label: "Full Stack", color: "#10b981" },
};

function ProjectCard({ project }: { project: Project }) {
  const status = STATUS[project.category];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        borderLeft: `3px solid ${status.color}`,
      }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, ${status.color}, transparent)` }}
      />

      <div className="p-6 flex flex-col gap-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono"
                style={{
                  backgroundColor: `${status.color}18`,
                  color: status.color,
                  border: `1px solid ${status.color}35`,
                }}
              >
                {status.label}
              </span>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {project.title}
              </h2>
            </div>
            <p className="text-xs font-semibold font-mono" style={{ color: "var(--accent)" }}>
              {project.tagline}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)", borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
              >
                <FiGithub size={14} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)", borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
              >
                <FiExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Long description */}
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {project.longDescription}
        </p>

        {/* Highlights */}
        {project.highlights.length > 0 && (
          <ul className="flex flex-col gap-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <FiCheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: status.color }} />
                {h}
              </li>
            ))}
          </ul>
        )}

        {/* Metrics */}
        {project.metrics && (
          <div className="flex flex-wrap gap-4 pt-1">
            {project.metrics.map((m) => (
              <div key={m.label} className="flex flex-col">
                <span className="text-xl font-bold font-mono leading-none" style={{ color: status.color }}>
                  {m.value}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tech stack with icons */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          {project.tech.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: "var(--accent-muted)",
                color: "var(--accent)",
                border: "1px solid var(--accent-muted)",
              }}
            >
              {TECH_ICONS[t] ?? null}
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function ProjectsView() {
  const [filter, setFilter] = useState<"all" | Project["category"]>("all");

  const filtered = filter === "all"
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === filter);

  return (
    <>
      <StarField />
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        {/* Top bar */}
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-md"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <FiArrowLeft size={16} />
              ← Back to home
            </Link>
            <span className="font-mono text-sm font-semibold" style={{ color: "var(--accent)" }}>
              ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-16">
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-12"
          >
            <span
              className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-mono"
              style={{ color: "var(--accent)", backgroundColor: "var(--accent-muted)", border: "1px solid var(--accent-muted)" }}
            >
              Portfolio
            </span>
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              All Projects
            </h1>
            <p className="mt-4 text-base leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Real engineering problems, measurable outcomes, and production results — spanning AI research, ML systems, and full-stack.
            </p>
          </motion.div>

          {/* Category filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key as typeof filter)}
                className="px-4 py-1.5 rounded-full text-sm font-medium font-mono transition-all duration-200"
                style={{
                  backgroundColor: filter === cat.key ? "var(--accent)" : "var(--surface-elevated)",
                  color: filter === cat.key ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${filter === cat.key ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {cat.label}
                {cat.key !== "all" && (
                  <span className="ml-1.5 opacity-60 text-xs">
                    {PROJECTS.filter((p) => p.category === cat.key).length}
                  </span>
                )}
                {cat.key === "all" && (
                  <span className="ml-1.5 opacity-60 text-xs">{PROJECTS.length}</span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Project grid */}
          <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </>
  );
}
