"use client";

import { useEffect, useRef, useState } from "react";
import type { MarkdownHeading } from "@/lib/markdown";

/**
 * Sticky article outline with scroll-spy (desktop only - hidden by the parent
 * below lg). Links are plain anchors: the jump works without JavaScript and
 * respects reduced-motion by default; this component only tracks which
 * heading is currently active, mirroring the RailNav pattern on home.
 */
export default function TableOfContents({ headings }: { headings: MarkdownHeading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);
  const ticking = useRef(false);

  useEffect(() => {
    const ids = headings.map((h) => h.id);

    const update = () => {
      ticking.current = false;
      let current: string | null = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        // 96px ≈ sticky header + breathing room (matches scroll-margin-top)
        if (el.getBoundingClientRect().top <= 96) current = id;
        else break;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        On this page
      </div>
      <ul className="mt-4 space-y-2.5 border-l border-[var(--border)]">
        {headings.map((h) => {
          const isActive = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "true" : undefined}
                className={
                  "-ml-px block border-l-2 text-[13px] leading-snug transition-colors " +
                  (h.level === 3 ? "py-0.5 pl-7 " : "py-0.5 pl-4 ") +
                  (isActive
                    ? "border-[var(--accent)] font-medium text-[var(--text-primary)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]")
                }
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
