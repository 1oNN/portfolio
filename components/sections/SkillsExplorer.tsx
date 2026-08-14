"use client";

import { useState } from "react";
import Link from "next/link";
// AWS comes from Font Awesome: Simple Icons dropped its Amazon/AWS marks in
// react-icons 5.7, and it also dropped SiOpenai, so Whisper is text-only now.
import { FaAws } from "react-icons/fa6";
import {
  SiApachespark,
  SiCplusplus,
  SiDocker,
  SiFastapi,
  SiFlask,
  SiGit,
  SiGithubactions,
  SiGooglecloud,
  SiJavascript,
  SiLinux,
  SiMlflow,
  SiNextdotjs,
  SiPandas,
  SiPostgresql,
  SiPytorch,
  SiPython,
  SiReact,
  SiScikitlearn,
  SiSupabase,
  SiTensorflow,
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
 * Brand marks where react-icons actually ships one. Deliberately partial:
 * Neo4j, Ollama, XGBoost and the concept-level skills (RAG, semantic search)
 * have no icon in the set, and a wrong-but-close glyph is worse than none, so
 * those render as text only.
 */
const SKILL_ICONS: Record<string, React.ReactNode> = {
  PyTorch: <SiPytorch />,
  TensorFlow: <SiTensorflow />,
  "scikit-learn": <SiScikitlearn />,
  MLflow: <SiMlflow />,
  "Ensemble methods": <SiApachespark />,
  Python: <SiPython />,
  TypeScript: <SiTypescript />,
  JavaScript: <SiJavascript />,
  "C++": <SiCplusplus />,
  FastAPI: <SiFastapi />,
  Flask: <SiFlask />,
  React: <SiReact />,
  "Next.js": <SiNextdotjs />,
  PostgreSQL: <SiPostgresql />,
  Supabase: <SiSupabase />,
  "pandas / NumPy": <SiPandas />,
  Docker: <SiDocker />,
  Git: <SiGit />,
  "GitHub Actions": <SiGithubactions />,
  AWS: <FaAws />,
  GCP: <SiGooglecloud />,
  Linux: <SiLinux />,
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
