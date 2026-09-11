"use client";

import { useId, useState } from "react";

/**
 * The lean-band guard, and the ratio it reads.
 *
 * `--stop-below` compares hit against DECIDED. A band where almost nothing got
 * decided therefore scores well on the few answers it did get, so the guard
 * built to stop a lean run reads a starved one as healthy. Both ratios are on
 * screen here, which is the whole argument.
 */

const BAND = 500;
/** A name is decided only once all six endpoints answer, or one hits. */
const HOSTS = 6;
/** Names in ats_candidates that have never been probed. */
const REMAINING = 27_652;
/** `--stop-below 15`, as a percentage. */
const GUARD = 15;

// Measured on 2026-08-25: band 1, 500 names, 30.4 minutes, 30 decided, 6 boards,
// with workable and recruitee throttling. Every constant below is derived from
// that one band so the default state of this widget is the real one.
const MEASURED_DECIDED = 30;
const MEASURED_THROTTLED = 2;
const MEASURED_MINUTES = 30.4;
const QUIET_MINUTES = 8;
const DRAG = (BAND / MEASURED_DECIDED - 1) / MEASURED_THROTTLED;
const MINUTES_PER_HOST = (MEASURED_MINUTES - QUIET_MINUTES) / MEASURED_THROTTLED;

export default function BandYieldExplorer() {
  const throttledId = useId();
  const rateId = useId();
  const [throttled, setThrottled] = useState(MEASURED_THROTTLED);
  const [rate, setRate] = useState(20);

  const decided = Math.max(1, Math.round(BAND / (1 + DRAG * throttled)));
  const incomplete = BAND - decided;
  const boards = Math.round((decided * rate) / 100);
  const minutes = QUIET_MINUTES + MINUTES_PER_HOST * throttled;

  const perDecided = (boards / decided) * 100;
  const perProbed = (boards / BAND) * 100;
  const guardFires = perDecided < GUARD;
  const wouldFire = perProbed < GUARD;

  const hours = (REMAINING / decided) * (minutes / 60);

  const stat = (label: string, value: string, tone?: string) => (
    <div>
      <p
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 font-mono text-lg font-bold leading-none"
        style={{ color: tone ?? "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <div
      className="post-embed my-10 rounded-xl border p-5 sm:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
    >
      <p
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Try it · band yield
      </p>
      <h4 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        Find a band the guard stops
      </h4>
      <p className="mt-1 text-sm">
        Six endpoints decide a name. Set how many of them throttle, and watch the two ways of
        scoring the band come apart.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={throttledId}
            className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Hosts that throttle</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {throttled} of {HOSTS}
            </span>
          </label>
          <input
            id={throttledId}
            type="range"
            min={0}
            max={HOSTS}
            step={1}
            value={throttled}
            onChange={(e) => setThrottled(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent)]"
          />
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            Measured: two. Workable 429&apos;d 41 times and recruitee 10, inside 13 minutes.
          </p>
        </div>

        <div>
          <label
            htmlFor={rateId}
            className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Boards per decided name</span>
            <span style={{ color: "var(--text-secondary)" }}>{rate}%</span>
          </label>
          <input
            id={rateId}
            type="range"
            min={0}
            max={50}
            step={1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent)]"
          />
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
            Measured: 20.0%, which is 6 boards out of 30 answers.
          </p>
        </div>
      </div>

      {/* 500 names, one cell each. The block of undecided is the finding. */}
      <div
        className="mt-5 grid gap-[2px] rounded-lg border p-2"
        style={{
          gridTemplateColumns: "repeat(50, minmax(0, 1fr))",
          borderColor: "var(--border)",
          backgroundColor: "var(--surface-elevated)",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: BAND }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-[1px] transition-colors duration-200"
            style={{
              backgroundColor:
                i < boards
                  ? "var(--accent)"
                  : i < decided
                    ? "color-mix(in srgb, var(--accent) 40%, transparent)"
                    : "color-mix(in srgb, var(--text-muted) 18%, transparent)",
            }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stat("Decided", `${decided}`)}
        {stat("Incomplete", `${incomplete}`, "var(--text-muted)")}
        {stat("Boards found", `${boards}`, "var(--accent)")}
        {stat("Band time", `${minutes.toFixed(1)}m`)}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 35%, var(--border))",
            backgroundColor: "var(--surface-elevated)",
          }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            hit / decided · what the guard reads
          </p>
          <p
            className="mt-1 font-mono text-2xl font-bold leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {perDecided.toFixed(1)}%
          </p>
          <p className="mt-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {guardFires
              ? `Below ${GUARD}%. The run stops after three bands like this.`
              : `Above ${GUARD}%. The run continues.`}
          </p>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
        >
          <p
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            hit / probed · what it should read
          </p>
          <p
            className="mt-1 font-mono text-2xl font-bold leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {perProbed.toFixed(1)}%
          </p>
          <p className="mt-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
            {wouldFire
              ? `Below ${GUARD}%. On this ratio the run would already have stopped.`
              : `Above ${GUARD}%. Both ratios agree here.`}
          </p>
        </div>
      </div>

      <div
        className="mt-3 rounded-lg border p-4"
        style={{
          borderColor:
            hours > 100
              ? "color-mix(in srgb, var(--danger) 40%, var(--border))"
              : "var(--border)",
          backgroundColor: "var(--surface-elevated)",
        }}
      >
        <p
          className="font-mono text-sm font-semibold"
          style={{ color: hours > 100 ? "var(--danger)" : "var(--accent)" }}
          aria-live="polite"
        >
          {REMAINING.toLocaleString()} names left · {Math.round(hours).toLocaleString()} hours (
          {(hours / 24).toFixed(1)} days)
        </p>
        <p className="mt-1 text-sm">
          {guardFires && wouldFire
            ? "Both ratios stop this run, which is the only case where the guard does its job for the right reason."
            : guardFires
              ? "The guard fires because the hit rate genuinely fell, not because the band was starved."
              : wouldFire
                ? "The band is starved, the guard scores it healthy, and nothing stops it. This is the defect."
                : "A band with nothing wrong with it."}
        </p>
      </div>
    </div>
  );
}
