"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { PROJECTS } from "@/lib/constants";
import type { Project } from "@/types";
import { FiGithub, FiExternalLink, FiPlus, FiArrowRight } from "react-icons/fi";

const statusConfig: Record<Project["category"], { label: string; color: string }> = {
  research:    { label: "Research",        color: "#a78bfa" },
  engineering: { label: "In Production",   color: "#2dd4bf" },
  ml:          { label: "Machine Learning", color: "#f59e0b" },
  fullstack:   { label: "Full Stack",       color: "#10b981" },
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const status = statusConfig[project.category];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border card-glow"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${status.color}, transparent)` }}
      />

      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: content */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {/* Status badge + title */}
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
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {project.title}
            </h3>
          </div>

          {/* Tagline */}
          <p className="text-xs font-semibold font-mono" style={{ color: "var(--accent)" }}>
            {project.tagline}
          </p>

          {/* Description */}
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {project.description}
          </p>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 6).map((t) => (
              <span key={t} className="tag-pill">{t}</span>
            ))}
            {project.tech.length > 6 && (
              <span className="tag-pill">+{project.tech.length - 6}</span>
            )}
          </div>
        </div>

        {/* Right: metrics + links */}
        <div className="flex flex-row gap-6 sm:flex-col sm:items-end sm:min-w-[140px] sm:gap-4">
          {project.metrics && (
            <div className="flex gap-5 sm:flex-col sm:items-end sm:gap-2">
              {project.metrics.slice(0, 2).map((m) => (
                <div key={m.label} className="flex flex-col sm:items-end">
                  <span
                    className="text-xl font-bold font-mono leading-none"
                    style={{ color: status.color }}
                  >
                    {m.value}
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-elevated)",
                }}
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
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-elevated)",
                }}
              >
                <FiExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PlaceholderCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 py-8"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-muted)" }}
      >
        <FiPlus size={16} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
        More coming soon...
      </p>
    </motion.div>
  );
}

const FEATURED = PROJECTS.filter((p) => p.featured);

export default function BentoProjects() {
  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <SectionTitle
          label="Projects"
          title="Selected Work"
          description="Real problems, measurable outcomes, production results."
        />

        <div className="flex flex-col gap-4">
          {FEATURED.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
          <PlaceholderCard index={FEATURED.length} />
        </div>

        {/* See all projects link */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium font-mono transition-all duration-200 hover:scale-105"
            style={{
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              backgroundColor: "var(--accent-muted)",
            }}
          >
            See all projects
            <FiArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
