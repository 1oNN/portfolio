import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hammad Ahmad — AI/ML Engineer",
    short_name: "Hammad Ahmad",
    description:
      "Graduate AI & Machine Learning Engineer specialising in LLMs, RAG systems, and scalable ML infrastructure. MSc Applied AI, University of Bradford.",
    start_url: "/",
    display: "browser",
    background_color: "#0a0814",
    theme_color: "#0a0814",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
