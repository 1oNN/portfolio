import SectionHeader from "@/components/ui/SectionHeader";
import CvDownloads from "@/components/sections/CvDownloads";
import { EDUCATION } from "@/lib/constants";
import { AVAILABLE_CVS } from "@/lib/cv-config";

const SKILL_GROUPS = [
  {
    label: "Programming languages",
    skills: ["Python", "SQL", "TypeScript", "JavaScript"],
  },
  {
    label: "AI & ML",
    skills: ["PyTorch", "TensorFlow", "scikit-learn", "LLMs/NLP", "RAG", "Sentence Transformers", "Retell AI"],
  },
  {
    label: "Infrastructure",
    skills: ["Docker", "CI/CD", "FastAPI", "Flask", "AWS", "GCP", "REST APIs"],
  },
  {
    label: "Data Engineering",
    skills: ["Neo4j", "PostgreSQL", "pandas/NumPy"],
  },
  {
    label: "Frontend",
    skills: ["React.js", "Next.js"],
  },
];

// Short mono form of language proficiency - derived from the fuller facts
// (English fluent/IELTS 7.0, Urdu native, German A1.2 learning).
const LANGUAGES = [
  { code: "EN", level: "fluent" },
  { code: "UR", level: "native" },
  { code: "DE", level: "A1" },
];

export default function About() {
  return (
    <section id="about" className="hairline-accent">
      <div className="animate-reveal py-14 sm:py-16">
        <SectionHeader
          size="lg"
          statement
          eyebrow="About"
          title="Background & skills"
          description="ML engineer at heart, researcher by training - I build systems that are fast, explainable, and built to last."
        />

        <div className="mt-10 space-y-12">
          {/* Bio, languages, CV, education */}
          <div>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <p>
                I&apos;m an AI/ML engineer with an MSc in Applied Artificial Intelligence from the
                University of Bradford. My work sits at the intersection of production systems
                engineering and applied research: measuring a system honestly, then making it
                fast enough to run in front of real users.
              </p>
              <p>
                At Outlyst, I cut mean call latency 54% across 2,100+ outbound calls by profiling
                async I/O bottlenecks and restructuring connection pooling. For my dissertation, I built FinLaw-UK - a graph-augmented RAG system
                for UK financial regulation that uses a Neo4j knowledge graph to validate
                citations and flag hallucinations, reaching 0.82 source accuracy with Mistral 7B.
              </p>
              <p>
                I&apos;m interested in roles where I can continue pushing the boundary between
                research and production - whether that&apos;s LLM infrastructure, graph-based
                retrieval, or high-throughput ML systems.
              </p>
            </div>

            <p
              className="mt-4 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Spoken languages: {LANGUAGES.map((l) => `${l.code} ${l.level}`).join(" · ")}
            </p>

            {AVAILABLE_CVS.length > 0 && (
              <div className="mt-6">
                <CvDownloads />
              </div>
            )}

            <div className="mt-10">
              <h3
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Education
              </h3>
              <div className="mt-4 divide-y divide-[var(--border)]">
                {EDUCATION.map((edu) => (
                  <div key={edu.id} className="py-5 first:pt-0 last:pb-0">
                    <h4 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      {edu.degree} in {edu.field}
                    </h4>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--accent)" }}>
                      {edu.institution}
                    </p>
                    <p
                      className="mt-1.5 font-mono text-[11px] uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {edu.startDate} - {edu.endDate} · {edu.location}
                    </p>
                    {edu.dissertation && (
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Dissertation - {edu.dissertation}
                      </p>
                    )}
                    {edu.focus && (
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Focus - {edu.focus}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skills - two-column flow under the bio */}
          <div>
            <div className="grid gap-6 sm:grid-cols-2">
              {SKILL_GROUPS.map((group) => (
                <div key={group.label}>
                  <h3
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {group.label}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded px-2 py-0.5 font-mono text-[11px]"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-secondary)" }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
