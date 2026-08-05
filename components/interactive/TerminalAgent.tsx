"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import { useTerminalAgent } from "@/hooks/useTerminalAgent";
import { useTypewriter } from "@/hooks/useTypewriter";
import { AGENT_SUGGESTIONS } from "@/lib/constants";
import type { TerminalMessage } from "@/types";
import { FiSend, FiTrash2, FiCpu, FiUser, FiInfo } from "react-icons/fi";

// ─── Markdown-lite renderer ────────────────────────────────────────
// Handles **bold**, *italic*, and newlines only - no external dep.

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
// The caret is the agent's voice → amber. The sr-only span carries the full
// content so assistive tech reads the complete answer, not the animation.

interface StreamingMessageProps {
  content: string;
  onDone?: () => void;
}

function StreamingMessage({ content, onDone }: StreamingMessageProps) {
  const { displayed, done } = useTypewriter(content, { speed: 12, onComplete: onDone });

  return (
    <span>
      <span aria-hidden="true">
        {renderMarkdown(displayed)}
        {!done && (
          <span
            className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm align-middle"
            style={{ backgroundColor: "var(--accent-secondary)" }}
          />
        )}
      </span>
      <span className="sr-only">{content}</span>
    </span>
  );
}

// ─── Individual message bubble ─────────────────────────────────────
// Colour roles: agent voice = amber (avatar/accents), user = indigo
// (avatar, bubble tint + border). Assistant bubble sits on --surface-elevated.

interface MessageBubbleProps {
  message: TerminalMessage;
  isLatest: boolean;
}

function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="animate-message-in flex items-start gap-2">
        <div
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent-secondary) 12%, transparent)",
            color: "var(--accent-secondary)",
          }}
        >
          <FiInfo size={11} />
        </div>
        <p
          className="terminal-text pt-0.5 text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`animate-message-in flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar - indigo for the user, amber for the agent */}
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: isUser
            ? "var(--accent-muted)"
            : "color-mix(in srgb, var(--accent-secondary) 12%, transparent)",
          color: isUser ? "var(--accent)" : "var(--accent-secondary)",
          border: `1px solid ${
            isUser
              ? "color-mix(in srgb, var(--accent) 25%, transparent)"
              : "color-mix(in srgb, var(--accent-secondary) 25%, transparent)"
          }`,
        }}
      >
        {isUser ? <FiUser size={13} /> : <FiCpu size={13} />}
      </div>

      {/* Bubble */}
      <div className={`flex max-w-[85%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="terminal-text rounded-xl px-4 py-3 text-sm leading-relaxed"
          style={{
            backgroundColor: isUser ? "var(--accent-muted)" : "var(--surface-elevated)",
            border: `1px solid ${
              isUser ? "color-mix(in srgb, var(--accent) 25%, transparent)" : "var(--border)"
            }`,
            color: "var(--text-primary)",
          }}
        >
          {!isUser && isLatest ? (
            <StreamingMessage content={message.content} />
          ) : (
            renderMarkdown(message.content)
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Thinking animation ────────────────────────────────────────────
// Amber agent avatar + amber dots (CSS keyframe, staggered by delay).

function ThinkingIndicator() {
  return (
    <div className="animate-message-in flex items-start gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor: "color-mix(in srgb, var(--accent-secondary) 12%, transparent)",
          color: "var(--accent-secondary)",
          border: "1px solid color-mix(in srgb, var(--accent-secondary) 25%, transparent)",
        }}
      >
        <FiCpu size={13} />
      </div>
      <div
        className="flex items-center gap-1.5 rounded-xl px-4 py-3"
        style={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)" }}
      >
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          Thinking…
        </span>
        <div className="ml-1 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="animate-thinking-dot h-1 w-1 rounded-full"
              style={{ backgroundColor: "var(--accent-secondary)", animationDelay: `${i * 0.16}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component - the terminal window only (section shell lives in
// AgentSection). "use client" + the full useTerminalAgent behaviour stay. ──

export default function TerminalAgent() {
  const { messages, isThinking, send, clear, inputHistory, historyIndex, setHistoryIndex, isAtLimit } =
    useTerminalAgent();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Scroll chat container to bottom on new messages - never scrolls the page
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
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-1.5 opacity-70">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 text-center">
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            ~/hammad/agent
          </span>
        </div>
        <button
          type="button"
          onClick={clear}
          className="flex h-6 w-6 items-center justify-center rounded transition-colors text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] focus-visible:bg-[var(--surface-elevated)] focus-visible:text-[var(--text-primary)]"
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <FiTrash2 size={12} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="max-h-[460px] space-y-5 overflow-y-auto p-5"
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

        {isThinking && <ThinkingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions - tech-chip-like buttons */}
      <div className="flex flex-wrap gap-2 border-t px-5 py-3" style={{ borderColor: "var(--border)" }}>
        {AGENT_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            disabled={isThinking}
            className="rounded-md border bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-secondary)] px-2.5 py-1 font-mono text-xs transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)] disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input row - indigo you: glyph, solid-accent send button */}
      <div className="flex items-center gap-3 border-t px-5 py-4" style={{ borderColor: "var(--border)" }}>
        <span className="shrink-0 font-mono text-xs" style={{ color: "var(--accent)" }}>
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
              ? "Session limit reached - refresh to start over"
              : "Ask anything about my experience, skills, or projects..."
          }
          disabled={isThinking || isAtLimit}
          className="input-field flex-1 bg-transparent font-mono text-sm outline-none disabled:opacity-50"
          style={{ color: "var(--text-primary)" }}
          aria-label="Ask the resume agent a question"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isThinking || isAtLimit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--accent-contrast)] transition-opacity hover:opacity-90 focus-visible:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)" }}
          aria-label="Send message"
        >
          <FiSend size={14} />
        </button>
      </div>
    </div>
  );
}
