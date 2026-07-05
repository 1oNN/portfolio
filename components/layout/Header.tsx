"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import ThemeToggle from "@/components/interactive/ThemeToggle";
import { FiMenu, FiX } from "react-icons/fi";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS
      .filter((item) => item.href.startsWith("#"))
      .map((item) => item.href.replace("#", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Escape closes the mobile menu and returns focus to its toggle button.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Section hrefs (e.g. "#about") resolve to "/#about" for the Link's href.
  const navHref = (href: string) => (href.startsWith("#") ? `/${href}` : href);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    // Already on "/": intercept and smooth-scroll instead of a hash jump.
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isNavActive = (href: string) => {
    if (href.startsWith("#")) {
      return pathname === "/" && activeSection === href.replace("#", "");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? "backdrop-blur-md" : ""
      }`}
      style={{
        backgroundColor: scrolled ? "color-mix(in srgb, var(--surface) 80%, transparent)" : "transparent",
        borderColor: scrolled ? "var(--border)" : "transparent",
      }}
    >
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight transition-opacity hover:opacity-70 focus-visible:opacity-70"
          style={{ color: "var(--accent)" }}
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          aria-label="Back to top"
        >
          ha<span style={{ color: "var(--accent-secondary)" }}>.</span>
        </Link>

        {/* Desktop nav — filter idiom: color + underline, no pills */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href);
            return (
              <li key={item.href} className="relative">
                <Link
                  href={navHref(item.href)}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-sm transition-colors focus-visible:text-[var(--text-primary)] ${
                    active
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
                {/* Active-section indicator: opacity transition, no framer layoutId */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-px left-0 h-0.5 w-full transition-opacity duration-200"
                  style={{ backgroundColor: "var(--accent)", opacity: active ? 1 : 0 }}
                />
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
            style={{
              backgroundColor: "var(--surface-elevated)",
            }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — CSS-only entrance (see .animate-menu-in), no framer */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden overflow-hidden border-t animate-menu-in"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <ul className="flex flex-col gap-1 px-6 py-4">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={navHref(item.href)}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`block border-l-2 py-2.5 pl-4 text-sm transition-colors ${
                      active
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
