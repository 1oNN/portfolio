"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * The admin bar. One client leaf for the whole shell: it needs usePathname to
 * mark the active tab and a handler to log out, so splitting the logout into a
 * second client component would buy nothing.
 *
 * Not placed in app/admin/layout.tsx, because /admin/login shares that layout
 * and has to stay chrome-free. It lives in the (dash) route group instead,
 * which changes no URLs.
 */

const TABS = [
  { href: "/admin", label: "Analytics" },
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/posts", label: "Posts" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <span className="font-mono text-base font-bold text-[var(--accent)]">
          ha<span className="text-[var(--accent-secondary)]">.</span>
        </span>

        <ul className="flex items-center gap-1">
          {TABS.map((tab) => {
            // The analytics tab is an exact match; the others own their subtree.
            const active =
              tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block border-b-2 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)] focus-visible:outline-none ${
                    active
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--text-muted)]"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={logout}
          className="ml-auto rounded-md border border-[var(--border)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)] focus-visible:outline-none"
        >
          Log out
        </button>
      </nav>
    </header>
  );
}
