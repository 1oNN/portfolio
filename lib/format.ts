/**
 * Shared formatting helpers.
 *
 * formatDate was previously written out five times across the admin dashboard,
 * the post page, the OG image route, the home writing list and the post card -
 * two of them byte-identical - so a change to how dates read meant finding all
 * five. slugify existed three times.
 */

export type DateStyle = "long" | "short" | "monthYear";

const DATE_STYLES: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  /** 7 August 2026 */
  long: { day: "numeric", month: "long", year: "numeric" },
  /** 7 Aug 2026 */
  short: { day: "numeric", month: "short", year: "numeric" },
  /** Aug 2026 */
  monthYear: { month: "short", year: "numeric" },
};

export function formatDate(iso: string, style: DateStyle = "long"): string {
  return new Date(iso).toLocaleDateString("en-GB", DATE_STYLES[style]);
}

/**
 * URL slug from a title. Note lib/markdown.ts keeps its own variant: that one
 * also de-duplicates against ids already used in the same document, which only
 * makes sense while parsing one.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
