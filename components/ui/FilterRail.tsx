"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { FiSearch, FiX } from "react-icons/fi";
import type { ChipCount } from "@/lib/listing-filter";
import type { ListingFilter } from "@/hooks/useListingFilter";

export interface FilterTab {
  key: string;
  label: string;
  count: number;
}

interface Props {
  filter: ListingFilter;
  tabs: FilterTab[];
  /** aria-label for the tab row, e.g. "Filter posts by type". */
  tabsLabel: string;
  chips: ChipCount[];
  /** Heading above the chip row, e.g. "Tags". */
  chipsLabel: string;
  searchPlaceholder: string;
  resultCount: number;
  totalCount: number;
  /** [singular, plural], e.g. ["post", "posts"]. */
  noun: [string, string];
}

/** Chips past this stay folded, unless they are selected. */
const CHIP_LIMIT = 8;

/**
 * The filter row for /blog and /projects: type tabs, a search box, and chips.
 *
 * Presentational only. State and the URL live in `useListingFilter`, so this
 * renders the same on both pages and the two listings cannot drift apart the
 * way their duplicated filter navs previously did.
 */
export default function FilterRail({
  filter,
  tabs,
  tabsLabel,
  chips,
  chipsLabel,
  searchPlaceholder,
  resultCount,
  totalCount,
  noun,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);

  // "/" focuses search, the shortcut every search field on the web has. Guarded
  // so it does not steal the key from anyone actually typing a slash.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName ?? "")) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visibleChips = expanded
    ? chips
    : chips.filter((c, i) => i < CHIP_LIMIT || filter.chips.includes(c.value));
  const folded = chips.length - visibleChips.length;

  const chipStyle = (active: boolean) => ({
    borderColor: active ? "var(--accent)" : "var(--border)",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    backgroundColor: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
  });

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 border-y border-[var(--border)] py-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-x-7 gap-y-2" aria-label={tabsLabel}>
          {tabs.map((t) => {
            const isActive = filter.tab === t.key;
            return (
              <Link
                key={t.key}
                href={filter.hrefFor(t.key)}
                aria-current={isActive ? "true" : undefined}
                // Plain left clicks filter in place; modified clicks and middle
                // clicks fall through to the anchor and open a real URL.
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  filter.setTab(t.key);
                }}
                className={
                  isActive
                    ? "group relative inline-flex items-baseline gap-1.5 text-sm text-[var(--text-primary)] transition-colors"
                    : "group relative inline-flex items-baseline gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                }
              >
                <span
                  className={
                    isActive
                      ? "font-semibold underline decoration-2 decoration-[var(--accent)] underline-offset-[6px]"
                      : "underline decoration-2 decoration-transparent underline-offset-[6px] transition-colors group-hover:decoration-[var(--text-secondary)] group-focus-visible:decoration-[var(--text-secondary)]"
                  }
                >
                  {t.label}
                </span>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">{t.count}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative sm:w-64">
          <label htmlFor={inputId} className="sr-only">
            {searchPlaceholder}
          </label>
          <FiSearch
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            id={inputId}
            ref={inputRef}
            type="search"
            value={filter.query}
            placeholder={searchPlaceholder}
            onChange={(e) => filter.setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Escape") return;
              // Escape clears a non-empty box, then gets out of the way, so a
              // second press still reaches anything listening above.
              if (filter.query) {
                e.stopPropagation();
                filter.setQuery("");
              } else {
                inputRef.current?.blur();
              }
            }}
            className="w-full rounded-lg border py-1.5 pl-9 pr-9 text-sm text-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)] [&::-webkit-search-cancel-button]:appearance-none"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
          />
          {filter.query ? (
            <button
              type="button"
              onClick={() => {
                filter.setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <FiX size={14} />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border px-1.5 font-mono text-[10px] text-[var(--text-muted)] sm:block"
              style={{ borderColor: "var(--border)" }}
            >
              /
            </kbd>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            {chipsLabel}
          </span>
          {visibleChips.map((c) => {
            const active = filter.chips.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => filter.toggle(c.value)}
                aria-pressed={active}
                // A count of zero means clicking it empties the list, so say so
                // rather than letting the reader find out.
                disabled={c.count === 0 && !active}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors disabled:opacity-40"
                style={chipStyle(active)}
              >
                {c.value}
                <span className="text-[10px] opacity-70">{c.count}</span>
              </button>
            );
          })}
          {folded > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="rounded-full px-2 py-1 font-mono text-[11px] text-[var(--text-muted)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
            >
              +{folded} more
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <p className="font-mono text-[11px] text-[var(--text-muted)]" aria-live="polite">
          {resultCount === totalCount
            ? `${totalCount} ${totalCount === 1 ? noun[0] : noun[1]}`
            : `${resultCount} of ${totalCount} ${noun[1]}`}
        </p>
        {filter.isFiltering && (
          <button
            type="button"
            onClick={filter.clear}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-muted)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
          >
            <FiX size={11} aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
