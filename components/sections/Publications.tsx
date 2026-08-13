import SectionHeader from "@/components/ui/SectionHeader";
import { ORCID_ID, ORCID_URL, PUBLICATIONS } from "@/lib/constants";
import type { Publication } from "@/types";

const TYPE_LABEL: Record<Publication["type"], string> = {
  conference: "Conference paper",
  journal: "Journal article",
  chapter: "Book chapter",
};

export default function Publications() {
  return (
    <section id="research" className="hairline-accent">
      <div className="animate-reveal py-14 sm:py-16">
        <SectionHeader
          size="lg"
          eyebrow="Research"
          title="Publications"
          description="Peer-reviewed work presented at international venues."
        />

        <div className="mt-4 divide-y divide-[var(--border)]">
          {PUBLICATIONS.map((pub) => (
            /* The whole entry is the link, matching the project rows: the DOI is
               the only destination on the card, so making the reader hunt for a
               small mono link was needless. Opens in a new tab because it leaves
               the site for the publisher. */
            <a
              key={pub.id}
              href={pub.doi ? `https://doi.org/${pub.doi}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative -mx-4 block rounded-lg px-4 py-8 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--status-research)_7%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--status-research)_7%,transparent)] sm:grid sm:grid-cols-[88px_1fr] sm:gap-6"
            >
              <span
                aria-hidden="true"
                className="absolute bottom-8 left-0 top-8 w-0.5 origin-center scale-y-0 rounded-full transition-transform duration-200 group-hover:scale-y-100 group-focus-visible:scale-y-100"
                style={{ backgroundColor: "var(--status-research)" }}
              />
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
                  className="mt-3 text-base font-semibold leading-tight text-[var(--text-primary)] transition duration-200 group-hover:translate-x-1 group-hover:text-[var(--status-research)] group-focus-visible:translate-x-1 group-focus-visible:text-[var(--status-research)] sm:text-lg"
                >
                  {pub.title}
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block text-[var(--text-muted)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5"
                  >
                    ↗
                  </span>
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {pub.authors}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {pub.venue}
                </p>

                {/* Not a link any more - the whole card is. Kept visible because
                    the DOI is the citation, not just a destination. */}
                {pub.doi && (
                  <span className="mt-3 inline-block font-mono text-xs text-[var(--text-muted)] underline-offset-2 transition-colors duration-200 group-hover:text-[var(--status-research)] group-hover:underline group-focus-visible:text-[var(--status-research)] group-focus-visible:underline">
                    doi:{pub.doi}
                  </span>
                )}
              </div>
            </a>
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
          <p className="mt-3 max-w-[32rem] text-sm leading-[1.7]" style={{ color: "var(--text-secondary)" }}>
            Graph-augmented retrieval, LLM faithfulness evaluation, systems optimisation for
            high-throughput ML pipelines, and interpretable predictive modelling for clinical
            applications. Open to funded PhD positions in the EU and UK.
          </p>
          <a
            href={ORCID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)] underline-offset-2 transition-colors hover:text-[var(--text-primary)] hover:underline focus-visible:text-[var(--text-primary)] focus-visible:underline"
          >
            ORCID {ORCID_ID}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
