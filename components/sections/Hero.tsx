import Link from "next/link";
import { FiMail } from "react-icons/fi";

const STATS = [
  { value: "54%", label: "Latency reduction" },
  { value: "93%", label: "Model accuracy" },
  { value: "2,100+", label: "Concurrent agents" },
];

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Grid overlay — dissolves toward the lower-right */}
      <div
        className="grid-bg pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(ellipse_80%_60%_at_25%_0%,black,transparent_70%)]"
        aria-hidden="true"
      />
      {/* Radial accent wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 30% -10%, var(--accent-glow), transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-36 sm:pb-20 sm:pt-44">
        <div className="max-w-3xl">
          {/* 1. Eyebrow */}
          <span
            className="animate-rise inline-block font-mono text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent)", animationDelay: "0ms" }}
          >
            ✦ AI/ML engineer &amp; researcher
          </span>

          {/* 2. Name */}
          <h1
            className="animate-rise mt-4 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ color: "var(--text-primary)", animationDelay: "60ms" }}
          >
            Hammad Ahmad
          </h1>

          {/* 3. Lede */}
          <p
            className="animate-rise mt-6 max-w-2xl text-lg leading-snug sm:text-xl"
            style={{ color: "var(--text-secondary)", animationDelay: "120ms" }}
          >
            MSc Applied AI. I build{" "}
            <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
              LLM systems
            </strong>
            ,{" "}
            <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
              graph-augmented retrieval
            </strong>
            , and high-throughput ML infrastructure — fast, measurable, grounded in research.
          </p>

          {/* 4. Stats */}
          <div
            className="animate-rise mt-10 grid max-w-xl grid-cols-3 gap-6"
            style={{ animationDelay: "180ms" }}
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="border-l-2 pl-4"
                style={{ borderColor: "var(--accent)" }}
              >
                <div
                  className="font-mono text-2xl font-bold sm:text-3xl"
                  style={{ color: "var(--accent)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-1 font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* 5. CTAs */}
          <div
            className="animate-rise mt-10 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:opacity-90"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <FiMail size={15} />
              Get in touch
            </a>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:border-[var(--text-secondary)] focus-visible:text-[var(--text-primary)]"
            >
              Read the case studies
            </Link>
          </div>

          {/* 6. Availability microline */}
          <p
            className="animate-rise mt-8 font-mono text-xs"
            style={{ color: "var(--text-muted)", animationDelay: "300ms" }}
          >
            Open to research &amp; engineering roles · Bradford, UK
          </p>
        </div>
      </div>
    </section>
  );
}
