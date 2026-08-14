import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { BlogPost } from "@/types";
import { POST_TYPE_LABEL, postTypeColor } from "@/lib/post-labels";
import { formatDate } from "@/lib/format";

/**
 * Everything a card needs and nothing else. Deliberately not BlogPost: the
 * listing renders inside a client component so the filter can read the URL, and
 * a BlogPost carries the post's entire markdown `content`, which would then be
 * serialised into the page for every post just to derive a reading time. That
 * is computed on the server instead and passed as `mins`.
 */
export interface PostCardView {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  type: BlogPost["type"];
  tags: string[];
  createdAt: string;
  mins: number;
}

interface Props {
  post: PostCardView;
}

export default function PostCard({ post }: Props) {
  const typeColor = postTypeColor(post.type);
  const mins = post.mins;
  const visibleTags = post.tags.slice(0, 3);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 rounded-xl border border-[var(--border)] p-6 transition-colors duration-200 hover:border-[var(--text-secondary)] focus-visible:border-[var(--text-secondary)]"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest"
          style={{
            color: typeColor,
            backgroundColor: `color-mix(in srgb, ${typeColor} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${typeColor} 25%, transparent)`,
          }}
        >
          {POST_TYPE_LABEL[post.type]}
        </span>
        <span className="ml-auto font-mono text-[11px] text-[var(--text-muted)]">
          {formatDate(post.createdAt, "monthYear")}
        </span>
      </div>

      <h2 className="text-xl font-bold leading-tight tracking-tight text-[var(--text-primary)]">
        {post.title}
      </h2>

      <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
        {post.excerpt}
      </p>

      {/* Footer */}
      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          {mins} min read
        </span>
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className="rounded px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
            style={{ backgroundColor: "var(--surface-elevated)" }}
          >
            {tag}
          </span>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
          Read
          <FiArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
