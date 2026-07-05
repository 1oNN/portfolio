import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { BlogPost } from "@/types";
import { readingTime } from "@/lib/reading-time";

interface Props {
  post: BlogPost;
}

function formatCardDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default function PostCard({ post }: Props) {
  const isDeepDive = post.type === "case-study";
  const typeColor = isDeepDive ? "var(--accent-secondary)" : "var(--accent)";
  const mins = readingTime(post.content);
  const visibleTags = post.tags.slice(0, 3);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 rounded-xl border border-[var(--border)] p-6 transition-colors hover:border-[var(--text-secondary)] focus-visible:border-[var(--text-secondary)]"
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
          {isDeepDive ? "Deep dive" : "Post"}
        </span>
        <span className="ml-auto font-mono text-[11px] text-[var(--text-muted)]">
          {formatCardDate(post.createdAt)}
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
