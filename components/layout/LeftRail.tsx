import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { SOCIAL_LINKS } from "@/lib/constants";
import ThemeToggle from "@/components/interactive/ThemeToggle";
import CountUp from "@/components/interactive/CountUp";
import RailNav from "./RailNav";

// Drop a portrait at public/profile.jpg (or .jpeg/.png/.webp) and it renders
// automatically; until then the rail keeps its text-only layout.
const PHOTO_CANDIDATES = ["profile.jpg", "profile.jpeg", "profile.png", "profile.webp"];

function findProfilePhoto(): string | null {
  for (const file of PHOTO_CANDIDATES) {
    if (fs.existsSync(path.join(process.cwd(), "public", file))) return `/${file}`;
  }
  return null;
}

const STATS = [
  { value: "54%", label: "Latency cut" },
  { value: "93%", label: "Model accuracy" },
  { value: "2,100+", label: "Concurrent agents" },
];

const iconMap: Record<string, React.ReactNode> = {
  FiGithub: <FiGithub size={18} />,
  FiLinkedin: <FiLinkedin size={18} />,
  FiMail: <FiMail size={18} />,
};

/**
 * Home identity rail. Sticky full-height column on lg+, normal-flow intro
 * block below that. Server component - the only client child is RailNav.
 */
export default function LeftRail() {
  const photo = findProfilePhoto();

  return (
    <header className="pt-16 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[42%] lg:max-w-md lg:flex-col lg:justify-between lg:overflow-y-auto lg:py-24">
      <div>
        {photo && (
          <div className="animate-rise mb-6" style={{ animationDelay: "0ms" }}>
            <Image
              src={photo}
              alt="Portrait of Hammad Ahmad"
              width={96}
              height={96}
              priority
              className="h-24 w-24 rounded-full border object-cover"
              style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            />
          </div>
        )}

        <span
          className="animate-rise inline-block font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--accent)]"
          style={{ animationDelay: "0ms" }}
        >
          ✦ AI/ML engineer &amp; researcher
        </span>

        {/* Stacked display name - the one loud typographic moment on the page */}
        <h1
          className="animate-rise mt-5 font-display text-[clamp(3.5rem,2.4rem+3vw,5.25rem)] font-bold leading-[0.95] tracking-[-0.03em] text-[var(--text-primary)]"
          style={{ animationDelay: "60ms" }}
        >
          Hammad
          <br />
          <span className="text-gradient-accent">Ahmad</span>
        </h1>

        <p
          className="animate-rise mt-6 max-w-sm text-base leading-relaxed text-[var(--text-secondary)]"
          style={{ animationDelay: "120ms" }}
        >
          MSc Applied AI. I build{" "}
          <strong className="font-semibold text-[var(--text-primary)]">LLM systems</strong>,{" "}
          <strong className="font-semibold text-[var(--text-primary)]">
            graph-augmented retrieval
          </strong>
          , and high-throughput ML infrastructure.
        </p>

        {/* Compact metric row - mono, accent numerals */}
        <div className="animate-rise mt-8 flex gap-8" style={{ animationDelay: "180ms" }}>
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                className="font-mono text-lg font-bold text-[var(--accent)]"
                style={{ textShadow: "0 0 18px var(--accent-glow)" }}
              >
                <CountUp value={stat.value} />
              </div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Cross-page links - this is also the mobile route to /projects and /blog */}
        <div
          className="animate-rise mt-8 flex items-center gap-5 font-mono text-xs"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/projects"
            className="text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline focus-visible:text-[var(--accent)] focus-visible:underline"
          >
            projects ↗
          </Link>
          <Link
            href="/blog"
            className="text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline focus-visible:text-[var(--accent)] focus-visible:underline"
          >
            writing ↗
          </Link>
        </div>

        <div className="animate-rise mt-14 hidden lg:block" style={{ animationDelay: "300ms" }}>
          <RailNav />
        </div>
      </div>

      {/* Bottom cluster - socials, theme, terminal hint */}
      <div className="animate-rise mt-10 lg:mt-0" style={{ animationDelay: "360ms" }}>
        <div className="flex items-center gap-5">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target={link.platform !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={link.platform}
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] focus-visible:text-[var(--accent)]"
            >
              {iconMap[link.icon]}
            </a>
          ))}
          <span aria-hidden="true" className="h-4 w-px bg-[var(--border)]" />
          <ThemeToggle />
        </div>
        <p className="mt-4 hidden font-mono text-[11px] text-[var(--text-muted)] lg:block">
          <kbd className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--accent)]">
            Ctrl+`
          </kbd>{" "}
          talk to my resume agent
        </p>
      </div>
    </header>
  );
}
