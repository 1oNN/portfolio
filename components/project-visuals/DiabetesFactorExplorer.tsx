"use client";

import { useId, useState } from "react";

/**
 * Interactive layer over the published BRFSS 2015 risk-factor statistics from
 * the DiabetesSense study (253,680 CDC records). Every number here is the
 * dataset's measured Pearson correlation with a diabetes diagnosis, matching
 * the static hero chart - this explorer only lets visitors focus one factor
 * at a time. Deliberately NOT a prediction tool: no model runs here.
 */

interface Factor {
  name: string;
  r: number;
  fact: string;
}

const FACTORS: Factor[] = [
  {
    name: "High blood pressure",
    r: 0.38,
    fact: "The strongest positive correlate in the dataset - and like every feature the app collects, it's self-reportable without a lab test.",
  },
  {
    name: "High cholesterol",
    r: 0.29,
    fact: "Tied with BMI as the second-strongest positive correlate at +0.29.",
  },
  {
    name: "BMI",
    r: 0.29,
    fact: "Tied with high cholesterol at +0.29. One of the 19 lab-free questionnaire inputs the deployed screening app asks for.",
  },
  {
    name: "Age group",
    r: 0.27,
    fact: "Prevalence climbs sharply from age 50 onward - the steepest demographic gradient in the dataset.",
  },
  {
    name: "Physical health",
    r: 0.21,
    fact: "Self-reported physical health tracks positively with a diabetes diagnosis - the last of the five positive correlates in the ranking.",
  },
  {
    name: "Physical activity",
    r: -0.09,
    fact: "Protective, but the weakest signal on the chart - far smaller in magnitude than the top risk factors.",
  },
  {
    name: "Education",
    r: -0.15,
    fact: "Socioeconomic features are protective in this dataset; education at -0.15 sits just behind income.",
  },
  {
    name: "Income",
    r: -0.19,
    fact: "The stronger of the two protective socioeconomic features, at -0.19.",
  },
  {
    name: "General health",
    r: -0.41,
    fact: "The strongest correlate overall, and it's negative: better self-rated general health means lower diabetes prevalence. By magnitude it beats every positive risk factor.",
  },
];

const MAX_R = 0.45; // same scale as the static hero chart

export default function DiabetesFactorExplorer({
  accent,
  className,
}: {
  accent: string;
  className?: string;
}) {
  const [selected, setSelected] = useState(0);
  const baseId = useId();

  return (
    <div className={className}>
      <p className="max-w-3xl text-[0.9375rem] leading-[1.75] text-[var(--text-secondary)]">
        Select a factor to see how it correlates with a diabetes diagnosis across the
        253,680-record BRFSS 2015 dataset. These are the measured dataset statistics behind
        the study - not a prediction about you.
      </p>

      <div className="mt-8 space-y-1.5">
        {/* Axis header */}
        <div
          className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]"
          aria-hidden="true"
        >
          <span>&larr; protective</span>
          <span>risk-raising &rarr;</span>
        </div>

        {FACTORS.map((f, i) => {
          const isSelected = i === selected;
          const widthPct = (Math.abs(f.r) / MAX_R) * 50;
          const positive = f.r > 0;
          return (
            <div key={f.name}>
              <button
                type="button"
                aria-expanded={isSelected}
                aria-controls={`${baseId}-fact-${i}`}
                onClick={() => setSelected(i)}
                className={
                  "block w-full rounded-md border px-3 py-2.5 text-left transition-colors " +
                  (isSelected
                    ? "border-[var(--border)] bg-[var(--surface)]"
                    : "border-transparent hover:bg-[var(--surface)] focus-visible:bg-[var(--surface)]")
                }
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span
                    className={
                      "text-sm font-medium " +
                      (isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")
                    }
                  >
                    {f.name}
                  </span>
                  <span
                    className="font-mono text-xs font-semibold tabular-nums"
                    style={{ color: isSelected ? accent : "var(--text-muted)" }}
                  >
                    {f.r > 0 ? "+" : ""}
                    {f.r.toFixed(2)}
                  </span>
                </span>
                {/* Diverging bar track */}
                <span className="relative mt-2 block h-1.5 w-full" aria-hidden="true">
                  {/* center axis */}
                  <span
                    className="absolute inset-y-0 left-1/2 w-px"
                    style={{ backgroundColor: "var(--border)" }}
                  />
                  <span
                    className="absolute inset-y-0 rounded-full transition-opacity duration-200"
                    style={{
                      backgroundColor: accent,
                      opacity: isSelected ? 1 : 0.35,
                      width: `${widthPct}%`,
                      ...(positive ? { left: "50%" } : { right: "50%" }),
                    }}
                  />
                </span>
              </button>
              <div
                id={`${baseId}-fact-${i}`}
                hidden={!isSelected}
                className="px-3 pb-2 pt-1.5"
              >
                <p className="max-w-2xl text-[0.875rem] leading-[1.7] text-[var(--text-secondary)]">
                  {f.fact}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">
        Pearson correlation with diabetes status · BRFSS 2015, 253,680 records · dataset
        statistics, not a diagnostic tool.
      </p>
    </div>
  );
}
