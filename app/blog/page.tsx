import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog-db";
import BlogListing from "./BlogListing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Case Studies | Hammad Ahmad",
  description: "Thoughts, write-ups, and case studies on AI/ML engineering and research.",
};

export default async function BlogPage() {
  const posts = await getAllPosts(true);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
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
            ← Back to home
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

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Page heading */}
        <div style={{ marginBottom: "3rem" }}>
          <span
            style={{
              display: "inline-block",
              marginBottom: "0.75rem",
              padding: "0.25rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: "var(--font-mono)",
              backgroundColor: "var(--accent-muted)",
              color: "var(--accent)",
              border: "1px solid var(--accent-muted)",
            }}
          >
            Writing
          </span>
          <h1
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              lineHeight: 1.15,
              marginBottom: "0.875rem",
            }}
          >
            Blog &amp; Case Studies
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: "540px" }}>
            Write-ups on AI/ML engineering, research discoveries, and deep-dives into
            projects I&apos;ve built.
          </p>
        </div>

        <BlogListing posts={posts} />
      </main>
    </div>
  );
}
