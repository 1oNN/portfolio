"use client";

import { useEffect, useRef } from "react";
import TerminalAgent from "./TerminalAgent";

interface AgentConsoleProps {
  onClose: () => void;
}

/**
 * Floating chat console. Replaces the old fake command shell (Terminal.tsx):
 * there is now ONE console and it talks to the real agent.
 *
 * The chrome is TerminalAgent's own - traffic lights, `~/hammad/agent` label,
 * clear button - so nothing is duplicated here. This component only positions
 * the panel, forces the dark palette, and owns open/close behaviour.
 */
export default function AgentConsole({ onClose }: AgentConsoleProps) {
  // Element focused before the console opened, restored when it closes so a
  // keyboard user lands back on the rail button rather than at the top of the page.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    return () => previouslyFocused.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      // `dark` is the whole trick: globals.css defines the navy/green palette as
      // custom properties under .dark, so every token inside this subtree
      // resolves to the dark set even when the site is in light mode. That gives
      // an always-dark console for free - no hardcoded hex literals, which is
      // what the retired terminal needed (its TERMINAL_ACCENT #34d399 existed
      // only because --accent would have gone deep blue on a navy panel).
      className="dark animate-rise fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-lg"
      // Non-modal on purpose: the page stays scrollable and usable behind the
      // console, so focus is deliberately NOT trapped. Escape closes it.
      role="dialog"
      aria-modal="false"
      aria-label="Chat with Hammad's portfolio agent"
      style={{ filter: "drop-shadow(0 12px 32px rgba(0, 0, 0, 0.45))" }}
    >
      <TerminalAgent onClose={onClose} compact autoFocus />
    </div>
  );
}
