"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail, FiArrowDown } from "react-icons/fi";

const ROLES = [
  "AI/ML Engineer",
  "RAG Systems Builder",
  "Research Engineer",
];

function TypewriterText({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const current = words[wordIndex];
    let timeout: NodeJS.Timeout;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 65);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, 35);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words]);

  return (
    <span className="text-gradient">
      {displayed}
      <span className="terminal-cursor ml-0.5" />
    </span>
  );
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 grid-bg pointer-events-none"
        style={{ opacity: 0.4 }}
        aria-hidden="true"
      />

      {/* Radial gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, var(--accent-glow), transparent)",
        }}
      />

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        {/* Avatar */}
        <motion.div variants={item} className="mb-8 flex justify-center">
          <div className="relative">
            <div
              className="h-24 w-24 rounded-full border-2 overflow-hidden flex items-center justify-center"
              style={{
                borderColor: "var(--accent)",
                backgroundColor: "var(--surface-elevated)",
                boxShadow: "0 0 0 4px var(--accent-muted), 0 0 24px var(--accent-glow)",
              }}
            >
              <span
                className="text-2xl font-bold font-mono select-none"
                style={{ color: "var(--accent)" }}
              >
                HA
              </span>
            </div>
            <span
              className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-full border-2 animate-pulse"
              style={{ backgroundColor: "#22c55e", borderColor: "var(--background)" }}
            />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div variants={item} className="mb-6">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium font-mono border"
            style={{
              backgroundColor: "var(--accent-muted)",
              borderColor: "var(--accent-glow)",
              color: "var(--accent)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#22d3ee" }}
            />
            Open to research & engineering roles
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={item}
          className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          style={{ color: "var(--text-primary)" }}
        >
          Hammad Ahmad
        </motion.h1>

        {/* Typewriter role */}
        <motion.div
          variants={item}
          className="mt-4 text-xl font-semibold sm:text-2xl min-h-[2rem]"
        >
          <TypewriterText words={ROLES} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={item}
          className="mt-6 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          MSc AI graduate specialising in{" "}
          <strong style={{ color: "var(--text-primary)" }}>LLMs, RAG systems</strong>,
          and high-throughput ML infrastructure. I build things that are fast, measurable, and
          grounded in research.
        </motion.p>

        {/* Stats */}
        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { value: "54%", label: "Latency reduction" },
            { value: "93%", label: "Model accuracy" },
            { value: "2,100+", label: "Concurrent agents" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span
                className="text-2xl font-bold font-mono"
                style={{ color: "var(--accent)" }}
              >
                {stat.value}
              </span>
              <span className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--accent), #0f766e)",
              boxShadow: "0 4px 20px var(--accent-glow)",
            }}
          >
            <FiMail size={15} />
            Get in touch
          </a>
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-2.5 text-sm font-semibold transition-all hover:bg-[var(--accent-muted)] active:scale-95"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            View projects
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          variants={item}
          className="mt-8 flex items-center justify-center gap-4"
        >
          {[
            { icon: <FiGithub size={18} />, href: "https://github.com/1onn", label: "GitHub" },
            {
              icon: <FiLinkedin size={18} />,
              href: "https://linkedin.com/in/hammadahmad123",
              label: "LinkedIn",
            },
            {
              icon: <FiMail size={18} />,
              href: "mailto:hammadahmad9999@hotmail.com",
              label: "Email",
            },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200 hover:scale-110 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
                backgroundColor: "var(--surface)",
              }}
            >
              {social.icon}
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToAbout}
        aria-label="Scroll to about section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 hover:opacity-80 transition-opacity"
      >
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiArrowDown size={16} style={{ color: "var(--text-muted)" }} />
        </motion.div>
      </button>
    </section>
  );
}
