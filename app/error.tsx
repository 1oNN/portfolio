"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "3rem",
          fontWeight: 800,
          color: "var(--accent-secondary)",
          lineHeight: 1,
        }}
      >
        500
      </span>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        Something went wrong
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.625rem 1.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "var(--surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
          cursor: "pointer",
          fontWeight: 500,
          fontSize: "0.875rem",
        }}
      >
        Try again
      </button>
    </div>
  );
}
