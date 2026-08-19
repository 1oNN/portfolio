"use client";

import { useId, useState } from "react";

/**
 * The cross-board identity key, runnable.
 *
 * This is the rule Jobzyl dedupes on, not a copy of the production function:
 * accent-fold, strip punctuation, drop company legal suffixes, collapse
 * whitespace. Two postings collapse into one row when their keys match.
 *
 * Deliberately no scoring and no fuzzy matching. The point of the demo is that
 * the key is conservative - "Senior X" and "X" are different jobs and must not
 * merge - so a visitor can try to break it and see where it refuses.
 */

// Real legal forms only. "Group", "Holdings" and "Recruitment" are part of a
// company's name, not a suffix, and dropping them merges companies that are
// genuinely different.
const LEGAL_SUFFIXES = new Set([
  "ltd", "limited", "plc", "llc", "llp", "lp", "inc", "incorporated",
  "corp", "corporation", "co", "gmbh", "ag", "bv", "nv", "sa", "sas",
  "srl", "spa", "oy", "ab", "as", "aps", "pty",
]);

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function foldCompany(value: string): string {
  const words = fold(value).split(" ").filter(Boolean);
  while (words.length > 1 && LEGAL_SUFFIXES.has(words[words.length - 1])) words.pop();
  return words.join(" ");
}

function identityKey(p: Posting): string {
  return [fold(p.title), foldCompany(p.company), fold(p.location)].join(" | ");
}

interface Posting {
  title: string;
  company: string;
  location: string;
}

interface Preset {
  label: string;
  note: string;
  a: Posting;
  b: Posting;
}

// Every pair below is drawn from real rows in a search for Machine Learning
// Engineer in the United Kingdom on 19 August 2026, except the punctuation and
// suffix variants, which are the shapes the same employer posts under.
const PRESETS: Preset[] = [
  {
    label: "Same job, two boards",
    note: "One row, with Careerjet named on it as the other board carrying it.",
    a: { title: "Machine Learning Engineer", company: "Sanderson", location: "Bristol" },
    b: { title: "Machine Learning Engineer", company: "Sanderson Ltd.", location: "Bristol" },
  },
  {
    label: "Seniority differs",
    note: "Two rows. These are different jobs and no amount of similarity should merge them.",
    a: { title: "Senior Machine Learning Engineer", company: "Futureheads", location: "London" },
    b: { title: "Machine Learning Engineer", company: "Futureheads", location: "London" },
  },
  {
    label: "Accents and punctuation",
    note: "One row. Folding happens before comparison, so an umlaut is not a different employer.",
    a: { title: "Data Engineer", company: "Bundesagentur für Arbeit", location: "München" },
    b: { title: "Data Engineer", company: "Bundesagentur fur Arbeit", location: "Munchen" },
  },
  {
    label: "Location granularity",
    note: "Two rows, and this is the honest limit: the key cannot tell that Clifton is in Bristol.",
    a: { title: "Machine Learning Engineer", company: "Sanderson Recruitment", location: "Clifton, Bristol" },
    b: { title: "Machine Learning Engineer", company: "Sanderson Recruitment", location: "Bristol" },
  },
];

export default function DedupeKeyExplorer() {
  const [index, setIndex] = useState(0);
  const [a, setA] = useState<Posting>(PRESETS[0].a);
  const [b, setB] = useState<Posting>(PRESETS[0].b);
  const groupId = useId();

  const keyA = identityKey(a);
  const keyB = identityKey(b);
  const merges = keyA === keyB;
  const preset = PRESETS[index];
  const edited =
    JSON.stringify(a) !== JSON.stringify(preset.a) || JSON.stringify(b) !== JSON.stringify(preset.b);

  function choose(i: number) {
    setIndex(i);
    setA(PRESETS[i].a);
    setB(PRESETS[i].b);
  }

  return (
    <div
      className="my-10 rounded-xl border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Try it · identity key
      </p>
      <h4 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        Do these two postings collapse into one row?
      </h4>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Example posting pairs">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => choose(i)}
            aria-pressed={i === index}
            className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
            style={{
              borderColor: i === index ? "var(--accent)" : "var(--border)",
              color: i === index ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor:
                i === index ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {([["A", a, setA], ["B", b, setB]] as const).map(([label, posting, set]) => (
          <fieldset key={label} className="rounded-lg border p-3" style={{ borderColor: "var(--border)" }}>
            <legend
              className="px-1 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Posting {label}
            </legend>
            {(["title", "company", "location"] as const).map((field) => (
              <label key={field} className="mt-2 block">
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {field}
                </span>
                <input
                  id={`${groupId}-${label}-${field}`}
                  value={posting[field]}
                  onChange={(e) => set({ ...posting, [field]: e.target.value })}
                  className="mt-1 w-full rounded border px-2 py-1.5 text-sm outline-none"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-elevated)",
                    color: "var(--text-primary)",
                  }}
                />
              </label>
            ))}
            <p className="mt-3 break-words font-mono text-[11px]" style={{ color: "var(--accent)" }}>
              {identityKey(posting) || "(empty)"}
            </p>
          </fieldset>
        ))}
      </div>

      <div
        className="mt-5 rounded-lg border p-4"
        style={{
          borderColor: merges ? "var(--accent)" : "var(--border)",
          backgroundColor: merges
            ? "color-mix(in srgb, var(--accent) 8%, transparent)"
            : "var(--surface-elevated)",
        }}
      >
        <p className="font-mono text-sm font-semibold" style={{ color: merges ? "var(--accent)" : "var(--text-primary)" }}>
          {merges ? "One row" : "Two rows"}
        </p>
        <p className="mt-1 text-sm" aria-live="polite">
          {merges
            ? "The keys match, so these are the same job and the losing copy is recorded as another board carrying it."
            : "The keys differ, so both are kept. The key never guesses: anything it cannot prove is the same job stays separate."}
        </p>
        {!edited && (
          <p className="mt-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
            {preset.note}
          </p>
        )}
      </div>
    </div>
  );
}
