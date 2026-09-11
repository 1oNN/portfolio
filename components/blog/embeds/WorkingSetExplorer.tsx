"use client";

import { useId, useState } from "react";

/**
 * Where the 8-second statement timeout starts eating broad searches.
 *
 * Not a simulator of the planner. It is a two-point model, calibrated on the
 * before and after measured against production on 2026-08-23, and the component
 * says so on screen: what it is good for is showing that the failure is a cliff
 * rather than a slope, and that the cliff moves with RAM.
 */

/** 16 GB of table plus 5.5 GB of indexes over 2.269M rows. */
const GB_PER_MILLION = 9.47;
/** A cold broad search read 1.56 GB of pages at 2.27M rows. */
const READ_GB_PER_MILLION = 0.687;
/**
 * Calibrated on the 24 GB measurement: 81 MB of misses answered in 2.0s. The
 * 12 GB case then lands at about 21s, which sits between the 16.3s a reader
 * actually waited and the 55s the read costs with no timeout on it at all.
 * VACUUM measured 25.17 MB/s, but that is nearer sequential than this mix.
 */
const RANDOM_READ_MB_S = 40;
/** `authenticator` carries statement_timeout=8s. Past this the read is killed. */
const TIMEOUT_S = 8;
/** The rest of the box has to live somewhere. */
const CACHE_FRACTION = 0.85;

interface Preset {
  label: string;
  ram: number;
  millions: number;
  measured: string;
}

const PRESETS: Preset[] = [
  {
    label: "Before",
    ram: 12,
    millions: 2.27,
    measured: "software engineer / US: 16.3s, then 0 results. Direct SQL, 55s for 1,500 rows.",
  },
  {
    label: "After",
    ram: 24,
    millions: 2.27,
    measured: "The same query, same session: 2.0s for 1,500 rows. No pair returned zero.",
  },
];

export default function WorkingSetExplorer() {
  const ramId = useId();
  const rowsId = useId();
  const [ram, setRam] = useState(12);
  const [millions, setMillions] = useState(2.27);

  const workingSet = millions * GB_PER_MILLION;
  const cache = ram * CACHE_FRACTION;
  const cached = Math.min(1, cache / workingSet);
  const readGb = millions * READ_GB_PER_MILLION;
  const missMb = readGb * (1 - cached) * 1024;
  const seconds = missMb / RANDOM_READ_MB_S;
  const killed = seconds > TIMEOUT_S;

  const preset = PRESETS.find((p) => p.ram === ram && p.millions === millions);

  const swatch = (active: boolean) => ({
    borderColor: active ? "var(--accent)" : "var(--border)",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    backgroundColor: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
  });

  return (
    <div
      className="post-embed my-10 rounded-xl border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Try it · working set vs RAM
      </p>
      <h4 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        When does a cold read stop finishing in eight seconds?
      </h4>
      <p className="mt-1 text-sm">
        Move the box, or grow the corpus. The 8s line is the `authenticator` role&apos;s
        statement timeout, and crossing it is what turns a slow search into an empty one.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setRam(p.ram);
              setMillions(p.millions);
            }}
            aria-pressed={preset?.label === p.label}
            className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
            style={swatch(preset?.label === p.label)}
          >
            {p.label}: {p.ram} GB
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={ramId}
            className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Box memory</span>
            <span style={{ color: "var(--text-secondary)" }}>{ram} GB</span>
          </label>
          <input
            id={ramId}
            type="range"
            min={8}
            max={32}
            step={4}
            value={ram}
            onChange={(e) => setRam(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent)]"
          />
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            Always Free stops at 4 OCPU / 24 GB.
          </p>
        </div>

        <div>
          <label
            htmlFor={rowsId}
            className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Rows in jobs</span>
            <span style={{ color: "var(--text-secondary)" }}>{millions.toFixed(2)}M</span>
          </label>
          <input
            id={rowsId}
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={millions}
            onChange={(e) => setMillions(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent)]"
          />
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            Ingest adds about 90k a day.
          </p>
        </div>
      </div>

      {/* Working set against what the box can hold. The overhang is the part
          that can never be cached, and it is the whole story. */}
      <div className="mt-5">
        <div
          className="relative h-8 overflow-hidden rounded-lg border"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-300"
            style={{
              width: `${Math.min(100, (cached * workingSet * 100) / Math.max(workingSet, cache))}%`,
              backgroundColor: "color-mix(in srgb, var(--accent) 22%, transparent)",
            }}
          />
          <div
            className="absolute inset-y-0 w-px"
            style={{
              left: `${Math.min(100, (cache * 100) / Math.max(workingSet, cache))}%`,
              backgroundColor: "var(--accent)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3">
            <span
              className="font-mono text-[11px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {(cached * 100).toFixed(0)}% cacheable
            </span>
            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              {workingSet.toFixed(1)} GB working set · {cache.toFixed(1)} GB of cache
            </span>
          </div>
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border p-4"
        style={{
          borderColor: killed
            ? "color-mix(in srgb, var(--danger) 40%, var(--border))"
            : "var(--border)",
          backgroundColor: "var(--surface-elevated)",
        }}
      >
        <p
          className="font-mono text-sm font-semibold"
          style={{ color: killed ? "var(--danger)" : "var(--accent)" }}
          aria-live="polite"
        >
          {killed
            ? `Killed at 8s. total: 0, db_error: true`
            : `Answers in about ${seconds.toFixed(1)}s`}
        </p>
        <p className="mt-1 text-sm">
          A broad search touches {(readGb * 1024).toFixed(0)} MB of pages. {missMb.toFixed(0)} MB of
          that is not in cache, and this disk does about {RANDOM_READ_MB_S} MB/s on the random reads
          an index walk makes, so the read wants {seconds.toFixed(1)}s.{" "}
          {killed
            ? "routes/search.py turns a killed read into an empty result set, which is why this reads as “search is broken” rather than “search is slow”."
            : "Under the timeout, so the reader gets rows."}
        </p>
        {preset && (
          <p
            className="mt-3 border-t pt-3 text-[13px]"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">Measured</span>
            <br />
            {preset.measured}
          </p>
        )}
      </div>

      <p className="mt-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
        Straight-line model through the two measured configurations above. Production has a query
        planner, so treat the seconds as a shape and the two presets as the facts.
      </p>
    </div>
  );
}
