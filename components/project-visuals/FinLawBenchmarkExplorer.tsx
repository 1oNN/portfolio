"use client";

import { useId, useRef, useState } from "react";
import { FiArrowUpRight, FiCheckCircle } from "react-icons/fi";
import { FINLAW_BENCHMARK, FINLAW_EVAL_SET_URL } from "@/lib/demo-data/finlaw-benchmark";

/**
 * Interactive walkthrough of the real FinLaw-UK evaluation set: the 10 curated
 * benchmark questions with their gold answers and the citations a correct
 * answer must carry. All data is verbatim from the public eval CSV in the repo -
 * nothing here is model-generated.
 *
 * Semantics follow the ARIA tabs pattern (tablist / tab / tabpanel) with
 * arrow-key navigation. The first item is selected at render time, so the
 * panel content is server-rendered and readable before hydration.
 */
export default function FinLawBenchmarkExplorer({
  accent,
  className,
}: {
  accent: string;
  className?: string;
}) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const item = FINLAW_BENCHMARK[selected];

  function onKeyDown(e: React.KeyboardEvent) {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (selected + 1) % FINLAW_BENCHMARK.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (selected - 1 + FINLAW_BENCHMARK.length) % FINLAW_BENCHMARK.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = FINLAW_BENCHMARK.length - 1;
    }
    if (next !== null) {
      e.preventDefault();
      setSelected(next);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <div className={className}>
      <p className="max-w-3xl text-[0.9375rem] leading-[1.75] text-[var(--text-secondary)]">
        These are 10 real items from the 110-item benchmark the system was scored against -
        the question, the gold answer, and the citations a correct answer must carry. The
        Neo4j graph validates those citations at generation time: an answer citing a rule
        that is absent from the graph is flagged as a potential hallucination.
      </p>

      {/* Question chips */}
      <div
        role="tablist"
        aria-label="Benchmark questions"
        onKeyDown={onKeyDown}
        className="mt-8 flex flex-wrap gap-2"
      >
        {FINLAW_BENCHMARK.map((q, i) => {
          const isSelected = i === selected;
          return (
            <button
              key={q.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(i)}
              className={
                isSelected
                  ? "rounded-md border px-3 py-1.5 font-mono text-xs font-semibold"
                  : "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
              }
              style={
                isSelected
                  ? {
                      color: accent,
                      borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
                    }
                  : undefined
              }
            >
              {q.domain}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${selected}`}
        className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
      >
        <div key={item.id} className="animate-message-in">
          <div
            className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {item.id} · {item.domainLabel}
          </div>

          <h3
            className="mt-3 font-display text-xl font-semibold leading-snug sm:text-2xl"
            style={{ color: "var(--text-primary)" }}
          >
            {item.question}
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <div
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest"
                style={{ color: accent, fontFamily: "var(--font-mono)" }}
              >
                <FiCheckCircle size={12} />
                Gold answer
              </div>
              <p className="mt-2 max-w-2xl text-[0.9375rem] leading-[1.75] text-[var(--text-secondary)]">
                {item.goldAnswer}
              </p>
            </div>

            <div>
              <div
                className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Required citations - validated against the graph
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {item.citations.map((c) => (
                  <span
                    key={c}
                    className="rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold"
                    style={{
                      color: accent,
                      backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">
        Data verbatim from the public eval set (curated basic tier) - the aggregate scores
        above come from the full 110 items.{" "}
        <a
          href={FINLAW_EVAL_SET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[var(--text-secondary)] underline decoration-transparent underline-offset-2 transition-colors hover:text-[var(--text-primary)] hover:decoration-current focus-visible:text-[var(--text-primary)] focus-visible:decoration-current"
        >
          View the eval set on GitHub
          <FiArrowUpRight size={10} />
        </a>
      </p>
    </div>
  );
}
