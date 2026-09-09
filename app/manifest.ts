import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hammad Ahmad - AI/ML Engineer",
    short_name: "Hammad Ahmad",
    // Read from lib/metadata rather than copied: this string had already drifted
    // once from the one the pages serve.
    description: SITE_DESCRIPTION,
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
