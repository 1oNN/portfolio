"use client";

import { useEffect, useState, type MouseEvent } from "react";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
  // No "agent" entry: the in-page chat section was removed in favour of the
  // rail's Chat with me button, which opens the same agent as a console.
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
] as const;

/**
 * Desktop-only section nav for the home left rail. The only client code the
 * two-column home adds: an IntersectionObserver toggling the active section
 * (ported from the deleted Header) - the indicator itself is pure CSS.
 */
export default function RailNav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    // Modified clicks (new tab, etc.) keep native behavior.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    // A behavior passed here overrides the CSS property, so the global
    // reduced-motion rule in globals.css cannot reach this one.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav className="hidden lg:block" aria-label="Section navigation">
      <ul className="space-y-2.5">
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => handleClick(e, id)}
                className="group flex items-center gap-4 py-1"
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  aria-hidden="true"
                  className={`h-px transition-all duration-200 ${
                    isActive
                      ? "w-16 bg-[var(--accent)]"
                      : "w-8 bg-[var(--text-muted)] group-hover:w-16 group-hover:bg-[var(--text-primary)] group-focus-visible:w-16 group-focus-visible:bg-[var(--text-primary)]"
                  }`}
                />
                <span
                  className={`font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors duration-200 ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-focus-visible:text-[var(--text-primary)]"
                  }`}
                >
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
