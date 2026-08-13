import type { BlogPost } from "@/types";

/**
 * One vocabulary for post types, shared by every surface.
 *
 * These labels had drifted into four different words for the same thing:
 * `type: "blog"` rendered as "Note" on the home page, "Posts" in the blog
 * filter nav, "Post" on the cards and "Writing" on the OG image. A reader
 * moving between them could not tell whether they were different categories.
 */
export const POST_TYPE_LABEL: Record<BlogPost["type"], string> = {
  "case-study": "Deep dive",
  blog: "Note",
};

/** Plural form, for filter nav and counts. */
export const POST_TYPE_LABEL_PLURAL: Record<BlogPost["type"], string> = {
  "case-study": "Deep dives",
  blog: "Notes",
};

/** Deep dives take the secondary accent so the two types are told apart at a glance. */
export function postTypeColor(type: BlogPost["type"]): string {
  return type === "case-study" ? "var(--accent-secondary)" : "var(--accent)";
}
