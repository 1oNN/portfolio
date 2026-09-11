"use client";

import { useState } from "react";
import Link from "next/link";
// AWS comes from Font Awesome: Simple Icons dropped its Amazon/AWS marks in
// react-icons 5.7, and it also dropped SiOpenai, so Whisper is text-only now.
import { FaAws, FaDatabase, FaMasksTheater } from "react-icons/fa6";
// Oracle's ring is Grommet-only. Simple Icons has no Oracle mark at all.
import { GrOracle } from "react-icons/gr";
import {
  SiClaude,
  SiDocker,
  SiFastapi,
  SiFlask,
  SiGit,
  SiGithubactions,
  SiHuggingface,
  SiLinux,
  SiNeo4J,
  SiNextdotjs,
  SiOllama,
  SiOnnx,
  SiPandas,
  SiPostgresql,
  SiPytest,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiSentry,
  SiSupabase,
  SiTypescript,
} from "react-icons/si";

/**
 * Just enough of each skill to render a chip. The matching itself happens in the
 * server parent, so PROJECTS and the case-study prose never reach the browser.
 */
export interface SkillView {
  name: string;
  projects: { id: string; title: string }[];
}

export interface SkillGroupView {
  label: string;
  skills: SkillView[];
}

/**
 * One mark per chip, in SKILL_GROUPS order. Three kinds of entry here:
 *
 * - the skill's own brand mark, where react-icons ships one;
 * - the parent product's mark, where the skill is a part of it and nothing else
 *   would be more accurate: pgvector and PL/pgSQL are Postgres, fastembed is an
 *   ONNX runtime, sentence-transformers is Hugging Face's, and the CI gates run
 *   in GitHub Actions;
 * - a plain glyph for the two with no mark in any pack react-icons carries -
 *   a cylinder for SQL, and theatre masks for Playwright, whose own logo is a
 *   mask but is a seven-path colour illustration that turns to mud at 13px.
 *
 * Still text-only, because there is no mark and no honest stand-in: XGBoost,
 * Whisper (SiOpenai is gone), RAGAS, asyncio, REST APIs, and the technique-level
 * entries - semantic search, RAG, cross-encoder re-ranking.
 */
const SKILL_ICONS: Record<string, React.ReactNode> = {
  PyTorch: <SiPytorch />,
  "scikit-learn": <SiScikitlearn />,
  "Sentence Transformers": <SiHuggingface />,
  "fastembed (ONNX)": <SiOnnx />,
  pgvector: <SiPostgresql />,
  "Anthropic Claude API": <SiClaude />,
  Ollama: <SiOllama />,
  Python: <SiPython />,
  TypeScript: <SiTypescript />,
  SQL: <FaDatabase />,
  "PL/pgSQL": <SiPostgresql />,
  FastAPI: <SiFastapi />,
  Flask: <SiFlask />,
  PostgreSQL: <SiPostgresql />,
  "Postgres full-text search": <SiPostgresql />,
  Supabase: <SiSupabase />,
  Neo4j: <SiNeo4J />,
  "Next.js": <SiNextdotjs />,
  React: <SiReact />,
  "pandas / NumPy": <SiPandas />,
  AWS: <FaAws />,
  "Oracle Cloud": <GrOracle />,
  Docker: <SiDocker />,
  Git: <SiGit />,
  Linux: <SiLinux />,
  "CI build gates": <SiGithubactions />,
  pytest: <SiPytest />,
  Playwright: <FaMasksTheater />,
  Sentry: <SiSentry />,
};

/**
 * The interactive half of the skills section. Hover previews, click pins -
 * keyboard users get the same thing through focus and Enter.
 */
export default function SkillsExplorer({ groups }: { groups: SkillGroupView[] }) {
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const activeSkill = groups.flatMap((g) => g.skills).find((s) => s.name === active);

  return (
    <>
      <div className="mt-8 space-y-7">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              {group.label}
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.skills.map((skill) => {
                const isActive = active === skill.name;
                const hasProjects = skill.projects.length > 0;
                const chip = (
                  <>
                    {SKILL_ICONS[skill.name] && (
                      <span aria-hidden="true" className="text-[13px] leading-none opacity-90">
                        {SKILL_ICONS[skill.name]}
                      </span>
                    )}
                    {skill.name}
                  </>
                );
                const base =
                  "inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px]";

                // Only skills with a case study are interactive. The rest are
                // plain chips: clicking them used to produce a generic line
                // of filler, repeated identically for every one of them.
                if (!hasProjects) {
                  return (
                    <span
                      key={skill.name}
                      className={`${base} bg-[var(--surface-elevated)] text-[var(--text-secondary)]`}
                    >
                      {chip}
                    </span>
                  );
                }

                return (
                  <button
                    key={skill.name}
                    type="button"
                    aria-pressed={pinned === skill.name}
                    onClick={() => setPinned(pinned === skill.name ? null : skill.name)}
                    onMouseEnter={() => setHovered(skill.name)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(skill.name)}
                    onBlur={() => setHovered(null)}
                    className={`${base} transition-colors duration-150 ${
                      isActive
                        ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                        : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                    }`}
                  >
                    {chip}
                    <span
                      aria-hidden="true"
                      className={`inline-block h-1 w-1 rounded-full ${
                        isActive ? "bg-[var(--accent-contrast)]" : "bg-[var(--accent)]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Persistently mounted so the live region exists before it has content */}
      <div
        role="status"
        aria-live="polite"
        className="mt-7 min-h-[3.25rem] border-t border-[var(--border)] pt-5"
      >
        {activeSkill && activeSkill.projects.length > 0 ? (
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            <span className="font-mono text-[var(--accent)]">{activeSkill.name}</span> is used in{" "}
            {activeSkill.projects.map((p, i) => (
              <span key={p.id}>
                {i > 0 && (i === activeSkill.projects.length - 1 ? " and " : ", ")}
                <Link
                  href={`/projects/${p.id}`}
                  className="text-[var(--text-primary)] underline decoration-[var(--accent)] decoration-2 underline-offset-[3px] transition-opacity hover:opacity-70 focus-visible:opacity-70"
                >
                  {p.title}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}
      </div>
    </>
  );
}
