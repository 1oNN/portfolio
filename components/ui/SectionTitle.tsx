"use client";

import { motion } from "framer-motion";

interface SectionTitleProps {
  label: string;
  title: string;
  description?: string;
}

export default function SectionTitle({ label, title, description }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mb-14 text-center"
    >
      <span
        className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-mono"
        style={{
          color: "var(--accent)",
          backgroundColor: "var(--accent-muted)",
          border: "1px solid var(--accent-muted)",
        }}
      >
        {label}
      </span>
      <h2
        className="text-3xl sm:text-4xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-xl mx-auto text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
