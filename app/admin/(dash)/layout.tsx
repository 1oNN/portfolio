import AdminNav from "@/components/admin/AdminNav";

/**
 * Chrome for the signed-in admin pages.
 *
 * A route group rather than a path segment, so no existing URL changes:
 * /admin/posts/new and /admin/posts/[id] resolve exactly as before. It cannot
 * live in app/admin/layout.tsx because /admin/login shares that layout and has
 * to stay chrome-free.
 *
 * The parent layout already emits robots noindex, which this inherits.
 */
export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminNav />
      {children}
    </div>
  );
}
