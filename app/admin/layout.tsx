import type { Metadata } from "next";

// robots.ts already disallows /admin, but a disallowed URL that gets linked
// anywhere can still be indexed URL-only: the crawler never fetches the page,
// so it never sees a noindex. This layout exists solely to emit one. It has to
// be a layout because all four admin pages are client components, which cannot
// export metadata.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
