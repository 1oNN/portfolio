import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import SectionHeader from "@/components/ui/SectionHeader";
import { getAllPosts } from "@/lib/blog-db";
import { readingTime } from "@/lib/reading-time";
import { POST_TYPE_LABEL, postTypeColor } from "@/lib/post-labels";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/**
 * Writing rows for the narrow home column, matching HomeProjects. The posts
 * previously had no home surface at all - the only route to them was the small
 * "writing" link in the rail, which meant the most linkable pages on the site
 * were also the least reachable.
 */
export default async function HomeWriting() {
  const posts = (await getAllPosts(true)).slice(0, 4);
  if (posts.length === 0) return null;

  return (
    <section id="writing" className="hairline-accent">
      <div className="animate-reveal py-14 sm:py-16">
        <SectionHeader
          size="lg"
          eyebrow="Writing"
          title="Notes & deep dives"
          description="What I learned building the systems above, written up while it was still fresh - evaluation methodology, latency profiling, and the decisions that did not survive contact with real data."
        />

        <ul className="mt-6 divide-y divide-[var(--border)]">
          {posts.map((post) => {
            const typeColor = postTypeColor(post.type);
            return (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group relative -mx-4 block rounded-lg px-4 py-7 transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] sm:grid sm:grid-cols-[140px_1fr] sm:gap-5"
                >
                  <span
                    aria-hidden="true"
                    className="absolute bottom-7 left-0 top-7 w-0.5 origin-center scale-y-0 rounded-full bg-[var(--accent)] transition-transform duration-200 group-hover:scale-y-100 group-focus-visible:scale-y-100"
                  />
                  {/* Pill, not bare mono text. The label used to look identical
                      to the category eyebrow on the project rows above, so
                      "Note" read as a section heading rather than a thing you
                      could click through to. */}
                  <span className="flex items-start">
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
                  </span>
                  <div className="mt-2 sm:mt-0">
                    <h3 className="font-display text-xl font-medium leading-snug text-[var(--text-primary)] transition duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)] group-focus-visible:translate-x-1 group-focus-visible:text-[var(--accent)]">
                      {post.title}
                      <span
                        aria-hidden="true"
                        className="ml-2 inline-block text-[var(--text-muted)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)] group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:text-[var(--accent)]"
                      >
                        ↗
                      </span>
                    </h3>
                    <p className="mt-1.5 max-w-[32rem] text-sm leading-[1.7] text-[var(--text-secondary)]">
                      {post.excerpt}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">
                      {formatDate(post.createdAt)}  ·  {readingTime(post.content)} min read
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]"
          >
            All writing
            <FiArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
