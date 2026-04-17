"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTerminalAgent } from "@/hooks/useTerminalAgent";
import { useTypewriter } from "@/hooks/useTypewriter";
import { AGENT_SUGGESTIONS } from "@/lib/constants";
import type { TerminalMessage } from "@/types";
import { FiSend, FiTrash2, FiCpu, FiUser, FiInfo } from "react-icons/fi";

// ─── Markdown-lite renderer ────────────────────────────────────────
// Handles **bold**, *italic*, and newlines only — no external dep.

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    // Bold
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={pi} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <span key={li}>
        {rendered}
        {li < lines.length - 1 && <br />}
      </span>
    );
  });
}

// ─── Message that types itself in ─────────────────────────────────

interface StreamingMessageProps {
  content: string;
  onDone?: () => void;
}

function StreamingMessage({ content, onDone }: StreamingMessageProps) {
  const { displayed, done } = useTypewriter(content, { speed: 12, onComplete: onDone });

  return (
    <span>
      {renderMarkdown(displayed)}
      {!done && (
        <span
          className="inline-block w-1.5 h-3.5 ml-0.5 align-middle rounded-sm animate-pulse"
          style={{ backgroundColor: "var(--accent-secondary)" }}
        />
      )}
    </span>
  );
}

// ─── Individual message bubble ─────────────────────────────────────

interface MessageBubbleProps {
  message: TerminalMessage;
  isLatest: boolean;
}

function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2"
      >
        <div
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: "rgba(34,211,238,0.1)", color: "#22d3ee" }}
        >
          <FiInfo size={11} />
        </div>
        <p className="terminal-text text-xs leading-relaxed pt-0.5"
          style={{ color: "rgba(34,211,238,0.7)" }}>
          {message.content}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: isUser ? "var(--accent-muted)" : "rgba(34,211,238,0.1)",
          color: isUser ? "var(--accent)" : "#22d3ee",
          border: `1px solid ${isUser ? "var(--accent-muted)" : "rgba(34,211,238,0.2)"}`,
        }}
      >
        {isUser ? <FiUser size={13} /> : <FiCpu size={13} />}
      </div>

      {/* Bubble */}
      <div
        className={`flex flex-col gap-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className="rounded-xl px-4 py-3 terminal-text text-sm leading-relaxed"
          style={{
            backgroundColor: isUser
              ? "var(--accent-muted)"
              : "var(--surface-elevated)",
            border: `1px solid ${isUser ? "rgba(129,140,248,0.2)" : "var(--border)"}`,
            color: isUser ? "var(--accent)" : "var(--text-primary)",
          }}
        >
          {!isUser && isLatest ? (
            <StreamingMessage content={message.content} />
          ) : (
            renderMarkdown(message.content)
          )}
        </div>

        {/* Source citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-1.5 w-full"
          >
            <p className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}>
              Sources
            </p>
            {message.sources.map((src, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2 text-xs"
                style={{
                  backgroundColor: "var(--accent-muted)",
                  border: "1px solid rgba(129,140,248,0.1)",
                }}
              >
                <p className="font-semibold mb-0.5" style={{ color: "var(--accent)" }}>
                  {src.section}
                </p>
                <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {src.excerpt}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Thinking animation ────────────────────────────────────────────

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3"
    >
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: "rgba(34,211,238,0.1)",
          color: "#22d3ee",
          border: "1px solid rgba(34,211,238,0.2)",
        }}
      >
        <FiCpu size={13} />
      </div>
      <div
        className="flex items-center gap-1.5 rounded-xl px-4 py-3"
        style={{
          backgroundColor: "var(--surface-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          Retrieving from resume
        </span>
        <div className="flex items-center gap-1 ml-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: "#22d3ee" }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────

export default function TerminalAgent() {
  const { messages, isThinking, send, clear, inputHistory, historyIndex, setHistoryIndex, isAtLimit } =
    useTerminalAgent();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Scroll chat container to bottom on new messages — never scrolls the page
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isThinking]);

  const handleSend = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || isThinking) return;
    setInput("");
    await send(q);
  }, [input, isThinking, send]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, inputHistory.length - 1);
      setHistoryIndex(next);
      setInput(inputHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next === -1 ? "" : inputHistory[next]);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <section
      id="agent"
      className="py-24 sm:py-32"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest font-mono"
            style={{
              color: "#22d3ee",
              backgroundColor: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            AI Assistant
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Chat with my Portfolio
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-4 max-w-xl mx-auto text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            An AI assistant that knows about my experience, projects, and research. Ask it anything about my work.
          </motion.p>
        </div>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-3xl overflow-hidden rounded-2xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-5 py-3.5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 text-center">
              <span
                className="text-xs font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                ha. assistant
              </span>
            </div>
            <button
              onClick={clear}
              className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-[var(--surface-elevated)]"
              style={{ color: "var(--text-muted)" }}
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <FiTrash2 size={12} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            className="max-h-[500px] overflow-y-auto p-5 space-y-5"
            role="log"
            aria-live="polite"
            aria-label="Conversation with resume agent"
          >
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLatest={i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}

            <AnimatePresence>{isThinking && <ThinkingIndicator />}</AnimatePresence>

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div
            className="border-t px-5 py-3 flex flex-wrap gap-2"
            style={{ borderColor: "var(--border)" }}
          >
            {AGENT_SUGGESTIONS.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                disabled={isThinking}
                className="rounded-full px-3 py-1 text-xs font-mono transition-all hover:scale-[1.02] disabled:opacity-40"
                style={{
                  backgroundColor: "var(--accent-muted)",
                  border: "1px solid rgba(129,140,248,0.2)",
                  color: "var(--text-secondary)",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div
            className="flex items-center gap-3 border-t px-5 py-4"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="terminal-text text-xs shrink-0"
              style={{ color: "#22d3ee" }}
            >
              you:
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAtLimit
                  ? "Session limit reached — refresh to start over"
                  : "Ask anything about my experience, skills, or projects..."
              }
              disabled={isThinking || isAtLimit}
              className="flex-1 bg-transparent terminal-text text-sm outline-none disabled:opacity-50"
              style={{ color: "var(--text-primary)" }}
              aria-label="Ask the resume agent a question"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking || isAtLimit}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "rgba(129,140,248,0.15)",
                color: "var(--accent)",
                border: "1px solid rgba(129,140,248,0.25)",
              }}
              aria-label="Send message"
            >
              <FiSend size={14} />
            </button>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          Powered by AI · Responses based on Hammad&apos;s CV
        </motion.p>
      </div>
    </section>
  );
}
