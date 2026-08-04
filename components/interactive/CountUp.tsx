"use client";

import { useEffect, useRef, useState } from "react";

// Splits a display value like "2,100+", "93.15%", "0.82", "253K" into
// prefix / numeric core / suffix so the number can animate while the
// decoration stays put. Non-numeric values ("SSE") render unchanged.
const NUM_RE = /^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/;

function formatNumber(n: number, decimals: number, grouped: boolean): string {
  const fixed = n.toFixed(decimals);
  if (!grouped) return fixed;
  const [int, frac] = fixed.split(".");
  const groupedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${groupedInt}.${frac}` : groupedInt;
}

/**
 * Counts the numeric part of `value` up from zero the first time it scrolls
 * into view. Server HTML and no-JS clients always show the final value; a
 * sr-only copy keeps the announced text stable while the visible one ticks.
 */
export default function CountUp({
  value,
  duration = 1200,
}: {
  value: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const match = NUM_RE.exec(value);
    if (!el || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const grouped = num.includes(",");

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(`${prefix}${formatNumber(target * eased, decimals, grouped)}${suffix}`);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
