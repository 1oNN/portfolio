export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
        </span>
        <div
          style={{
            width: "6rem",
            height: "2px",
            backgroundColor: "var(--border)",
            overflow: "hidden",
            borderRadius: "9999px",
            position: "relative",
          }}
        >
          <div
            className="loading-bar"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, var(--accent), transparent)",
            }}
          />
        </div>
      </div>
      <style>{`
        .loading-bar {
          animation: slide 1s ease-in-out infinite;
        }
        @keyframes slide {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
