/**
 * Interactive embeds inside post bodies.
 *
 * A post body is one string of markdown that goes through the sanitizer, so it
 * can never carry a component. Instead an author writes a marker on its own
 * line:
 *
 *     [[embed:dedupe-key]]
 *
 * The sanitizer has no rule for double brackets, so the marker survives as a
 * literal `<p>[[embed:id]]</p>` (see markdown.test.ts for what it does escape).
 * This splits the parsed HTML on those paragraphs so the page can render a real
 * component between two blocks of prose.
 *
 * Splitting after the parse rather than before is deliberate: the outline ids
 * come from one `usedIds` set per parse, and parsing each chunk separately
 * would let two chunks mint the same slug.
 */

const EMBED_PARAGRAPH = /<p>\[\[embed:([a-z0-9-]+)\]\]<\/p>\n?/g;

export type PostSegment =
  | { kind: "html"; html: string }
  | { kind: "embed"; id: string };

export function splitPostEmbeds(html: string): PostSegment[] {
  const segments: PostSegment[] = [];
  let cursor = 0;

  for (const match of html.matchAll(EMBED_PARAGRAPH)) {
    const at = match.index ?? 0;
    if (at > cursor) segments.push({ kind: "html", html: html.slice(cursor, at) });
    segments.push({ kind: "embed", id: match[1] });
    cursor = at + match[0].length;
  }

  if (cursor < html.length) segments.push({ kind: "html", html: html.slice(cursor) });
  // A post with no markers still has to render, so never return an empty list.
  return segments.length > 0 ? segments : [{ kind: "html", html }];
}
