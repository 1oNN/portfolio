import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hammad Ahmad - AI/ML Engineer",
    short_name: "Hammad Ahmad",
    description:
      "AI/ML Engineer working on graph-augmented retrieval, LLM evaluation, and latency optimisation. MSc Artificial Intelligence (Merit), University of Bradford.",
    start_url: "/",
    display: "browser",
    background_color: "#0d1b2a",
    theme_color: "#0d1b2a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
