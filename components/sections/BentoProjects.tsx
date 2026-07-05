"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { PROJECTS } from "@/lib/constants";
import type { Project } from "@/types";
import { FiGithub, FiExternalLink, FiArrowRight, FiArrowUpRight } from "react-icons/fi";

const STATUS: Record<Project["category"], { label: string; color: string }> = {
  research:    { label: "Research",         color: "var(--status-research)" },
  engineering: { label: "In Production",    color: "var(--status-engineering)" },
  ml:          { label: "Machine Learning", color: "var(--status-ml)" },
  fullstack:   { label: "Full Stack",       color: "var(--status-fullstack)" },
};

function LargeCard({ project }: { project: Project }) {
  const status = STATUS[project.category];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border col-span-1 md:col-span-2"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", minHeight: "260px" }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${status.color}, transparent)` }}
      />

      <div className="relative z-10 p-6 md:p-8 flex flex-col gap-5 h-full">
        {/* Badge + title */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${status.color} 9%, transparent)`,
              color: status.color,
              border: `1px solid color-mix(in srgb, ${status.color} 21%, transparent)`,
            }}
          >
            {status.label}
          </span>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {project.title}
          </h3>
        </div>

        {/* Tagline */}
        <p className="text-sm font-semibold font-mono" style={{ color: "var(--accent)" }}>
          {project.tagline}
        </p>

        {/* Description */}
        <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
          {project.description}
        </p>

        {/* Metrics row */}
        {project.metrics && (
          <div className="flex flex-wrap gap-6">
            {project.metrics.map((m) => (
              <div key={m.label} className="flex flex-col">
                <span className="text-2xl font-bold font-mono leading-none" style={{ color: status.color }}>
                  {m.value}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tech + links */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          {project.tech.slice(0, 5).map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
          {project.tech.length > 5 && (
            <span className="tag-pill">+{project.tech.length - 5}</span>
          )}
          <div className="flex gap-2 ml-auto">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105"
                style={{ color: "var(--text-muted)", borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
              >
                <FiGithub size={14} />
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105"
                style={{ color: "var(--text-muted)", borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
              >
                <FiExternalLink size={14} />
              </a>
            )}
            <Link
              href={`/projects/${project.id}`}
              className="flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium font-mono transition-all hover:scale-105"
              style={{ color: "var(--accent)", borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", backgroundColor: "var(--accent-muted)" }}
            >
              Deep dive <FiArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MediumCard({ project, index }: { project: Project; index: number }) {
  const status = STATUS[project.category];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", minHeight: "240px" }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${status.color}, transparent)` }}
      />

      <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
        {/* Badge + title */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${status.color} 9%, transparent)`, color: status.color, border: `1px solid color-mix(in srgb, ${status.color} 21%, transparent)` }}
          >
            {status.label}
          </span>
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {project.title}
          </h3>
        </div>

        <p className="text-xs font-semibold font-mono" style={{ color: "var(--accent)" }}>
          {project.tagline}
        </p>

        <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
          {project.description}
        </p>

        {/* Metrics */}
        {project.metrics && (
          <div className="flex gap-4">
            {project.metrics.slice(0, 2).map((m) => (
              <div key={m.label} className="flex flex-col">
                <span className="text-lg font-bold font-mono leading-none" style={{ color: status.color }}>
                  {m.value}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tech + links */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
          {project.tech.length > 4 && <span className="tag-pill">+{project.tech.length - 4}</span>}
          <div className="flex gap-1.5 ml-auto">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} on GitHub`}
                className="flex h-7 w-7 items-center justify-center rounded-lg border transition-all hover:scale-105"
                style={{ color: "var(--text-muted)", borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}>
                <FiGithub size={13} />
              </a>
            )}
            <Link href={`/projects/${project.id}`}
              className="flex h-7 items-center gap-1 rounded-lg border px-2 text-[11px] font-medium font-mono transition-all hover:scale-105"
              style={{ color: "var(--accent)", borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)", backgroundColor: "var(--accent-muted)" }}>
              Details <FiArrowUpRight size={10} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

const FEATURED = PROJECTS.filter((p) => p.featured);
const LARGE = FEATURED.filter((p) => p.bentoSize === "large");
const MEDIUM = FEATURED.filter((p) => p.bentoSize !== "large");

export default function BentoProjects() {
  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <SectionTitle
          label="Projects"
          title="Selected Work"
          description="Real problems, measurable outcomes, production results."
        />

        {/* Bento grid: large card spans full width, medium cards 2-up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LARGE.map((p) => <LargeCard key={p.id} project={p} />)}
          {MEDIUM.map((p, i) => <MediumCard key={p.id} project={p} index={i} />)}
        </div>

        {/* See all projects */}
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
