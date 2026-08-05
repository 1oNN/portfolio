import { ImageResponse } from "next/og";
import { PROJECTS } from "@/lib/constants";
import { SPACE_GROTESK_BOLD_B64 } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study - Hammad Ahmad";

// Dark-theme status accents from globals.css, keyed by project category.
const CATEGORY_COLORS: Record<string, string> = {
  research: "#8ab4ff",
  engineering: "#34d399",
  ml: "#e3b341",
  fullstack: "#2dd4bf",
};

const fontData = Buffer.from(SPACE_GROTESK_BOLD_B64, "base64");

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.id === slug);

  const title = project?.title ?? "Projects";
  const tagline = project?.tagline ?? "AI/ML engineering and research case studies";
  const metrics = (project?.metrics ?? []).slice(0, 3);
  const accent = CATEGORY_COLORS[project?.category ?? ""] ?? "#34d399";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d1b2a",
          padding: 64,
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              color: accent,
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Case study · {project?.category ?? "portfolio"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 26 }}>
            <span style={{ color: "#34d399", fontWeight: 700 }}>ha</span>
            <span style={{ color: "#8ab4ff", fontWeight: 700 }}>.</span>
            <span style={{ color: "#9db0cd", marginLeft: 14 }}>hammadahmad.co.uk</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              color: "#dce7f5",
              fontSize: title.length > 22 ? 72 : 88,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", color: "#9db0cd", fontSize: 30, lineHeight: 1.3 }}>
            {tagline}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                display: "flex",
                color: accent,
                border: `1.5px solid ${accent}59`,
                backgroundColor: `${accent}14`,
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 22,
              }}
            >
              {m.value} {m.label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Space Grotesk", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
