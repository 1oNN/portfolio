import SectionHeader from "@/components/ui/SectionHeader";
import { PUBLICATIONS } from "@/lib/constants";
import type { Publication } from "@/types";

const TYPE_LABEL: Record<Publication["type"], string> = {
  conference: "Conference paper",
  journal: "Journal article",
  chapter: "Book chapter",
};

export default function Publications() {
  return (
    <section id="research" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="py-14 sm:py-16">
        <SectionHeader
          number="05"
          eyebrow="Research"
          title="Publications"
          description="Peer-reviewed work presented at international venues."
        />

        <div className="mt-4 divide-y divide-[var(--border)]">
          {PUBLICATIONS.map((pub) => (
            <div key={pub.id} className="py-8 sm:grid sm:grid-cols-[88px_1fr] sm:gap-6">
              {/* Year */}
              <div>
                <span
                  className="font-mono text-[11px] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {pub.year}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 sm:mt-0">
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    color: "var(--status-research)",
                    backgroundColor: "color-mix(in srgb, var(--status-research) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--status-research) 25%, transparent)",
                  }}
                >
                  {TYPE_LABEL[pub.type]}
                </span>

                <h3
                  className="mt-3 text-base font-semibold leading-tight sm:text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {pub.title}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {pub.authors}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {pub.venue}
                </p>

                {pub.doi && (
                  <a
                    href={`https://doi.org/${pub.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-[var(--accent)] underline-offset-2 hover:underline focus-visible:underline"
                  >
                    doi:{pub.doi}
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Research interests */}
        <div
          className="mt-10 rounded-xl border p-6"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="font-mono text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            Research interests
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Graph-augmented retrieval, LLM faithfulness evaluation, systems optimisation for
            high-throughput ML pipelines, and interpretable predictive modelling for clinical
            applications. Currently exploring MSCA-eligible opportunities — earliest start date
            October 2026.
          </p>
        </div>
      </div>
    </section>
  );
}
