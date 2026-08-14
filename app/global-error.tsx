"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself, which
 * app/error.tsx sits inside and therefore cannot catch. The layout loads three
 * Google fonts at build time and mounts the theme provider, and a font fetch
 * failing is a known failure mode here.
 *
 * This replaces the whole document, so it has to render its own html/body and
 * cannot use the app's CSS variables - the stylesheet may be exactly what
 * failed. Hence the literal colours.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d1b2a",
          color: "#e6edf6",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main id="main">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#9fb0c9", margin: "0 0 2rem" }}>
            The page failed to load. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "transparent",
              color: "#e6edf6",
              border: "1px solid #24374f",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
