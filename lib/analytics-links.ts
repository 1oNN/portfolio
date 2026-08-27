import { MAX_TARGET_LENGTH, type LinkKind } from "./analytics-events";

/**
 * Classifies an anchor's href into one of the tracked link kinds.
 *
 * Pure and DOM-free so it can be unit tested without jsdom, which this repo
 * does not configure. The caller reads the href and the download attribute off
 * the element and passes them in.
 */

export interface ClassifiedLink {
  kind: LinkKind;
  target: string;
}

/**
 * Schemes that are never recorded. javascript: and data: are script vectors
 * that say nothing about intent, and blob: URLs are per-session identifiers
 * that would blow up target cardinality for no signal.
 */
const IGNORED_SCHEMES = new Set(["javascript:", "data:", "vbscript:", "blob:", "about:"]);

function cap(value: string): string {
  return value.length > MAX_TARGET_LENGTH ? value.slice(0, MAX_TARGET_LENGTH) : value;
}

/**
 * Drops every character at or below space, plus DEL.
 *
 * A browser ignores tabs and newlines inside a scheme, so a tab spliced into
 * the middle of "javascript:" still runs when the anchor is clicked, while a
 * naive check on the raw string sees a scheme it does not recognise and lets
 * it through. Normalising first means the denylist sees what the browser sees.
 * Written as a charCode filter rather than a regex so no control character has
 * to appear in this file.
 */
function stripControls(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 0x20 && code !== 0x7f) out += value[i];
  }
  return out;
}

export function classifyLink(
  rawHref: string | null | undefined,
  current: { origin: string; pathname: string },
  isDownload: boolean
): ClassifiedLink | null {
  if (!rawHref) return null;

  const href = stripControls(rawHref);
  if (!href) return null;

  if (href.startsWith("#")) {
    return { kind: "anchor", target: cap(href) };
  }

  let url: URL;
  try {
    // Protocol-relative and root-relative hrefs both need the base to resolve.
    // A throw means the href is malformed, and recording nothing beats
    // recording a garbage target.
    url = new URL(href, current.origin + current.pathname);
  } catch {
    return null;
  }

  const protocol = url.protocol.toLowerCase();

  if (IGNORED_SCHEMES.has(protocol)) return null;

  if (protocol === "mailto:") {
    return { kind: "mailto", target: cap(url.pathname) };
  }

  if (protocol !== "http:" && protocol !== "https:") {
    // tel:, sms: and similar. The scheme alone is the whole signal; the number
    // is somebody's contact detail and is not recorded.
    return { kind: "external", target: protocol.replace(":", "") };
  }

  if (url.origin !== current.origin) {
    // Query and hash are dropped. A query string on someone else's link can
    // carry anything, including a token, and it is not ours to store.
    const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
    return { kind: "external", target: cap(url.hostname + path) };
  }

  if (isDownload || url.pathname.startsWith("/cv/")) {
    return { kind: "cv-download", target: cap(url.pathname) };
  }

  if (url.pathname === current.pathname && url.hash) {
    return { kind: "anchor", target: cap(url.hash) };
  }

  return { kind: "internal", target: cap(url.pathname) };
}
