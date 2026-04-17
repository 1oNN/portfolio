"use client";

import { motion } from "framer-motion";
import { FiGithub, FiExternalLink, FiArrowUpRight } from "react-icons/fi";
import type { Project } from "@/types";
import { useState } from "react";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const categoryColors: Record<Project["category"], string> = {
  ml: "#22d3ee",
  fullstack: "#10b981",
  research: "#a78bfa",
  engineering: "#f59e0b",
};

const categoryLabels: Record<Project["category"], string> = {
  ml: "Machine Learning",
  fullstack: "Full Stack",
  research: "Research",
  engineering: "Systems Engineering",
};

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = categoryColors[project.category];

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col rounded-xl border overflow-hidden card-glow"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${color}40, ${color}, ${color}40)` }}
      />

      <div className="flex flex-col gap-4 p-6 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <span
              className="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${color}15`,
                color: color,
                border: `1px solid ${color}30`,
              }}
            >
              {categoryLabels[project.category]}
            </span>
            <h3
              className="text-lg font-semibold leading-tight group-hover:text-[var(--accent)] transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              {project.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} GitHub repository`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105"
                style={{
                  color: "var(--text-secondary)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-elevated)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FiGithub size={15} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105"
                style={{
                  color: "var(--text-secondary)",
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface-elevated)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink size={15} />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {expanded ? project.longDescription : project.description}
        </p>

        {/* Highlights */}
        {expanded && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-1.5"
          >
            {project.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm"
                style={{ color: "var(--text-secondary)" }}>
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {h}
              </li>
            ))}
          </motion.ul>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map((t) => (
              <span key={t} className="tag-pill text-xs">
                {t}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="tag-pill text-xs">+{project.tech.length - 4}</span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            {expanded ? "Show less" : "Read more"}
            <FiArrowUpRight
              size={13}
              className="transition-transform"
              style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
