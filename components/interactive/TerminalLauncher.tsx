"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lazy-loaded easter-egg terminal. The chunk is NOT fetched until the first
// Ctrl+` toggles `open` to true (ssr:false keeps it out of the server render).
const Terminal = dynamic(() => import("./Terminal"), { ssr: false });

/**
 * Client leaf that owns the terminal `open` state and the document-level
 * Ctrl+` toggle. Escape-to-close lives inside Terminal. The shortcut hint is
 * a static line in the home LeftRail - no timed toast.
 */
export default function TerminalLauncher() {
  const [open, setOpen] = useState(false);

  // Ctrl+` toggles the terminal (Escape-to-close is handled inside Terminal).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return <>{open && <Terminal isOpen onClose={() => setOpen(false)} />}</>;
}
