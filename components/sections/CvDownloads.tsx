"use client";

import { FiDownload } from "react-icons/fi";
import { AVAILABLE_CVS } from "@/lib/cv-config";

/**
 * Client leaf: the only interactive piece of the About section. Renders the
 * CV download chips and fires the /api/track-download beacon on click.
 * Kept separate so About.tsx itself stays a plain server-renderable component.
 */
export default function CvDownloads() {
  return (
    <div className="flex flex-wrap gap-2">
      {AVAILABLE_CVS.map(({ label, href, cvType }) => (
        <a
          key={cvType}
          href={href}
          download
          onClick={() => {
            fetch("/api/track-download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cvType }),
              // A download anchor does not normally navigate, but where the
              // browser does navigate this request is cancelled without it.
              keepalive: true,
            }).catch(() => {});
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
        >
          <FiDownload size={13} />
          {label}
        </a>
      ))}
    </div>
  );
}
