/**
 * Matching rules shared by the /blog and /projects listings.
 *
 * Kept free of React and of any `@/` import on purpose: the vitest setup has no
 * config and so no path alias, and these are the parts worth pinning with tests
 * rather than clicking through in a browser.
 */

/** Lowercase, accent-fold, collapse whitespace. */
export function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Every whitespace-separated term must appear somewhere in the haystack.
 *
 * AND rather than OR, and substring rather than word-boundary: "post grad"
 * should not match a post about PostgreSQL, but typing "postg" while still
 * mid-word should. An empty query matches everything, which is what makes the
 * search box additive to the other filters rather than a mode.
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const terms = fold(query).split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  const target = fold(haystack);
  return terms.every((term) => target.includes(term));
}

/** Add or remove one chip, preserving selection order so the URL is stable. */
export function toggleChip(selected: readonly string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value];
}

/**
 * Every selected chip must be present. AND, not OR: a reader who has clicked
 * both PostgreSQL and AsyncIO is asking for the overlap, and OR would hand back
 * a longer list than they started with, which reads as a broken filter.
 */
export function matchesChips(values: readonly string[], selected: readonly string[]): boolean {
  if (selected.length === 0) return true;
  const present = new Set(values.map(fold));
  return selected.every((chip) => present.has(fold(chip)));
}

export interface ChipCount {
  value: string;
  count: number;
}

/**
 * The chip row, ordered by how many items carry each value and then
 * alphabetically so the tail does not reshuffle on every keystroke.
 *
 * Counts are computed against the items that survive every OTHER filter, which
 * is the same rule the facet counts in the Jobzyl post argue for: a count has to
 * answer "what am I left with if I click this", or it is decoration.
 */
export function chipCounts(itemValues: readonly (readonly string[])[]): ChipCount[] {
  const counts = new Map<string, { label: string; n: number }>();
  for (const values of itemValues) {
    // A single item carrying the same tag twice must not count twice.
    for (const value of new Set(values.map(fold))) {
      const label = values.find((v) => fold(v) === value) ?? value;
      const entry = counts.get(value);
      if (entry) entry.n += 1;
      else counts.set(value, { label, n: 1 });
    }
  }
  return [...counts.values()]
    .map(({ label, n }) => ({ value: label, count: n }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Read a repeated or comma-joined query param back into a chip selection. */
export function parseChipParam(raw: string | null): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((v) => v.trim()).filter(Boolean))];
}
