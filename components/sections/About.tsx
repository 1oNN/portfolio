"use client";

import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import { EDUCATION } from "@/lib/constants";
import { FiDownload, FiMapPin, FiCalendar, FiBookOpen } from "react-icons/fi";

const SKILL_GROUPS = [
  {
    label: "Languages",
    skills: ["Python", "C++", "SQL", "TypeScript", "JavaScript"],
  },
  {
    label: "AI & ML",
    skills: ["PyTorch", "TensorFlow", "scikit-learn", "LLMs/NLP", "RAG", "Sentence Transformers", "MLflow", "Retell AI"],
  },
  {
    label: "Infrastructure",
    skills: ["Docker", "CI/CD", "FastAPI", "Flask", "AWS", "GCP", "REST APIs"],
  },
  {
    label: "Data Engineering",
    skills: ["Neo4j", "PostgreSQL", "MongoDB", "pandas/NumPy"],
  },
  {
    label: "Frontend",
    skills: ["React.js", "Next.js"],
  },
];

function EducationCard({ edu }: { edu: (typeof EDUCATION)[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* Timeline line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{ backgroundColor: "var(--border)" }}
      />
      {/* Dot */}
      <div
        className="absolute left-0 top-1 h-3 w-3 -translate-x-1/2 rounded-full border-2"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--accent)",
          boxShadow: "0 0 8px var(--accent-glow)",
        }}
      />
      <div
        className="rounded-xl border p-5"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {edu.degree} in {edu.field}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: "var(--accent)" }}>
              {edu.institution}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <FiCalendar size={11} />
              {edu.startDate} — {edu.endDate}
            </span>
            <span className="flex items-center gap-1">
              <FiMapPin size={11} />
              {edu.location}
            </span>
          </div>
        </div>
        {edu.dissertation && (
          <p className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <FiBookOpen size={14} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
            <span>
              <em>Dissertation:</em> {edu.dissertation}
            </span>
          </p>
        )}
        {edu.focus && (
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Focus: {edu.focus}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          label="About"
          title="Background & Skills"
          description="ML engineer at heart, researcher by training. I care about systems that are fast, explainable, and built to last."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — bio + education */}
          <div className="space-y-10">
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Who I am
              </h3>
              <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <p>
                  I&apos;m an AI/ML engineer with an MSc in Applied Artificial Intelligence from the
                  University of Bradford. My work sits at the intersection of production systems
                  engineering and applied research — I&apos;ve spent the last two years building
                  things that ship, not just things that benchmark well.
                </p>
                <p>
                  At Outlyst, I reduced call latency by 54% across 2,100+ concurrent AI voice
                  interactions by profiling async I/O bottlenecks and restructuring connection
                  pooling. For my dissertation, I built FinLaw-UK — a graph-augmented RAG system
                  that improved legal-finance Q&A accuracy by 19% using Mistral 7B and Neo4j.
                </p>
                <p>
                  I&apos;m interested in roles where I can continue pushing the boundary between
                  research and production — whether that&apos;s LLM infrastructure, graph-based
                  retrieval, or high-throughput ML systems.
                </p>
              </div>

              {/* CV downloads */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  {
                    label: "CV — AI/ML Engineer",
                    href: "/cv/Hammad_Ahmad_AI_CV.pdf",
                    cvType: "ai-ml" as const,
                    primary: true,
                  },
                  {
                    label: "CV — Software Engineer",
                    href: "/cv/Hammad_Ahmad_SE_CV.pdf",
                    cvType: "software-engineer" as const,
                    primary: false,
                  },
                  {
                    label: "CV — Research / PhD",
                    href: "/cv/Hammad_Ahmad_CV.pdf",
                    cvType: "research-phd" as const,
                    primary: false,
                  },
                ].map(({ label, href, cvType, primary }) => (
                  <a
                    key={cvType}
                    href={href}
                    download
                    onClick={() => {
                      fetch("/api/track-download", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cvType }),
                      }).catch(() => {});
                    }}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={
                      primary
                        ? {
                            backgroundColor: "var(--accent-muted)",
                            borderColor: "rgba(99,102,241,0.25)",
                            color: "var(--accent)",
                          }
                        : {
                            backgroundColor: "var(--surface-elevated)",
                            borderColor: "var(--border)",
                            color: "var(--text-secondary)",
                          }
                    }
                  >
                    <FiDownload size={14} />
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Education */}
            <div>
              <h3
                className="text-lg font-semibold mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                Education
              </h3>
              <div>
                {EDUCATION.map((edu) => (
                  <EducationCard key={edu.id} edu={edu} />
                ))}
              </div>
            </div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border p-5"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { lang: "English", level: "Fluent (IELTS 7.0)" },
                  { lang: "Urdu", level: "Native" },
                  { lang: "German", level: "A1.2 — Learning" },
                ].map(({ lang, level }) => (
                  <div key={lang} className="flex items-center gap-1.5">
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {lang}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      · {level}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — skills */}
          <div>
            <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
              Technical Skills
            </h3>
            <div className="space-y-6">
              {SKILL_GROUPS.map((group, gi) => (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: gi * 0.06 }}
                >
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-3 font-mono"
                    style={{ color: "var(--accent)" }}
                  >
                    {group.label}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span key={skill} className="tag-pill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
