"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseChipParam, toggleChip } from "@/lib/listing-filter";

interface Options {
  /** Path the URL is written back to, e.g. "/blog". */
  basePath: string;
  /** Param the tab row reads and writes: "type" on /blog, "category" on /projects. */
  tabParam: string;
  /** Param the chip row reads and writes: "tag" on /blog, "tech" on /projects. */
  chipParam: string;
  /** Recognised tab keys. Anything else in the URL falls back to `all`. */
  tabKeys: readonly string[];
}

export interface ListingFilter {
  tab: string;
  query: string;
  chips: string[];
  /** True when anything at all is narrowing the list. */
  isFiltering: boolean;
  setTab: (key: string) => void;
  setQuery: (value: string) => void;
  toggle: (value: string) => void;
  clear: () => void;
  /** Real href for a tab, so the row stays crawlable and cmd-clickable. */
  hrefFor: (key: string) => string;
}

/**
 * Filter state for a listing page, with the URL as a mirror rather than the
 * source of truth.
 *
 * Filtering used to be a navigation: every click on the type row went through
 * the router, which is a round trip to redraw a list already sitting in memory.
 * State lives here instead and the URL is written with `history.replaceState`,
 * which Next documents as integrating with the router and syncing
 * `useSearchParams` without a reload. Deep links still work because the state is
 * seeded from the URL on mount.
 *
 * `replaceState` rather than `pushState` on purpose: twelve keystrokes in the
 * search box should not cost twelve presses of the back button to escape.
 */
export function useListingFilter({ basePath, tabParam, chipParam, tabKeys }: Options): ListingFilter {
  const searchParams = useSearchParams();

  // Seeded once. After mount this state leads and the URL follows, so reading
  // searchParams again here would fight the effect below.
  const [tab, setTabState] = useState(() => {
    const requested = searchParams.get(tabParam);
    return requested && tabKeys.includes(requested) ? requested : "all";
  });
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [chips, setChips] = useState(() => parseChipParam(searchParams.get(chipParam)));

  const isFiltering = tab !== "all" || query.trim() !== "" || chips.length > 0;

  const buildParams = useCallback(
    (next: { tab: string; query: string; chips: string[] }) => {
      const params = new URLSearchParams();
      if (next.tab !== "all") params.set(tabParam, next.tab);
      if (next.query.trim()) params.set("q", next.query.trim());
      if (next.chips.length > 0) params.set(chipParam, next.chips.join(","));
      return params.toString();
    },
    [tabParam, chipParam]
  );

  useEffect(() => {
    const qs = buildParams({ tab, query, chips });
    const url = qs ? `${basePath}?${qs}` : basePath;
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", url);
    }
  }, [basePath, buildParams, tab, query, chips]);

  const setTab = useCallback(
    (key: string) => setTabState(tabKeys.includes(key) ? key : "all"),
    [tabKeys]
  );

  const toggle = useCallback((value: string) => setChips((c) => toggleChip(c, value)), []);

  const clear = useCallback(() => {
    setTabState("all");
    setQuery("");
    setChips([]);
  }, []);

  // The tab row keeps real hrefs: the filter is instant for anyone with JS, and
  // still a working link for a crawler, a middle click or a reader without it.
  const hrefFor = useCallback(
    (key: string) => {
      const qs = buildParams({ tab: key, query, chips });
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [basePath, buildParams, query, chips]
  );

  return useMemo(
    () => ({ tab, query, chips, isFiltering, setTab, setQuery, toggle, clear, hrefFor }),
    [tab, query, chips, isFiltering, setTab, toggle, clear, hrefFor]
  );
}
