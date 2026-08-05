import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { getPostBySlug } from "@/lib/blog-db";
import { parseMarkdown } from "@/lib/markdown";
import { readingTime } from "@/lib/reading-time";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) return { title: "Post Not Found" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk";
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
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

  const contentHtml = parseMarkdown(post.content);
  const mins = readingTime(post.content);
  const isDeepDive = post.type === "case-study";
  const typeColor = isDeepDive ? "var(--accent-secondary)" : "var(--accent)";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: "Hammad Ahmad", url: siteUrl },
    url: `${siteUrl}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

        {/* Content */}
        <div
          className="blog-content mt-10 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </main>
    </div>
  );
}
