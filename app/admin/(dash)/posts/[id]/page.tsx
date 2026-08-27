"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import PostEditor, { type PostEditorValues } from "@/components/admin/PostEditor";
import type { BlogPost } from "@/types";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [initial, setInitial] = useState<PostEditorValues | null>(null);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/blog/${id}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const post: BlogPost = await res.json();
        setInitial({
          title: post.title,
          slug: post.slug,
          type: post.type,
          tags: post.tags.join(", "),
          excerpt: post.excerpt,
          content: post.content,
          published: post.published,
        });
      } catch {
        // A dropped connection is not a missing post. Reporting it as "not
        // found" told the author their post had been deleted.
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (notFound || loadFailed || !initial) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", backgroundColor: "var(--background)" }}>
        <p style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {loadFailed ? "Could not load this post. Check your connection and try again." : "Post not found."}
        </p>
        <Link href="/admin" style={{ color: "var(--accent)", textDecoration: "none", fontSize: "0.875rem" }}>
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <PostEditor
      heading="Edit Post"
      saveUrl={`/api/blog/${id}`}
      saveMethod="PUT"
      deleteUrl={`/api/blog/${id}`}
      initial={initial}
    />
  );
}
