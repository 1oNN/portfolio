import SectionHeader from "@/components/ui/SectionHeader";
import { EXPERIENCE } from "@/lib/constants";
import type { Experience as ExperienceEntry } from "@/types";

const STATUS_COLOR: Record<ExperienceEntry["type"], string> = {
  research: "var(--status-research)",
  engineering: "var(--status-engineering)",
  internship: "var(--status-engineering)",
};

export default function Experience() {
  return (
    <section id="experience" className="border-t" style={{ borderColor: "var(--border)" }}>
      <div className="py-14 sm:py-16">
        <SectionHeader
          eyebrow="Experience"
          title="Where I've built"
          description="Research assistantships and engineering roles, most recent first - what I built and shipped at each."
        />

        <div className="mt-4 divide-y divide-[var(--border)]">
          {EXPERIENCE.map((exp) => {
            const color = STATUS_COLOR[exp.type];
            return (
              <div key={exp.id} className="py-8 sm:grid sm:grid-cols-[140px_1fr] sm:gap-5">
                {/* Meta */}
                <div className="flex flex-col gap-1.5">
                  <span
                    className="font-mono text-[11px] uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {exp.startDate} - {exp.endDate}
                  </span>
                  <span
                    className="font-mono text-[11px] uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {exp.location}
                  </span>
                  <span
                    className="mt-1.5 inline-flex w-fit items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest"
                    style={{
                      color,
                      backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                    }}
                  >
                    {exp.type}
                  </span>
                </div>

                {/* Role */}
                <div className="mt-3 sm:mt-0">
                  <h3 className="text-lg font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {exp.role}
                  </h3>
                  <p className="mt-1 text-sm font-medium" style={{ color }}>
                    {exp.company}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {exp.responsibilities.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <span className="shrink-0" style={{ color }} aria-hidden="true">
                          -
                        </span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
