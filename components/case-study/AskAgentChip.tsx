"use client";

import { FiMessageCircle } from "react-icons/fi";
import { OPEN_AGENT_CONSOLE_EVENT } from "@/components/interactive/AgentConsoleLauncher";

/**
 * Opens the chat console in place, bottom right. This used to be a
 * `<Link href="/#agent">`, which threw the reader off the case study they were
 * reading and dropped them on the home page at an anchor - the question they
 * wanted to ask was about the project they had just left.
 *
 * The console listens for this event from `app/layout.tsx`, so it works on every
 * route rather than just the home page.
 */
export default function AskAgentChip() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(
          new CustomEvent(OPEN_AGENT_CONSOLE_EVENT, { detail: { source: "chip" } })
        )}
      aria-haspopup="dialog"
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
    >
      <FiMessageCircle size={13} />
      Ask my agent about this project
    </button>
  );
}
