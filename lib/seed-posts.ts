import type { BlogPost } from "@/types";

/**
 * Posts that ship inside the bundle so the published blog renders content
 * without any DynamoDB write. These are merged into the PUBLISHED read path
 * only (see `getAllPosts` / `getPostBySlug` in `lib/blog-db.ts`); the admin
 * path never sees them, and a real DB post always wins on a slug collision.
 */
export const SEED_POSTS: BlogPost[] = [];
