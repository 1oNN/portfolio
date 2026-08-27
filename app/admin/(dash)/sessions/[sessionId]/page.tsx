import Link from "next/link";
import { notFound } from "next/navigation";

import SessionTrailView from "@/components/admin/SessionTrailView";
import { getSessionTrail } from "@/lib/analytics-read";
import { scoreSession } from "@/lib/analytics-select";

export const dynamic = "force-dynamic";

/**
 * One trail, permalinked.
 *
 * Behind the /admin/:path* middleware matcher like everything else in this
 * group, so it needs no auth check of its own.
 */
export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const trail = await getSessionTrail(sessionId);

  // A 90 day TTL means an old permalink expires rather than 500s. notFound is
  // the honest answer: the row is gone, not broken.
  if (!trail) notFound();

  const session = {
    meta: trail.meta,
    events: trail.events,
    signal: scoreSession(trail.meta, trail.events),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/admin/sessions"
        className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] hover:underline focus-visible:text-[var(--text-primary)] focus-visible:underline focus-visible:outline-none"
      >
        Back to sessions
      </Link>

      <div className="mt-4">
        <SessionTrailView session={session} headingLevel="h2" />
      </div>
    </main>
  );
}
