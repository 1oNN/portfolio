import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { getAllPosts } from "@/lib/blog-db";
import { toJsonLd } from "@/lib/json-ld";
import { pageOpenGraph, SITE_URL } from "@/lib/metadata";
import { readingTime } from "@/lib/reading-time";
import BlogList from "@/components/blog/BlogList";
import type { PostCardView } from "@/components/blog/PostCard";
import Footer from "@/components/layout/Footer";
import AnalyticsBeacon from "@/components/interactive/AnalyticsBeacon";

export const revalidate = 60;

const PAGE_TITLE = "Writing & notes";
const PAGE_DESCRIPTION =
  "Notes and case studies on AI/ML engineering, research, and the systems I build.";

export const metadata: Metadata = {
  title: "Writing",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: pageOpenGraph({
    path: "/blog",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  }),
};

// No searchParams here on purpose. Reading them made this segment dynamic,
// which silently killed the `revalidate` above and put a full DynamoDB scan on
// every request. The ?type= filter now lives in BlogList, a client leaf.
export default async function BlogPage() {
  const posts = await getAllPosts(true);

  // Reading time is derived here so the post bodies stay on the server; the
  // client only ever receives what a card renders.
  const cards: PostCardView[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    type: post.type,
    tags: post.tags,
    createdAt: post.createdAt,
    mins: readingTime(post.content),
  }));

  // Always the unfiltered list: the canonical for every ?type= variant is
  // /blog, so the structured data has to describe the canonical page, not the
  // filtered view the visitor happens to be looking at.
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/blog`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: post.title,
        description: post.excerpt,
        url: `${SITE_URL}/blog/${post.slug}`,
      })),
    },
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(collectionLd) }}
      />
      <AnalyticsBeacon page="/blog" />
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
          >
            <FiArrowLeft size={15} />
            Back to home
          </Link>
          <Link
            href="/"
            aria-label="Back to home"
            className="font-mono text-sm font-bold text-[var(--accent)] transition-opacity hover:opacity-75 focus-visible:opacity-75"
          >
            ha<span className="text-[var(--accent-secondary)]">.</span>
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        {/* Page title */}
        <div className="space-y-4">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            ✦ Writing
          </span>
          <h1 className="font-display text-[clamp(3rem,2rem+3.5vw,5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[var(--text-primary)]">
            Writing &amp; notes
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            Notes on AI/ML engineering and research, plus deep dives into how specific systems were
            built.
          </p>
        </div>

        {/* Suspense is what lets useSearchParams live below a static page */}
        <Suspense
          fallback={
            <div className="mt-12 h-[4.5rem] border-y border-[var(--border)]" aria-hidden="true" />
          }
        >
          <BlogList posts={cards} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
