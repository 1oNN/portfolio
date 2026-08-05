"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiLink } from "react-icons/fi";

/** Copies the canonical post URL; falls back gracefully if clipboard is unavailable. */
export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions / old browser) - do nothing visible.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
    >
      {copied ? <FiCheck size={12} /> : <FiLink size={12} />}
      {copied ? "Copied" : "Copy link"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </button>
  );
}
