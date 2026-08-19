import SectionHeader from "@/components/ui/SectionHeader";
import CvDownloads from "@/components/sections/CvDownloads";
import { EDUCATION } from "@/lib/constants";
import { AVAILABLE_CVS } from "@/lib/cv-config";

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
      {/* First section on the page, so no top padding: `main` already applies
          lg:py-24 and stacking py-14 on top of it opened the page with about
          10rem of dead space before the first word. */}
      <div className="animate-reveal pb-14 sm:pb-16">
        <SectionHeader
          size="lg"
          statement
          eyebrow="About"
          title="Background"
          description="I build production LLM systems - retrieval pipelines that pair vector search with knowledge graphs, so the answers stay grounded and citable."
        />

        <div className="mt-10 space-y-12">
          {/* Bio, languages, CV, education */}
          <div>
            {/* max-w in rem, narrower than the ~38.9rem column, so it actually
                clamps - see the note in SectionHeader. Looser leading and a
                bigger paragraph gap give the eye somewhere to rest. */}
            <div
              className="max-w-[34rem] space-y-5 text-base leading-[1.75]"
              style={{ color: "var(--text-secondary)" }}
            >
              <p>
                I&apos;m an AI/ML engineer with an MSc (Merit) in Artificial Intelligence from
                the University of Bradford and a first-author Springer paper. My work sits
                where applied research meets production: measuring a system honestly, then making
                it fast enough to put in front of real users.
              </p>
              <p>
                For my dissertation I built FinLaw-UK, a graph-augmented RAG system for UK
                financial regulation where a Neo4j knowledge graph resolves every citation before
                the answer ships, and refuses rather than answer when it cannot. After submitting,
                I re-measured my own evaluation and found two of the reported figures were regex
                shape-checks rather than correctness measures; I published the correction and a
                report on which numbers reproduce. At Outlyst I cut mean call latency 54%, from
                2.4s to 1.1s across 2,100+ calls, by profiling async I/O and restructuring
                connection pooling.
              </p>
              <p>
                I&apos;m interested in roles where I can keep pushing that boundary - LLM
                infrastructure, graph-based retrieval, or high-throughput ML systems.
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

          {/* Skills moved to their own section: sitting directly under
              Education with identical mono group labels, they read as
              Education sub-headings rather than a category of their own. */}
        </div>
      </div>
    </section>
  );
}
