import Link from "next/link";

export default function NotFound() {
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
          fontSize: "5rem",
          fontWeight: 800,
          color: "var(--accent)",
          lineHeight: 1,
        }}
      >
        404
      </span>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.625rem 1.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "var(--accent-muted)",
          color: "var(--accent)",
          textDecoration: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
        }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
