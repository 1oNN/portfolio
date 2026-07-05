"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "var(--surface)" : "transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
      }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
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

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={navHref(item.href)}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="relative inline-block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    backgroundColor: active ? "var(--accent-muted)" : "transparent",
                  }}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border transition-all"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
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

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <ul className="flex flex-col px-6 py-4 gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={navHref(item.href)}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        color: active ? "var(--accent)" : "var(--text-secondary)",
                        backgroundColor: active ? "var(--accent-muted)" : "transparent",
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
