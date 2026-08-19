"use client";

import { useState } from "react";

/**
 * Where a CV actually goes, per scoring path.
 *
 * No score is computed here and no number is invented. The point is the
 * boundary: which of the three paths needs an account, which stores the CV, and
 * which sends it to a third party. Every line matches what jobzyl.com discloses
 * on /about and /privacy - if the two ever disagree, the site is right and this
 * is stale.
 */

type Hop = "browser" | "database" | "anthropic";

const HOPS: { id: Hop; label: string }[] = [
  { id: "browser", label: "Your browser" },
  { id: "database", label: "Our database" },
  { id: "anthropic", label: "Anthropic (US)" },
];

interface Path {
  name: string;
  kind: string;
  account: boolean;
  stored: boolean;
  hops: Hop[];
  how: string;
  gives: string;
  refuses: string;
}

const PATHS: Path[] = [
  {
    name: "Keyword",
    kind: "in-browser extraction",
    account: false,
    stored: false,
    hops: ["browser"],
    how: "The CV is parsed in the page. Skills come from a local dictionary unioned with the server's own extraction from the full posting, and the percentage is computed next to you.",
    gives: "A match percentage, the skills you already have, and a ranked list of the ones the posting named that you did not.",
    refuses:
      "When a posting names too few skills to judge, it says so rather than show a number. A posting that named none used to render a confident 0%, which reads identically to a real mismatch.",
  },
  {
    name: "Semantic",
    kind: "pgvector cosine similarity",
    account: true,
    stored: true,
    hops: ["browser", "database"],
    how: "A saved CV is embedded once, and that vector is compared against job embeddings by cosine similarity in Postgres. The same index answers the up-to-24-row similar-jobs list on a posting.",
    gives: "A fit signal that survives different vocabulary, so a CV saying Postgres still matches a posting asking for PostgreSQL.",
    refuses:
      "It needs the CV in the database to work, so it is opt-in rather than default. The vector and the encrypted text stay first-party: the score is not produced by a third party.",
  },
  {
    name: "AI writing",
    kind: "cover letters, interview prep, CV tips",
    account: true,
    stored: true,
    hops: ["browser", "database", "anthropic"],
    how: "The CV text and the job description are sent to Claude under a system guard, with the untrusted posting inside delimited blocks as prompt-injection defence, and a per-user daily quota.",
    gives: "Drafted prose, not a score. This is the one path that leaves, and it is disclosed on the about page and in the privacy policy rather than buried.",
    refuses:
      "It is never on by default and never silent. Transfer is to the US under EU standard contractual clauses, and that sentence exists on the site because omitting it would have been the easy option.",
  },
];

export default function MatchPathExplorer() {
  const [index, setIndex] = useState(0);
  const path = PATHS[index];

  return (
    <div
      className="my-10 rounded-xl border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Try it · three scoring paths
      </p>
      <h4 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        How far does the CV travel?
      </h4>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Scoring paths">
        {PATHS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className="rounded-lg border px-3 py-1.5 font-mono text-[11px] transition-colors"
            style={{
              borderColor: i === index ? "var(--accent)" : "var(--border)",
              color: i === index ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor:
                i === index ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* The hop chain: lit hops are the ones this path touches. */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {HOPS.map((hop, i) => {
          const on = path.hops.includes(hop.id);
          const leaves = hop.id === "anthropic" && on;
          return (
            <span key={hop.id} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {"->"}
                </span>
              )}
              <span
                className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px]"
                style={{
                  borderColor: on
                    ? leaves
                      ? "var(--accent-secondary)"
                      : "var(--accent)"
                    : "var(--border)",
                  color: on
                    ? leaves
                      ? "var(--accent-secondary)"
                      : "var(--accent)"
                    : "var(--text-muted)",
                  backgroundColor: on
                    ? `color-mix(in srgb, ${leaves ? "var(--accent-secondary)" : "var(--accent)"} 10%, transparent)`
                    : "transparent",
                  opacity: on ? 1 : 0.55,
                }}
              >
                {hop.label}
              </span>
            </span>
          );
        })}
      </div>

      <div className="mt-5 space-y-3" role="tabpanel" aria-live="polite">
        <p className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
          {path.kind}
          {" · "}
          {path.account ? "needs a free account" : "no account needed"}
          {" · "}
          {path.stored ? "CV stored, Fernet-encrypted at rest" : "CV never uploaded"}
        </p>

        {(
          [
            ["How it works", path.how],
            ["What it gives you", path.gives],
            ["What it will not do", path.refuses],
          ] as const
        ).map(([label, body]) => (
          <div key={label}>
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
            <p className="mt-1 text-sm">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
