import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.dev";
  return {
    title: `${post.title} | Hammad Ahmad`,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.dev";
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

      {/* Top bar */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            ← Blog
          </Link>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
          </span>
        </div>
      </header>

      <main id="main" style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Meta */}
        <div style={{ marginBottom: "2.5rem" }}>
          {/* Type badge */}
          <span
            style={{
              display: "inline-flex",
              marginBottom: "1rem",
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              fontFamily: "var(--font-mono)",
              backgroundColor: post.type === "case-study" ? "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" : "var(--accent-muted)",
              color: post.type === "case-study" ? "var(--accent-secondary)" : "var(--accent)",
              border: `1px solid ${post.type === "case-study" ? "color-mix(in srgb, var(--accent-secondary) 20%, transparent)" : "var(--accent-muted)"}`,
            }}
          >
            {post.type === "case-study" ? "Case Study" : "Blog Post"}
          </span>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            {post.title}
          </h1>

          {/* Date + reading time + tags */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {formatDate(post.createdAt)}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>·</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {mins} min read
            </span>
            {post.tags.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "2.5rem" }} />

        {/* Content */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </main>
    </div>
  );
}
