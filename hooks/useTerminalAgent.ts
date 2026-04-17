"use client";

import { useState, useCallback, useRef } from "react";
import type { TerminalMessage } from "@/types";

const MAX_MESSAGES = 10;

interface UseTerminalAgentReturn {
  messages: TerminalMessage[];
  isThinking: boolean;
  send: (query: string) => Promise<void>;
  clear: () => void;
  inputHistory: string[];
  historyIndex: number;
  setHistoryIndex: (i: number) => void;
  userMessageCount: number;
  isAtLimit: boolean;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeSessionId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function useTerminalAgent(): UseTerminalAgentReturn {
  const sessionId = useRef<string>(makeSessionId());

  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      id: makeId(),
      role: "system",
      content:
        "AI agent ready. Ask me anything about Hammad's experience, skills, or projects. Try: \"What's your strongest ML project?\"",
      sources: [],
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const isAtLimit = userMessageCount >= MAX_MESSAGES;

  const send = useCallback(
    async (query: string) => {
      if (!query.trim() || isThinking) return;

      if (userMessageCount >= MAX_MESSAGES) {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "system",
            content: `Session limit reached (${MAX_MESSAGES} messages). Please refresh to start a new session.`,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setInputHistory((prev) => [query, ...prev.slice(0, 49)]);
      setHistoryIndex(-1);

      const userMsg: TerminalMessage = {
        id: makeId(),
        role: "user",
        content: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setUserMessageCount((c) => c + 1);
      setIsThinking(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      // Build conversation history (user/assistant only) for multi-turn context
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: query,
            history,
            sessionId: sessionId.current,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as { error?: string }).error ?? `HTTP ${res.status}`);
        }

        const data = await res.json() as { response: string };

        const assistantMsg: TerminalMessage = {
          id: makeId(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        const errText =
          err instanceof Error ? err.message : "Connection error. Check your network and try again.";

        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "system",
            content: errText,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages, userMessageCount]
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    sessionId.current = makeSessionId();
    setMessages([
      {
        id: makeId(),
        role: "system",
        content: "Session cleared. Ready for new queries.",
        sources: [],
        timestamp: new Date(),
      },
    ]);
    setIsThinking(false);
    setUserMessageCount(0);
  }, []);

  return {
    messages,
    isThinking,
    send,
    clear,
    inputHistory,
    historyIndex,
    setHistoryIndex,
    userMessageCount,
    isAtLimit,
  };
}
