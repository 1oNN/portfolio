"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import { EXPERIENCE } from "@/lib/constants";
import { FiMapPin, FiCalendar, FiChevronDown, FiZap, FiSearch, FiCode } from "react-icons/fi";
import type { Experience } from "@/types";

const typeConfig: Record<
  Experience["type"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  engineering: {
    label: "Engineering",
    color: "#f59e0b",
    icon: <FiZap size={12} />,
  },
  research: {
    label: "Research",
    color: "#a78bfa",
    icon: <FiSearch size={12} />,
  },
  internship: {
    label: "Internship",
    color: "#22d3ee",
    icon: <FiCode size={12} />,
  },
};

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const cfg = typeConfig[exp.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative pl-10"
    >
      {/* Timeline line */}
      <div
        className="absolute left-4 top-6 bottom-0 w-px"
        style={{ backgroundColor: "var(--border)" }}
      />

      {/* Role type dot */}
      <div
        className="absolute left-4 top-5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 z-10"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: cfg.color,
          boxShadow: `0 0 10px ${cfg.color}50`,
        }}
      >
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
      </div>

      {/* Card */}
      <div
        className="mb-8 rounded-xl border overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Header (always visible) */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-[var(--surface-elevated)]"
          aria-expanded={open}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${cfg.color}15`,
                  color: cfg.color,
                  border: `1px solid ${cfg.color}30`,
                }}
              >
                {cfg.icon}
                {cfg.label}
              </span>
            </div>
            <h3
              className="text-base font-semibold leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {exp.role}
            </h3>
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              {exp.company}
            </p>
            <div
              className="flex flex-wrap items-center gap-3 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="flex items-center gap-1">
                <FiCalendar size={11} />
                {exp.startDate} — {exp.endDate}
              </span>
              <span className="flex items-center gap-1">
                <FiMapPin size={11} />
                {exp.location}
              </span>
            </div>
          </div>
          <FiChevronDown
            size={18}
            className="shrink-0 mt-1 transition-transform duration-300"
            style={{
              color: "var(--text-muted)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* Expandable responsibilities */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="px-5 pb-5 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                <ul className="mt-4 space-y-2.5">
                  {exp.responsibilities.map((r, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cfg.color }}
                      />
                      {r}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      className="py-24 sm:py-32"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          label="Experience"
          title="Professional History"
          description="From research labs to production AI systems — a timeline of where I've built and what I've shipped."
        />

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-4 mb-10 justify-center"
        >
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full"
                style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
              >
                {cfg.icon}
              </span>
              {cfg.label}
            </div>
          ))}
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {EXPERIENCE.map((exp, i) => (
            <ExperienceCard key={exp.id} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
