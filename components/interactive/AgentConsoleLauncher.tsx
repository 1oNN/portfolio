"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Lazy-loaded chat console. The chunk is NOT fetched until the console is first
// opened (ssr:false keeps it out of the server render entirely).
const AgentConsole = dynamic(() => import("./AgentConsole"), { ssr: false });

/**
 * Event the rail button dispatches to open the console. LeftRail is a server
 * component, so a window event is cheaper than threading a context provider
 * across the server/client boundary just to share one boolean.
 */
export const OPEN_AGENT_CONSOLE_EVENT = "open-agent-console";

/**
 * Client leaf owning the console's open state and the global shortcuts.
 * Escape-to-close lives inside AgentConsole.
 */
export default function AgentConsoleLauncher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K is the shortcut people try instinctively. preventDefault
      // also suppresses Firefox's Ctrl+K search-bar focus while the page has focus.
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      // Ctrl+` kept as a second binding: it is what the site advertised for
      // months, so anyone who learned it should not hit a dead key.
      const isCtrlBacktick = e.ctrlKey && e.key === "`";
      if (isCmdK || isCtrlBacktick) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onOpenRequest = () => setOpen(true);
    window.addEventListener(OPEN_AGENT_CONSOLE_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_AGENT_CONSOLE_EVENT, onOpenRequest);
  }, []);

  return <>{open && <AgentConsole onClose={() => setOpen(false)} />}</>;
}
