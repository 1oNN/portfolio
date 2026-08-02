"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TERMINAL_COMMANDS } from "@/lib/constants";

// This chrome is permanently dark (see the `background` below), regardless of
// site theme. `--accent` is theme-dependent and resolves to the deep blue in
// light mode (tuned for white surfaces), which fails on this dark background.
// Use the dark-theme green literally instead (9.1:1 on the navy chrome).
const TERMINAL_ACCENT = "#34d399"; // always-dark chrome; theme var would go blue in light

interface TerminalLine {
  type: "input" | "output" | "system";
  content: string;
}

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Terminal({ isOpen, onClose }: TerminalProps) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", content: "Portfolio Terminal v1.0.0" },
    { type: "system", content: 'Type "help" to see available commands.' },
    { type: "system", content: "" },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Element that had focus before the terminal opened, restored on close.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Focus management: snapshot the previously-focused element on open, move
  // focus into the input, and restore focus to the snapshot on close/unmount.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      clearTimeout(id);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Escape-to-close lives inside the terminal (its own keydown while open).
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const runCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();

      setLines((prev) => [
        ...prev,
        { type: "input", content: `hammad@portfolio:~$ ${cmd}` },
      ]);

      if (trimmed === "clear") {
        setLines([]);
        return;
      }

      if (trimmed === "exit") {
        onClose();
        return;
      }

      if (trimmed === "date") {
        setLines((prev) => [
          ...prev,
          { type: "output", content: new Date().toUTCString() },
          { type: "output", content: "" },
        ]);
        return;
      }

      const response = TERMINAL_COMMANDS[trimmed];
      if (response) {
        setLines((prev) => [
          ...prev,
          { type: "output", content: response },
          { type: "output", content: "" },
        ]);
      } else if (trimmed !== "") {
        setLines((prev) => [
          ...prev,
          {
            type: "output",
            content: `command not found: ${trimmed}. Type "help" for available commands.`,
          },
          { type: "output", content: "" },
        ]);
      }
    },
    [onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (input.trim()) {
        setHistory((prev) => [input, ...prev]);
        setHistoryIndex(-1);
      }
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(nextIndex);
      setInput(nextIndex === -1 ? "" : history[nextIndex]);
    } else if (e.key === "Tab") {
      // Precedence: Tab completion takes priority over the focus trap. When the
      // input holds text and a known command starts with it, Tab completes the
      // command and focus stays in the input (completion consumes the event).
      // In every other case — empty input, no matching command, or Shift+Tab —
      // completion does not consume the event and Tab drives the 2-element
      // focus trap instead, moving focus to the close button.
      const cmds = Object.keys(TERMINAL_COMMANDS);
      const match = cmds.find((c) => c.startsWith(input.toLowerCase()));
      if (!e.shiftKey && input.trim() !== "" && match) {
        e.preventDefault();
        setInput(match);
        return;
      }
      e.preventDefault();
      closeButtonRef.current?.focus();
    }
  };

  // Focus trap: the input and the close button are the only two focusables, so
  // Tab/Shift+Tab from the close button always cycles back to the input.
  const handleCloseKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="animate-rise fixed bottom-6 right-6 z-50 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: "rgba(13, 27, 42, 0.97)",
        border: "1px solid rgba(141, 160, 191, 0.15)",
        backdropFilter: "blur(20px)",
      }}
      role="dialog"
      aria-label="Terminal"
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "rgba(141, 160, 191, 0.12)" }}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          onKeyDown={handleCloseKeyDown}
          className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
          aria-label="Close terminal"
        />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span
          className="ml-auto text-xs font-mono"
          style={{ color: "rgba(157, 176, 205, 0.55)" }}
        >
          hammad@portfolio — terminal
        </span>
      </div>

      {/* Output */}
      <div className="h-72 overflow-y-auto p-4 space-y-0.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className="terminal-text text-sm leading-relaxed"
            style={{
              color:
                line.type === "system"
                  ? `color-mix(in srgb, ${TERMINAL_ACCENT} 80%, transparent)`
                  : line.type === "input"
                  ? "rgba(220, 231, 245, 0.92)"
                  : "rgba(195, 210, 231, 0.7)",
              whiteSpace: "pre-wrap",
            }}
          >
            {line.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-t"
        style={{ borderColor: "rgba(141, 160, 191, 0.12)" }}
      >
        <span className="terminal-text text-sm" style={{ color: TERMINAL_ACCENT }}>
          hammad@portfolio:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent terminal-text text-sm outline-none"
          style={{ color: "rgba(220, 231, 245, 0.92)" }}
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal input"
        />
        <span className="terminal-cursor" />
      </div>
    </div>
  );
}
