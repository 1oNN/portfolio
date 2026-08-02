"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lazy-loaded easter-egg terminal. The chunk is NOT fetched until the first
// Ctrl+` toggles `open` to true (ssr:false keeps it out of the server render).
const Terminal = dynamic(() => import("./Terminal"), { ssr: false });

/**
 * Desktop-only hint toast pointing at the Ctrl+` shortcut. CSS-only entrance
 * (reuses the `.animate-rise` forwards pattern from globals.css) — no framer.
 * Tokens are bracket classes, not inline styles, per the design language.
 */
function TerminalHint() {
  return (
    <div className="animate-rise fixed bottom-6 left-6 z-40 hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-xs text-[var(--text-muted)] md:flex">
      <kbd className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--accent)]">
        Ctrl+`
      </kbd>
      Open mini-terminal
    </div>
  );
}

/**
 * Client leaf that owns the terminal `open` state, the document-level Ctrl+`
 * toggle, and the hint-toast timing. Escape-to-close lives inside Terminal.
 */
export default function TerminalLauncher() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Ctrl+` toggles the terminal (Escape-to-close is handled inside Terminal).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setShowHint(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Hint toast: appears 4s after load, disappears 5s later.
  useEffect(() => {
    const show = setTimeout(() => setShowHint(true), 4000);
    const hide = setTimeout(() => setShowHint(false), 9000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <>
      {open && <Terminal isOpen onClose={() => setOpen(false)} />}
      {showHint && !open && <TerminalHint />}
    </>
  );
}
