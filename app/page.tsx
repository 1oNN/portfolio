"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import BentoProjects from "@/components/sections/BentoProjects";
import TerminalAgent from "@/components/interactive/TerminalAgent";
import Publications from "@/components/sections/Publications";
import Contact from "@/components/sections/Contact";
import StarField from "@/components/interactive/StarField";
import Terminal from "@/components/interactive/Terminal";

function LoadingScreen({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <span
              className="font-mono text-3xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              ha
              <span style={{ color: "var(--accent-secondary)" }}>.</span>
            </span>
            <div
              className="h-px w-24 overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--border)" }}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--accent), transparent)",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
  const [loaded] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Ensure page always starts at the top — prevent hash/autoscroll hijacking
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const show = setTimeout(() => {
      setShowHint(true);
      const hide = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(hide);
    }, 4000);
    return () => clearTimeout(show);
  }, [loaded]);

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
      <LoadingScreen done={loaded} />
      <StarField />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      >
        <Header />
        <main>
          <Hero />
          <About />
          <Experience />
          <BentoProjects />
          <TerminalAgent />
          <Publications />
          <Contact />
        </main>
        <Footer />
      </motion.div>

      {/* Ctrl+` mini-terminal easter egg */}
      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      <TerminalHint visible={showHint && !terminalOpen} />
    </>
  );
}
