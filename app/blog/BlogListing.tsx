"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import { readingTime } from "@/lib/reading-time";

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
  const mins = readingTime(post.content);
  const isCaseStudy = post.type === "case-study";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="card-glow group rounded-2xl border p-6 flex flex-col gap-3 transition-all duration-200"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <span
            className="inline-flex self-start text-[0.7rem] font-semibold px-2.5 py-1 rounded-full font-mono"
            style={{
              backgroundColor: isCaseStudy ? "color-mix(in srgb, var(--accent-secondary) 10%, transparent)" : "var(--accent-muted)",
              color: isCaseStudy ? "var(--accent-secondary)" : "var(--accent)",
              border: `1px solid ${isCaseStudy ? "color-mix(in srgb, var(--accent-secondary) 20%, transparent)" : "var(--accent-muted)"}`,
            }}
          >
            {isCaseStudy ? "Case Study" : "Blog Post"}
          </span>
          <h2 className="text-lg font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
            {post.title}
          </h2>
        </div>
      </div>

      {/* Excerpt */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {post.excerpt}
      </p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 mt-1 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>{formatDate(post.createdAt)}</span>
          <span>·</span>
          <span>{mins} min read</span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="text-xs font-semibold font-mono inline-flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: "var(--accent)" }}
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
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium font-mono transition-all duration-200"
            style={{
              border: `1px solid ${filter === f.key ? "var(--accent)" : "var(--border)"}`,
              backgroundColor: filter === f.key ? "var(--accent)" : "var(--surface-elevated)",
              color: filter === f.key ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {f.label}
            <span className="ml-1.5 opacity-65 text-xs">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl border"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>
            Coming soon — check back soon!
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Posts will appear here once published.
          </p>
        </div>
      ) : (
        <motion.div layout className="flex flex-col gap-5">
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
