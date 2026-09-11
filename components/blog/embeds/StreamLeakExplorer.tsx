"use client";

import { useState } from "react";

/**
 * The 250-stream cap, and the difference between running out and leaking.
 *
 * Saturation drains when traffic stops. A leak does not, and that distinction
 * is the whole diagnosis: it is why no amount of concurrency limiting would
 * have helped and why only a restart clears an already-wedged process.
 */

/** httpcore advertises 250 concurrent streams on one HTTP/2 connection. */
const CAP = 250;
/** The pool the HTTP/1.1 replacement is built with. */
const H1_CONNECTIONS = 64;

type Transport = "h2" | "h1";

interface State {
  inFlight: number;
  leaked: number;
  failures: number;
  log: string[];
}

const EMPTY: State = { inFlight: 0, leaked: 0, failures: 0, log: [] };

export default function StreamLeakExplorer() {
  const [transport, setTransport] = useState<Transport>("h2");
  const [state, setState] = useState<State>(EMPTY);

  const used = state.inFlight + state.leaked;
  const wedged = transport === "h2" && used >= CAP;

  const note = (log: string[], line: string) => [line, ...log].slice(0, 4);

  function send(n: number) {
    setState((s) => {
      if (transport === "h1") {
        // A request that outlives its connection costs that connection, not a
        // shared multiplex. Nothing here can fail.
        return {
          ...s,
          inFlight: Math.min(H1_CONNECTIONS, s.inFlight + n),
          log: note(s.log, `${n} requests over ${H1_CONNECTIONS} pooled connections, all answered`),
        };
      }
      const free = Math.max(0, CAP - s.inFlight - s.leaked);
      const accepted = Math.min(n, free);
      const rejected = n - accepted;
      return {
        inFlight: s.inFlight,
        // Driven from threads, streams were opened and never released. They
        // complete; the counter never comes back down.
        leaked: s.leaked + accepted,
        failures: s.failures + rejected,
        log: note(
          s.log,
          rejected > 0
            ? `httpcore.LocalProtocolError: Max outbound streams is 250, 250 open  ×${rejected}`
            : `${accepted} streams opened, ${accepted} never released`
        ),
      };
    });
  }

  function quiet() {
    setState((s) => ({
      ...s,
      inFlight: 0,
      log: note(
        s.log,
        transport === "h1"
          ? "Traffic stops. Every connection returns to the pool."
          : `Traffic stops. ${s.leaked} streams stay open. Streams in use drain; leaked streams do not.`
      ),
    }));
  }

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
        Try it · 250 outbound streams
      </p>
      <h4 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        Try to wedge it, then try to un-wedge it
      </h4>
      <p className="mt-1 text-sm">
        Send traffic until the pool fills. Then stop the traffic and watch which transport recovers.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(
          [
            ["h2", "HTTP/2, one multiplexed connection"],
            ["h1", "HTTP/1.1, 64 pooled connections"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTransport(key);
              setState(EMPTY);
            }}
            aria-pressed={transport === key}
            className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
            style={swatch(transport === key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 250 cells, one per stream. 25 across so the grid reads as a capacity
          bar you can count rather than a progress meter. */}
      <div
        className="mt-5 grid gap-[2px] rounded-lg border p-2"
        style={{
          gridTemplateColumns: "repeat(25, minmax(0, 1fr))",
          borderColor: "var(--border)",
          backgroundColor: "var(--surface-elevated)",
        }}
        aria-hidden="true"
      >
        {Array.from({ length: CAP }, (_, i) => {
          const isLeaked = i < state.leaked;
          const isBusy = !isLeaked && i < state.leaked + state.inFlight;
          return (
            <span
              key={i}
              className="aspect-square rounded-[1px] transition-colors duration-200"
              style={{
                backgroundColor: isLeaked
                  ? "var(--danger)"
                  : isBusy
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--text-muted) 18%, transparent)",
              }}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px]">
        <span style={{ color: "var(--danger)" }}>
          {state.leaked} leaked
        </span>
        <span style={{ color: "var(--accent)" }}>{state.inFlight} in flight</span>
        <span style={{ color: "var(--text-muted)" }}>
          {Math.max(0, CAP - used)} free
        </span>
        {state.failures > 0 && (
          <span style={{ color: "var(--danger)" }}>{state.failures} failed outright</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => send(40)}
          className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
          style={swatch(false)}
        >
          Send 40 requests
        </button>
        <button
          type="button"
          onClick={quiet}
          className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
          style={swatch(false)}
        >
          Traffic drops to zero
        </button>
        <button
          type="button"
          onClick={() => setState(EMPTY)}
          className="rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors"
          style={swatch(false)}
        >
          Restart the process
        </button>
      </div>

      <div
        className="mt-5 rounded-lg border p-4"
        style={{
          borderColor: wedged
            ? "color-mix(in srgb, var(--danger) 40%, var(--border))"
            : "var(--border)",
          backgroundColor: "var(--surface-elevated)",
        }}
      >
        <p
          className="font-mono text-sm font-semibold"
          style={{ color: wedged ? "var(--danger)" : "var(--accent)" }}
          aria-live="polite"
        >
          {wedged
            ? "Wedged. Every later request fails, permanently."
            : transport === "h1"
              ? "Healthy. This transport cannot reach the failure mode."
              : `${used} of ${CAP} streams open`}
        </p>
        {state.log.length > 0 && (
          <ul className="mt-2 space-y-1">
            {state.log.map((line, i) => (
              <li
                key={`${line}-${i}`}
                className="font-mono text-[11px]"
                style={{ color: i === 0 ? "var(--text-secondary)" : "var(--text-muted)" }}
              >
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
        Production ran this for nine hours: 1,665 failures, and still 8 in a 12-minute window while
        traffic was near zero. That last number is the one that says leak rather than saturation.
      </p>
    </div>
  );
}
