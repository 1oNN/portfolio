import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog-db";
import { SPACE_GROTESK_BOLD_B64 } from "@/lib/og-font";
import { formatDate } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Writing - Hammad Ahmad";

const fontData = Buffer.from(SPACE_GROTESK_BOLD_B64, "base64");

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.published ? post.title : "Writing & notes";
  const isDeepDive = post?.published && post.type === "case-study";
  const accent = isDeepDive ? "#8ab4ff" : "#34d399";
  const tags = post?.published ? post.tags.slice(0, 4) : [];

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
              alignItems: "center",
              gap: 20,
              color: accent,
              fontSize: 22,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            <span>{isDeepDive ? "Deep dive" : "Writing"}</span>
            {post?.published && (
              <span style={{ color: "#8da0bf", letterSpacing: 1 }}>{formatDate(post.createdAt)}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 26 }}>
            <span style={{ color: "#34d399", fontWeight: 700 }}>ha</span>
            <span style={{ color: "#8ab4ff", fontWeight: 700 }}>.</span>
            <span style={{ color: "#9db0cd", marginLeft: 14 }}>hammadahmad.co.uk</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#dce7f5",
            fontSize: title.length > 55 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {tags.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                color: "#9db0cd",
                backgroundColor: "#1b3350",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 20,
              }}
            >
              {t}
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
