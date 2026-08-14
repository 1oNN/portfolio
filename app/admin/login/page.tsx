"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Invalid password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
          </span>
        </div>

        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.25rem",
            }}
          >
            Admin Access
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label
              htmlFor="password"
              style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface-elevated)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>

          {error && (
            // role=alert so a failed login is announced; without it the only
            // feedback was visual and a screen reader user got silence.
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
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.625rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: loading ? "var(--accent-muted)" : "var(--accent)",
              color: loading ? "var(--accent)" : "var(--accent-contrast)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              fontFamily: "var(--font-mono)",
            }}
          >
            {loading ? "Authenticating…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
