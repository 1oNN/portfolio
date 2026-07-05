"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import HomeProjects from "@/components/sections/HomeProjects";
import TerminalAgent from "@/components/interactive/TerminalAgent";
import Publications from "@/components/sections/Publications";
import Contact from "@/components/sections/Contact";
import StarField from "@/components/interactive/StarField";
import Terminal from "@/components/interactive/Terminal";

function TerminalHint({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hint"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono border"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <kbd
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--accent)",
              border: "1px solid var(--border)",
            }}
          >
            Ctrl+`
          </kbd>
          Open mini-terminal
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const show = setTimeout(() => {
      setShowHint(true);
      const hide = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(hide);
    }, 4000);
    return () => clearTimeout(show);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
        setShowHint(false);
      }
      if (e.key === "Escape" && terminalOpen) {
        setTerminalOpen(false);
      }
    },
    [terminalOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "/" }),
    }).catch(() => {});
  }, []);

  return (
    <>
      <StarField />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <Header />
        <main id="main">
          <Hero />
          <About />
          <Experience />
          <HomeProjects />
          <TerminalAgent />
          <Publications />
          <Contact />
        </main>
        <Footer />
      </motion.div>
      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <TerminalHint visible={showHint && !terminalOpen} />
    </>
  );
}
