"use client";

import { useEffect, useState, type ComponentType } from "react";
// Imported per module rather than through components/project-visuals/index.ts on
// purpose: that barrel also pulls in FinLawBenchmarkExplorer,
// DiabetesFactorExplorer and the benchmark demo data, none of which a hover
// preview can ever show. Going direct keeps this lazy chunk to the visuals only.
import { FinLawHero, FinLawArchitecture } from "@/components/project-visuals/FinLawVisuals";
import { VoiceAgentHero, VoiceAgentArchitecture } from "@/components/project-visuals/VoiceAgentVisuals";
import {
  DiabetesSenseHero,
  DiabetesSenseArchitecture,
} from "@/components/project-visuals/DiabetesSenseVisuals";
import { JobzylHeroStill, JobzylArchitecture } from "@/components/project-visuals/JobzylVisuals";
import { VoiceFlowHero, VoiceFlowArchitecture } from "@/components/project-visuals/VoiceFlowVisuals";
import {
  SleepEfficiencyHero,
  SleepEfficiencyArchitecture,
} from "@/components/project-visuals/SleepEfficiencyVisuals";
import {
  FinLawResults,
  DiabetesSenseResults,
  VoiceAgentResults,
  SleepEfficiencyResults,
} from "@/components/project-visuals/ResultsCharts";

const ADVANCE_MS = 1800;

interface VisualProps {
  accent: string;
  className?: string;
}

interface Slide {
  label: string;
  Visual: ComponentType<VisualProps>;
}

/**
 * Slides are the visuals each case study already ships, in reading order:
 * what it is, how it is built, what it produced. Jobzyl has only two because it
 * deliberately has no results chart (no quantitative results worth charting).
 */
const SLIDES: Record<string, Slide[]> = {
  jobzyl: [
    { label: "Live jobs", Visual: JobzylHeroStill },
    { label: "Architecture", Visual: JobzylArchitecture },
  ],
  "finlaw-uk": [
    { label: "Overview", Visual: FinLawHero },
    { label: "Architecture", Visual: FinLawArchitecture },
    { label: "Results", Visual: FinLawResults },
  ],
  "ai-voice-agent": [
    { label: "Overview", Visual: VoiceAgentHero },
    { label: "Architecture", Visual: VoiceAgentArchitecture },
    { label: "Results", Visual: VoiceAgentResults },
  ],
  "diabetes-risk": [
    { label: "Overview", Visual: DiabetesSenseHero },
    { label: "Architecture", Visual: DiabetesSenseArchitecture },
    { label: "Results", Visual: DiabetesSenseResults },
  ],
  voiceflow: [
    { label: "Overview", Visual: VoiceFlowHero },
    { label: "Architecture", Visual: VoiceFlowArchitecture },
  ],
  "sleep-efficiency": [
    { label: "Overview", Visual: SleepEfficiencyHero },
    { label: "Architecture", Visual: SleepEfficiencyArchitecture },
    { label: "Results", Visual: SleepEfficiencyResults },
  ],
};

interface Props {
  projectId: string;
  accent: string;
}

export default function ProjectPreviewSlides({ projectId, accent }: Props) {
  const slides = SLIDES[projectId] ?? [];
  const [index, setIndex] = useState(0);
  // Read once on mount: this chunk is ssr:false, so there is no server pass to
  // disagree with. The global duration-zeroing rule in globals.css cannot reach
  // a setInterval, so reduced motion has to be handled here explicitly.
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Restart from the first slide whenever the pointer moves to another project.
  // The parent keeps one mounted instance and swaps projectId, so there is no
  // key to remount on; resetting here is the reset.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIndex(0), [projectId]);

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return;
    const id = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), ADVANCE_MS);
    return () => clearInterval(id);
  }, [projectId, reducedMotion, slides.length]);

  if (slides.length === 0) return null;

  return (
    <>
      <div className="relative w-full bg-[var(--surface-elevated)]" style={{ aspectRatio: "16 / 10" }}>
        {slides.map(({ label, Visual }, i) => (
          <div
            key={label}
            // No `data-inview` anywhere in here: the .pv-* draw and pop
            // animations are gated on that attribute, so without it the SVGs
            // render in their finished resting state. Replaying a 0.9s stroke
            // draw on every 1.8s slide change would look broken.
            className="absolute inset-0 transition-opacity duration-300 ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <Visual accent={accent} className="h-full w-full" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
          {slides[index]?.label}
        </span>
        {slides.length > 1 && (
          <span className="flex gap-1.5">
            {slides.map(({ label }, i) => (
              <span
                key={label}
                className="h-1 w-1 rounded-full transition-colors duration-300"
                style={{ backgroundColor: i === index ? accent : "var(--border)" }}
              />
            ))}
          </span>
        )}
      </div>
    </>
  );
}
