"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { slugify } from "@/lib/format";
import type { BlogPost } from "@/types";

export interface PostEditorValues {
  title: string;
  slug: string;
  type: BlogPost["type"];
  /** Raw comma-separated input, not the parsed array. */
  tags: string;
  excerpt: string;
  content: string;
  published: boolean;
}

interface Props {
  heading: string;
  initial: PostEditorValues;
  saveUrl: string;
  saveMethod: "POST" | "PUT";
  /** Edit mode only. Its presence is what shows the Delete button. */
  deleteUrl?: string;
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

/**
 * The post form, shared by /admin/posts/new and /admin/posts/[id].
 *
 * Those two pages were ~90% the same file - the same markup, the same style
 * objects, the same tag parsing and preview pane, duplicated in full - so every
 * change to the form had to be made twice or the two drifted apart. What
 * actually differs is the heading, the endpoint, and whether Delete exists.
 *
 * Note the slug follows the title from the title field's own onChange rather
 * than a useEffect: on the edit page an effect keyed on `title` would fire after
 * the post loads and overwrite the saved slug with a re-slugified title.
 */
export default function PostEditor({ heading, initial, saveUrl, saveMethod, deleteUrl }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [type, setType] = useState<BlogPost["type"]>(initial.type);
  const [tags, setTags] = useState(initial.tags);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [content, setContent] = useState(initial.content);
  const [published, setPublished] = useState(initial.published);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch(saveUrl, {
        method: saveMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, type, tags: parsedTags, excerpt, content, published }),
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

  async function handleDelete() {
    if (!deleteUrl) return;
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);

    try {
      await fetch(deleteUrl, { method: "DELETE" });
      router.push("/admin");
    } catch {
      setError("Delete failed.");
      setDeleting(false);
    }
  }

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {heading}
          </h1>
          {deleteUrl && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid color-mix(in srgb, var(--danger) 40%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--danger) 8%, transparent)",
                color: "var(--danger)",
                fontSize: "0.8rem",
                cursor: deleting ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              {deleting ? "Deleting…" : "Delete Post"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Title */}
          <div>
            <label htmlFor="post-title" style={labelStyle}>
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              placeholder="Post title…"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="post-slug" style={labelStyle}>
              Slug
            </label>
            <input
              id="post-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
              style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
            />
          </div>

          {/* Type selector */}
          <div>
            <span style={labelStyle}>Type</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["blog", "case-study"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={type === t}
                  onClick={() => setType(t)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: `1px solid ${type === t ? "var(--accent)" : "var(--border)"}`,
                    backgroundColor: type === t ? "var(--accent)" : "var(--surface-elevated)",
                    color: type === t ? "var(--accent-contrast)" : "var(--text-secondary)",
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
            <label htmlFor="post-tags" style={labelStyle}>
              Tags (comma-separated)
            </label>
            <input
              id="post-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="python, ml, research"
              style={inputStyle}
            />
            {parsedTags.length > 0 && (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.5rem" }}
              >
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
            <label htmlFor="post-excerpt" style={labelStyle}>
              Excerpt (max 200 chars)
            </label>
            <textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="A brief summary…"
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "0.25rem",
                textAlign: "right",
              }}
            >
              {excerpt.length}/200
            </div>
          </div>

          {/* Content with write/preview toggle */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <label htmlFor="post-content" style={{ ...labelStyle, marginBottom: 0 }}>
                Content (Markdown)
              </label>
              <div style={{ display: "flex", gap: "0.375rem" }}>
                {["Write", "Preview"].map((tab) => {
                  const isActive = previewMode ? tab === "Preview" : tab === "Write";
                  return (
                    <button
                      key={tab}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setPreviewMode(tab === "Preview")}
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "6px",
                        border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                        backgroundColor: isActive ? "var(--accent)" : "transparent",
                        color: isActive ? "var(--accent-contrast)" : "var(--text-muted)",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
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
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(content || "_Nothing to preview yet._"),
                }}
              />
            ) : (
              <textarea
                id="post-content"
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

          {error && (
            <p
              role="alert"
              style={{
                fontSize: "0.8rem",
                color: "var(--danger)",
                backgroundColor: "color-mix(in srgb, var(--danger) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
                borderRadius: "6px",
                padding: "0.5rem 0.75rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: saving ? "var(--accent-muted)" : "var(--accent)",
              color: saving ? "var(--accent)" : "var(--accent-contrast)",
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
