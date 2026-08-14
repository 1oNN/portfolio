import SectionHeader from "@/components/ui/SectionHeader";
import { PROJECTS, SKILL_GROUPS, type Skill } from "@/lib/constants";
import { getCaseStudy } from "@/lib/case-studies";
import SkillsExplorer, { type SkillGroupView } from "./SkillsExplorer";

/**
 * Which projects evidence a given skill, matched against each project's `tech`
 * array plus its case-study primary stack. Computed rather than hand-listed so
 * a skill cannot claim a project it is not actually part of.
 */
function projectsUsing(skill: Skill) {
  const needles = [skill.name, ...(skill.alias ?? [])].map((s) => s.toLowerCase());
  return PROJECTS.filter((p) => {
    if (skill.usedIn?.includes(p.id)) return true;
    const stack = [...p.tech, ...(getCaseStudy(p.id)?.primaryStack ?? [])].map((t) =>
      t.toLowerCase()
    );
    return stack.some((t) => needles.some((n) => t === n || t.includes(n)));
  });
}

// Resolved here, on the server. This used to run inside the client component,
// which pulled PROJECTS and the whole of lib/case-studies.ts - ~31 KB of pure
// narrative prose - into the home page's browser bundle to produce what is only
// a list of project ids and titles.
const SKILL_INDEX: SkillGroupView[] = SKILL_GROUPS.map((group) => ({
  label: group.label,
  skills: group.skills.map((skill) => ({
    name: skill.name,
    projects: projectsUsing(skill).map((p) => ({ id: p.id, title: p.title })),
  })),
}));

/**
 * Its own section rather than a block under Education, where the identical
 * mono group labels made the skills read as Education sub-headings.
 *
 * Selecting a skill shows the projects that actually use it, so the list is
 * checkable rather than asserted.
 */
export default function Skills() {
  return (
    <section id="skills" className="hairline-accent">
      <div className="animate-reveal py-14 sm:py-16">
        <SectionHeader
          size="lg"
          eyebrow="Toolkit"
          title="Technical skills"
          description="Pick one to see the work behind it."
        />

        <SkillsExplorer groups={SKILL_INDEX} />
      </div>
    </section>
  );
}
