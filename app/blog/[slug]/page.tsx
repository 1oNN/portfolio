import { toJsonLd } from "@/lib/json-ld";
import { AUTHOR_NAME, pageOpenGraph, SITE_URL } from "@/lib/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiArrowUp } from "react-icons/fi";
import { getAllPosts, getPostBySlug } from "@/lib/blog-db";
import { parseMarkdownDoc } from "@/lib/markdown";
import { readingTime } from "@/lib/reading-time";
import TableOfContents from "@/components/blog/TableOfContents";
import CopyLink from "@/components/blog/CopyLink";
import Footer from "@/components/layout/Footer";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // An unknown or unpublished slug 404s in the body, but metadata is resolved
  // first and would otherwise inherit robots.index from the root.
  if (!post || !post.published) return { title: "Post Not Found", robots: { index: false } };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: pageOpenGraph({
      path: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      image: "route",
      article: {
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        tags: post.tags,
      },
    }),
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) notFound();

  const { html: contentHtml, headings } = parseMarkdownDoc(post.content);
  const mins = readingTime(post.content);
  const isDeepDive = post.type === "case-study";
  const typeColor = isDeepDive ? "var(--accent-secondary)" : "var(--accent)";

  // Prev/next within the published list (newest first)
  const posts = await getAllPosts(true);
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;

  const siteUrl = SITE_URL;
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: AUTHOR_NAME, url: siteUrl },
    publisher: { "@type": "Person", name: AUTHOR_NAME, url: siteUrl },
    // The route's own dynamic OG image, so the article carries the same
    // artwork in search results that it does in a social unfurl.
    image: `${canonicalUrl}/opengraph-image`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
    keywords: post.tags.join(", "),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Writing", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbLd) }}
      />

      {/* Scroll-driven reading progress (CSS-only; hidden where unsupported) */}
      <div className="reading-progress" aria-hidden="true" />

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
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
          >
            <FiArrowLeft size={15} />
            All writing
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
        {/* Article header */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest"
              style={{
                color: typeColor,
                backgroundColor: `color-mix(in srgb, ${typeColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${typeColor} 25%, transparent)`,
              }}
            >
              {isDeepDive ? "Deep dive" : "Post"}
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {formatDate(post.createdAt)} · {mins} min read
            </span>
            <CopyLink url={`${siteUrl}/blog/${post.slug}`} />
          </div>

          <h1 className="font-display text-[clamp(2.75rem,2rem+2.6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--text-primary)]">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
                  style={{ backgroundColor: "var(--surface-elevated)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-[var(--border)]" />

        {/* Content + sticky outline */}
        <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-14">
          <div
            className="blog-content max-w-3xl"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
          {headings.length >= 2 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>

        {/* Footer nav: older/newer posts + back to top */}
        <div className="mt-16 max-w-3xl border-t border-[var(--border)] pt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {older ? (
              <Link
                href={`/blog/${older.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--text-secondary)] focus-visible:border-[var(--text-secondary)]"
              >
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  <FiArrowLeft size={11} />
                  Older
                </span>
                <span className="mt-2 block text-sm font-medium leading-snug text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] group-focus-visible:text-[var(--text-primary)]">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {newer && (
              <Link
                href={`/blog/${newer.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-right transition-colors hover:border-[var(--text-secondary)] focus-visible:border-[var(--text-secondary)]"
              >
                <span className="flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                  Newer
                  <FiArrowRight size={11} />
                </span>
                <span className="mt-2 block text-sm font-medium leading-snug text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)] group-focus-visible:text-[var(--text-primary)]">
                  {newer.title}
                </span>
              </Link>
            )}
          </div>
          <div className="mt-8 flex justify-center">
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
            >
              <FiArrowUp size={12} />
              Back to top
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
