import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog-db";
import { PROJECTS } from "@/lib/constants";

// Posts are DynamoDB-backed and publishable at runtime without a rebuild, so a
// sitemap prerendered once at build time never saw them. Hourly is well inside
// any crawl interval.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hammadahmad.co.uk";

  let posts: MetadataRoute.Sitemap = [];
  let newestPost: Date | undefined;

  try {
    const allPosts = await getAllPosts(true);
    posts = allPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const timestamps = allPosts
      .map((post) => new Date(post.updatedAt).getTime())
      .filter((time) => Number.isFinite(time));
    if (timestamps.length > 0) newestPost = new Date(Math.max(...timestamps));
  } catch (err) {
    console.error("[sitemap] Failed to load blog posts:", err);
    if (process.env.NODE_ENV === "production") throw err;
  }

  // lastModified is omitted wherever there is no real modification date to give.
  // It used to be `new Date()` on every entry, which is the build timestamp, so
  // the whole site claimed to have changed on every deploy. Only posts carry a
  // genuine updatedAt, and /blog inherits the newest of them.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: newestPost, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = PROJECTS.map((project) => ({
    url: `${base}/projects/${project.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...posts];
}
