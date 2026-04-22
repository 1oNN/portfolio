"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import type { BlogPost } from "@/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function NewPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") ?? "blog") as BlogPost["type"];

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<BlogPost["type"]>(initialType);
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(slugify(title));
  }, [title]);

  const parsedTags = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  async function handleSave() {
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          type,
          tags: parsedTags,
          excerpt,
          content,
          published,
        }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.message ?? "Failed to save.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface-elevated)",
    color: "var(--text-primary)",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: "0.375rem",
    display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/admin"
            style={{
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
            }}
          >
            ← Back to dashboard
          </Link>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--accent)",
            }}
          >
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
          </span>
        </div>
      </header>

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "2rem" }}>
          New Post
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title…"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
              style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
            />
          </div>

          {/* Type selector */}
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["blog", "case-study"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: `1px solid ${type === t ? "var(--accent)" : "var(--border)"}`,
                    backgroundColor: type === t ? "var(--accent)" : "var(--surface-elevated)",
                    color: type === t ? "#fff" : "var(--text-secondary)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {t === "blog" ? "Blog Post" : "Case Study"}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="python, ml, research"
              style={inputStyle}
            />
            {parsedTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.5rem" }}>
                {parsedTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.2rem 0.625rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      backgroundColor: "var(--accent-muted)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent-muted)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label style={labelStyle}>Excerpt (max 200 chars)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="A brief summary…"
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", textAlign: "right" }}>
              {excerpt.length}/200
            </div>
          </div>

          {/* Content with tab/preview toggle */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Content (Markdown)</label>
              <div style={{ display: "flex", gap: "0.375rem" }}>
                {["Write", "Preview"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPreviewMode(tab === "Preview")}
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "6px",
                      border: `1px solid ${(previewMode ? tab === "Preview" : tab === "Write") ? "var(--accent)" : "var(--border)"}`,
                      backgroundColor: (previewMode ? tab === "Preview" : tab === "Write") ? "var(--accent)" : "transparent",
                      color: (previewMode ? tab === "Preview" : tab === "Write") ? "#fff" : "var(--text-muted)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {previewMode ? (
              <div
                className="blog-content"
                style={{
                  minHeight: "300px",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface-elevated)",
                }}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(content || "_Nothing to preview yet._") }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Write your post in Markdown…"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  lineHeight: 1.7,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  minHeight: "300px",
                }}
              />
            )}
          </div>

          {/* Published toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              style={{ width: "1rem", height: "1rem", accentColor: "var(--accent)", cursor: "pointer" }}
            />
            <label
              htmlFor="published"
              style={{ fontSize: "0.875rem", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Publish immediately
            </label>
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#f87171",
                backgroundColor: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: "6px",
                padding: "0.5rem 0.75rem",
              }}
            >
              {error}
            </p>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: saving ? "var(--accent-muted)" : "var(--accent)",
              color: saving ? "var(--accent)" : "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-mono)",
              alignSelf: "flex-start",
              transition: "all 0.2s",
            }}
          >
            {saving ? "Saving…" : "Save Post"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading…</div>}>
      <NewPostForm />
    </Suspense>
  );
}
