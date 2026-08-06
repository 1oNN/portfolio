/**
 * Serialises a JSON-LD object for injection into a <script type="application/ld+json">.
 *
 * Replacing every "<" with its JSON unicode escape is the point: a raw
 * "</script>" appearing anywhere in
 * the serialised data would close the script element early and turn the rest of
 * the payload into live markup. Our JSON-LD is built from author-controlled
 * constants today, so this is defence in depth rather than a live hole - but the
 * escape costs nothing and removes the class of bug for good, including for any
 * future field that starts carrying post or project text.
 *
 * The escape is still a valid JSON string escape, so parsers read it back as "<".
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
