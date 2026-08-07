"use client";

import { useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { PROJECTS, SKILL_GROUPS, type Skill } from "@/lib/constants";
import { getCaseStudy } from "@/lib/case-studies";

/**
 * Which projects evidence a given skill, matched against each project's `tech`
 * array plus its case-study primary stack. Computed rather than hand-listed so
 * a skill cannot claim a project it is not actually part of.
 */
function projectsUsing(skill: Skill) {
  const needles = [skill.name, ...(skill.alias ?? [])].map((s) => s.toLowerCase());
  return PROJECTS.filter((p) => {
    const stack = [...p.tech, ...(getCaseStudy(p.id)?.primaryStack ?? [])].map((t) =>
      t.toLowerCase()
    );
    return stack.some((t) => needles.some((n) => t === n || t.includes(n)));
  });
}

const SKILL_INDEX = SKILL_GROUPS.map((group) => ({
  label: group.label,
  skills: group.skills.map((skill) => ({
    ...skill,
    projects: projectsUsing(skill).map((p) => ({ id: p.id, title: p.title })),
  })),
}));

/**
 * Its own section rather than a block under Education, where the identical
 * mono group labels made the skills read as Education sub-headings.
 *
 * Selecting a skill shows the projects that actually use it, so the list is
 * checkable rather than asserted. Hover previews, click pins - keyboard users
 * get the same thing through focus and Enter.
 */
export default function Skills() {
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const activeSkill = SKILL_INDEX.flatMap((g) => g.skills).find((s) => s.name === active);

  return (
    <section id="skills" className="hairline-accent">
      <div className="animate-reveal py-14 sm:py-16">
        <SectionHeader
          size="lg"
          eyebrow="Toolkit"
          title="Technical skills"
          description="Pick one to see where it is actually used. Anything without a project behind it is something I have worked with but have not shipped here."
        />

        <div className="mt-8 space-y-7">
          {SKILL_INDEX.map((group) => (
            <div key={group.label}>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {group.label}
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.skills.map((skill) => {
                  const isActive = active === skill.name;
                  const hasProjects = skill.projects.length > 0;
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
                      className={`rounded px-2 py-0.5 font-mono text-[11px] transition-colors duration-150 ${
                        isActive
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                          : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:text-[var(--text-primary)]"
                      }`}
                    >
                      {skill.name}
                      {hasProjects && (
                        <span
                          aria-hidden="true"
                          className={`ml-1.5 inline-block h-1 w-1 rounded-full align-middle ${
                            isActive ? "bg-[var(--accent-contrast)]" : "bg-[var(--accent)]"
                          }`}
                        />
                      )}
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
          {activeSkill ? (
            activeSkill.projects.length > 0 ? (
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                <span className="font-mono text-[var(--accent)]">{activeSkill.name}</span> is used
                in{" "}
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
            ) : (
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                <span className="font-mono text-[var(--accent)]">{activeSkill.name}</span> is on my
                CV but has no case study on this site behind it.
              </p>
            )
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              A dot marks a skill with a project behind it.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
