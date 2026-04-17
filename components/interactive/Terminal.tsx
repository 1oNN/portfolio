"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TERMINAL_COMMANDS } from "@/lib/constants";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

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
      e.preventDefault();
      const cmds = Object.keys(TERMINAL_COMMANDS);
      const match = cmds.find((c) => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(9, 9, 18, 0.96)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
          role="dialog"
          aria-label="Terminal"
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <button
              onClick={onClose}
              className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
              aria-label="Close terminal"
            />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span
              className="ml-auto text-xs font-mono"
              style={{ color: "rgba(255,255,255,0.4)" }}
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
                      ? "rgba(34, 211, 238, 0.7)"
                      : line.type === "input"
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.6)",
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
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <span className="terminal-text text-sm" style={{ color: "var(--accent-secondary)" }}>
              hammad@portfolio:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent terminal-text text-sm outline-none"
              style={{ color: "rgba(255,255,255,0.9)" }}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
            <span className="terminal-cursor" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
