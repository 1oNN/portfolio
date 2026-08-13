"use client";

import { OPEN_AGENT_CONSOLE_EVENT } from "@/components/interactive/AgentConsoleLauncher";

/**
 * The chat's front door in the left rail. Replaces a passive `Ctrl+\`` line of
 * text that was desktop-only, so mobile visitors previously had no entry point
 * to the agent at all beyond scrolling to the section.
 *
 * Note the base values for every hovered property are bracket classes, not
 * inline `style`: an inline style on the same property silently kills the
 * Tailwind hover/focus variant.
 */
export default function ChatRailButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_AGENT_CONSOLE_EVENT))}
      aria-haspopup="dialog"
      className="group mt-4 inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-3 pr-2.5 transition-colors duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] focus-visible:border-[var(--accent)] focus-visible:bg-[var(--accent-muted)]"
    >
      <span
        aria-hidden="true"
        className="animate-thinking-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
      />
      <span className="text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-primary)] group-focus-visible:text-[var(--text-primary)]">
        Chat with me
      </span>
      {/* The shortcut only exists on a physical keyboard, so the badge is lg+. */}
      <kbd className="hidden rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--accent)] lg:block">
        Ctrl K
      </kbd>
    </button>
  );
}
