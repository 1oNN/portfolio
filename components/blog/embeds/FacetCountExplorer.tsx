"use client";

import { useState } from "react";

/**
 * Why a facet count has to exclude its own dimension.
 *
 * The 14 rows below are real: the first page of a search for Machine Learning
 * Engineer in the United Kingdom on 19 August 2026, with the board, work mode
 * and stated pay exactly as that page carried them. Nothing here is generated,
 * and no ranking is simulated - the demo is only about counting.
 *
 * Flip the mode and the numbers beside every unselected option collapse to
 * zero, which is the bug: a count that includes the dimension it is counting
 * can only ever describe the filter you already have.
 */

type Mode = "Remote" | "On-site" | "Not stated";
type Board = "Reed" | "Careerjet" | "Ashby" | "Greenhouse" | "Indeed";

interface Row {
  title: string;
  company: string;
  board: Board;
  mode: Mode;
  pay: boolean;
}

const ROWS: Row[] = [
  { title: "Machine Learning Engineer", company: "Method Resourcing", board: "Reed", mode: "Not stated", pay: true },
  { title: "AI Agent Engineer / Machine Learning Engineer", company: "Investigo", board: "Careerjet", mode: "Not stated", pay: false },
  { title: "Machine Learning Engineer", company: "Sanderson", board: "Reed", mode: "Remote", pay: false },
  { title: "Machine Learning Engineer", company: "Sanderson", board: "Reed", mode: "Remote", pay: false },
  { title: "Machine Learning Engineer", company: "Method Resourcing", board: "Careerjet", mode: "Not stated", pay: false },
  { title: "Machine Learning Engineer", company: "Sanderson Recruitment", board: "Careerjet", mode: "Not stated", pay: false },
  { title: "Machine Learning Engineer", company: "System1 Group", board: "Careerjet", mode: "Not stated", pay: false },
  { title: "Machine Learning Engineer", company: "Method Resourcing", board: "Reed", mode: "Not stated", pay: true },
  { title: "Machine Learning Engineer", company: "Trainline", board: "Ashby", mode: "Remote", pay: false },
  { title: "Senior Machine Learning Engineer", company: "Lorien", board: "Reed", mode: "Not stated", pay: false },
  { title: "Principal Machine Learning Engineer", company: "Futureheads", board: "Careerjet", mode: "Not stated", pay: false },
  { title: "Machine Learning Engineer, Platform", company: "Scale AI", board: "Greenhouse", mode: "Not stated", pay: false },
  { title: "MLE- Machine Learning Engineer", company: "Sanderson", board: "Reed", mode: "Remote", pay: false },
  { title: "Machine Learning Engineer - Fulfillment", company: "JD.com", board: "Indeed", mode: "On-site", pay: false },
];

const BOARDS: Board[] = ["Reed", "Careerjet", "Ashby", "Greenhouse", "Indeed"];
const MODES: Mode[] = ["Remote", "On-site", "Not stated"];

interface Filters {
  board: Board | null;
  mode: Mode | null;
  payOnly: boolean;
}

/** `skip` names the dimension a count is being produced for. */
function matches(row: Row, f: Filters, skip?: keyof Filters): boolean {
  if (skip !== "board" && f.board && row.board !== f.board) return false;
  if (skip !== "mode" && f.mode && row.mode !== f.mode) return false;
  if (skip !== "payOnly" && f.payOnly && !row.pay) return false;
  return true;
}

export default function FacetCountExplorer() {
  const [filters, setFilters] = useState<Filters>({ board: null, mode: null, payOnly: false });
  const [honest, setHonest] = useState(true);

  const results = ROWS.filter((r) => matches(r, filters));
  const count = (dimension: keyof Filters, predicate: (r: Row) => boolean) =>
    ROWS.filter((r) => predicate(r) && matches(r, filters, honest ? dimension : undefined)).length;

  const swatch = (active: boolean) => ({
    borderColor: active ? "var(--accent)" : "var(--border)",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    backgroundColor: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
  });

  return (
    <div
      className="my-10 rounded-xl border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Try it · facet counts
      </p>
      <h4 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        What do I get if I click this?
      </h4>
      <p className="mt-1 text-sm">
        14 real rows from one search. Filter them, then switch how the counts are produced.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setHonest(true)}
          aria-pressed={honest}
          className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
          style={swatch(honest)}
        >
          Exclude own dimension
        </button>
        <button
          type="button"
          onClick={() => setHonest(false)}
          aria-pressed={!honest}
          className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
          style={swatch(!honest)}
        >
          Apply every filter
        </button>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Source board
          </p>
          <div className="mt-2 space-y-1">
            {BOARDS.map((b) => {
              const n = count("board", (r) => r.board === b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, board: f.board === b ? null : b }))}
                  aria-pressed={filters.board === b}
                  className="flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-sm transition-colors"
                  style={swatch(filters.board === b)}
                >
                  <span>{b}</span>
                  <span className="font-mono text-[11px]" style={{ color: n === 0 ? "var(--text-muted)" : undefined }}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Work mode
          </p>
          <div className="mt-2 space-y-1">
            {MODES.map((m) => {
              const n = count("mode", (r) => r.mode === m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, mode: f.mode === m ? null : m }))}
                  aria-pressed={filters.mode === m}
                  className="flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-sm transition-colors"
                  style={swatch(filters.mode === m)}
                >
                  <span>{m}</span>
                  <span className="font-mono text-[11px]" style={{ color: n === 0 ? "var(--text-muted)" : undefined }}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Pay
          </p>
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, payOnly: !f.payOnly }))}
            aria-pressed={filters.payOnly}
            className="mt-2 flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-sm transition-colors"
            style={swatch(filters.payOnly)}
          >
            <span>Pay shown</span>
            <span className="font-mono text-[11px]">{count("payOnly", (r) => r.pay)}</span>
          </button>
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border p-4"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
      >
        <p className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }} aria-live="polite">
          {results.length} of {ROWS.length} rows
        </p>
        <p className="mt-1 text-sm">
          {honest
            ? "Every count above answers what you would be left with if you clicked that option, because the dimension being counted is left out of its own filter."
            : "Every count now includes the dimension it is counting, so unselected options read zero and the only number that still means anything is the one you already picked."}
        </p>
        {results.length > 0 && (
          <ul className="mt-3 space-y-1">
            {results.slice(0, 5).map((r, i) => (
              <li key={`${r.company}-${i}`} className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                {r.title} · {r.company} · {r.board}
              </li>
            ))}
            {results.length > 5 && (
              <li className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                and {results.length - 5} more
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
