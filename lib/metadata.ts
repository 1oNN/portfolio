import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk";
export const SITE_NAME = "Hammad Ahmad";
export const AUTHOR_NAME = "Hammad Ahmad";
export const SITE_TITLE = "Hammad Ahmad - AI/ML Engineer & Researcher";
export const SITE_DESCRIPTION =
  "AI/ML Engineer working on graph-augmented retrieval, LLM evaluation, and latency optimisation. MSc Artificial Intelligence (Merit), University of Bradford.";

const SITE_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Hammad Ahmad - AI/ML Engineer & Researcher",
};

interface OpenGraphInput {
  /** Route path with a leading slash, e.g. "/blog" or "/projects/jobzyl". */
  path: string;
  title: string;
  description: string;
  /**
   * "site" uses the static /og.png. "route" omits images entirely so Next's
   * file convention can inject the segment's own opengraph-image.tsx - setting
   * images here would suppress that injection.
   */
  image?: "site" | "route";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
  };
}

/**
 * Builds a COMPLETE openGraph block for a page.
 *
 * App Router merges metadata one key deep: a page that sets `openGraph` replaces
 * the root object wholesale rather than merging into it. Every page that wants
 * its own og:url or og:type therefore has to restate type, locale and siteName
 * too, or it silently ships without them. This is that restatement, in one
 * place, so the five public routes cannot drift apart.
 */
export function pageOpenGraph({
  path,
  title,
  description,
  image = "site",
  article,
}: OpenGraphInput): Metadata["openGraph"] {
  const shared = {
    locale: "en_GB",
    siteName: SITE_NAME,
    url: `${SITE_URL}${path}`,
    title,
    description,
    ...(image === "site" ? { images: [SITE_IMAGE] } : {}),
  };

  if (article) {
    return {
      ...shared,
      type: "article" as const,
      authors: [AUTHOR_NAME],
      ...article,
    };
  }

  return { ...shared, type: "website" as const };
}
