"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";

type FilterKey = "all" | "blog" | "case-study";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "blog", label: "Blog Posts" },
  { key: "case-study", label: "Case Studies" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
      className="card-glow"
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1 }}>
          {/* Type badge */}
          <span
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              fontFamily: "var(--font-mono)",
              backgroundColor: post.type === "case-study" ? "rgba(245,158,11,0.1)" : "var(--accent-muted)",
              color: post.type === "case-study" ? "#f59e0b" : "var(--accent)",
              border: `1px solid ${post.type === "case-study" ? "rgba(245,158,11,0.2)" : "var(--accent-muted)"}`,
            }}
          >
            {post.type === "case-study" ? "Case Study" : "Blog Post"}
          </span>

          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.35,
            }}
          >
            {post.title}
          </h2>
        </div>
      </div>

      {/* Excerpt */}
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {post.excerpt}
      </p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {post.tags.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border)",
          marginTop: "0.25rem",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {formatDate(post.createdAt)}
        </span>
        <Link
          href={`/blog/${post.slug}`}
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--accent)",
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          Read more →
        </Link>
      </div>
    </motion.article>
  );
}

export default function BlogListing({ posts }: { posts: BlogPost[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.type === filter);

  const counts: Record<FilterKey, number> = {
    all: posts.length,
    blog: posts.filter((p) => p.type === "blog").length,
    "case-study": posts.filter((p) => p.type === "case-study").length,
  };

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.5rem" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 500,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              transition: "all 0.2s",
              border: `1px solid ${filter === f.key ? "var(--accent)" : "var(--border)"}`,
              backgroundColor: filter === f.key ? "var(--accent)" : "var(--surface-elevated)",
              color: filter === f.key ? "#fff" : "var(--text-secondary)",
            }}
          >
            {f.label}
            <span style={{ marginLeft: "0.375rem", opacity: 0.65, fontSize: "0.75rem" }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "0.5rem" }}>
            Coming soon — check back soon!
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Posts will appear here once published.
          </p>
        </div>
      ) : (
        <motion.div layout style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
