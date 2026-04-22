"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog?all=1");
      if (res.ok) {
        const data: BlogPost[] = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/blog/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  }

  const published = posts.filter((p) => p.published).length;
  const caseStudies = posts.filter((p) => p.type === "case-study").length;

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
            maxWidth: "900px",
            margin: "0 auto",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "1.125rem",
              color: "var(--accent)",
            }}
          >
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>{" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.875rem" }}>
              Admin
            </span>
          </span>

          <button
            onClick={handleLogout}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            { label: "Total Posts", value: posts.length },
            { label: "Published", value: published },
            { label: "Case Studies", value: caseStudies },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.25rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
          <Link
            href="/admin/posts/new?type=blog"
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid var(--accent)",
              backgroundColor: "var(--accent)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
            }}
          >
            + New Blog Post
          </Link>
          <Link
            href="/admin/posts/new?type=case-study"
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface-elevated)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
            }}
          >
            + New Case Study
          </Link>
        </div>

        {/* Post list */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
              All Posts
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Loading…
            </div>
          ) : posts.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                No posts yet.
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Create your first post!
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Title", "Type", "Status", "Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.625rem 1rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>
                      {post.title}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                          fontFamily: "var(--font-mono)",
                          backgroundColor: post.type === "case-study" ? "rgba(245, 158, 11, 0.1)" : "var(--accent-muted)",
                          color: post.type === "case-study" ? "#f59e0b" : "var(--accent)",
                          border: `1px solid ${post.type === "case-study" ? "rgba(245,158,11,0.2)" : "var(--accent-muted)"}`,
                        }}
                      >
                        {post.type === "case-study" ? "Case Study" : "Blog"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                          backgroundColor: post.published ? "rgba(16,185,129,0.1)" : "rgba(100,116,139,0.1)",
                          color: post.published ? "#10b981" : "var(--text-muted)",
                          border: `1px solid ${post.published ? "rgba(16,185,129,0.2)" : "var(--border)"}`,
                        }}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {formatDate(post.createdAt)}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link
                          href={`/admin/posts/${post.id}`}
                          style={{
                            padding: "0.25rem 0.625rem",
                            fontSize: "0.75rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            textDecoration: "none",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deletingId === post.id}
                          style={{
                            padding: "0.25rem 0.625rem",
                            fontSize: "0.75rem",
                            borderRadius: "6px",
                            border: "1px solid rgba(248,113,113,0.3)",
                            backgroundColor: "transparent",
                            color: "#f87171",
                            cursor: "pointer",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {deletingId === post.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
