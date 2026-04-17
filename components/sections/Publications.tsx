"use client";

import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import { PUBLICATIONS } from "@/lib/constants";
import { FiExternalLink, FiFileText, FiUsers, FiMapPin } from "react-icons/fi";

const typeStyles: Record<string, { label: string; color: string }> = {
  conference: { label: "Conference Paper", color: "#22d3ee" },
  journal: { label: "Journal Article", color: "#10b981" },
  chapter: { label: "Book Chapter", color: "#a78bfa" },
};

export default function Publications() {
  return (
    <section
      id="research"
      className="py-24 sm:py-32"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          label="Research"
          title="Publications"
          description="Peer-reviewed work presented at international venues."
        />

        <div className="max-w-3xl mx-auto space-y-6">
          {PUBLICATIONS.map((pub, i) => {
            const style = typeStyles[pub.type];
            return (
              <motion.article
                key={pub.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-xl border p-6 card-glow"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Type badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: `${style.color}15`,
                      color: style.color,
                      border: `1px solid ${style.color}30`,
                    }}
                  >
                    <FiFileText size={11} />
                    {style.label}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {pub.year}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-base font-semibold leading-snug mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {pub.title}
                </h3>

                {/* Authors */}
                <div
                  className="flex items-center gap-2 text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <FiUsers size={13} className="shrink-0" style={{ color: "var(--accent)" }} />
                  {pub.authors}
                </div>

                {/* Venue */}
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <FiMapPin size={13} className="shrink-0" style={{ color: "var(--accent)" }} />
                  {pub.venue}
                </div>

                {/* DOI */}
                {pub.doi && (
                  <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4"
                    style={{ borderColor: "var(--border)" }}>
                    <div>
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        DOI:{" "}
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {pub.doi}
                      </span>
                    </div>
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all hover:scale-105"
                      style={{
                        color: "var(--accent)",
                        borderColor: "rgba(99,102,241,0.25)",
                        backgroundColor: "var(--accent-muted)",
                      }}
                      aria-label={`View publication: ${pub.title}`}
                    >
                      <FiExternalLink size={11} />
                      View
                    </a>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        {/* Research interests callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 max-w-3xl mx-auto rounded-xl border p-6"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, var(--accent-muted), transparent)",
          }}
        >
          <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Research Interests
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Graph-augmented retrieval, LLM faithfulness evaluation, systems optimisation for
            high-throughput ML pipelines, and interpretable predictive modelling for clinical
            applications. Currently exploring MSCA-eligible opportunities — earliest start date
            October 2026.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
