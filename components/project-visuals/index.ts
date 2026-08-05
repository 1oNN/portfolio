import type { ComponentType } from "react";
import { FinLawHero, FinLawArchitecture } from "./FinLawVisuals";
import { VoiceAgentHero, VoiceAgentArchitecture } from "./VoiceAgentVisuals";
import { DiabetesSenseHero, DiabetesSenseArchitecture } from "./DiabetesSenseVisuals";
import { JobzylHero, JobzylArchitecture } from "./JobzylVisuals";
import { VoiceFlowHero, VoiceFlowArchitecture } from "./VoiceFlowVisuals";
import { SleepEfficiencyHero, SleepEfficiencyArchitecture } from "./SleepEfficiencyVisuals";
import {
  FinLawResults,
  DiabetesSenseResults,
  VoiceAgentResults,
  SleepEfficiencyResults,
} from "./ResultsCharts";
import FinLawBenchmarkExplorer from "./FinLawBenchmarkExplorer";
import DiabetesFactorExplorer from "./DiabetesFactorExplorer";

interface VisualProps {
  accent: string;
  className?: string;
}

interface ProjectVisuals {
  Hero: ComponentType<VisualProps>;
  Architecture: ComponentType<VisualProps>;
  /** Optional results chart rendered above the Results prose. Jobzyl has no
      quantitative results worth charting - forcing one would be noise. */
  Results?: ComponentType<VisualProps>;
  /** Optional interactive demo rendered as its own section between Approach
      and Key decisions. Must only surface verified data - never generated
      output. */
  Demo?: ComponentType<VisualProps>;
  demoHeader?: { eyebrow: string; title: string };
}

export const PROJECT_VISUALS: Record<string, ProjectVisuals> = {
  "finlaw-uk": {
    Hero: FinLawHero,
    Architecture: FinLawArchitecture,
    Results: FinLawResults,
    Demo: FinLawBenchmarkExplorer,
    demoHeader: { eyebrow: "Try it", title: "Explore the benchmark" },
  },
  "ai-voice-agent": { Hero: VoiceAgentHero, Architecture: VoiceAgentArchitecture, Results: VoiceAgentResults },
  "diabetes-risk": {
    Hero: DiabetesSenseHero,
    Architecture: DiabetesSenseArchitecture,
    Results: DiabetesSenseResults,
    Demo: DiabetesFactorExplorer,
    demoHeader: { eyebrow: "Try it", title: "Explore the risk factors" },
  },
  jobzyl: { Hero: JobzylHero, Architecture: JobzylArchitecture },
  voiceflow: { Hero: VoiceFlowHero, Architecture: VoiceFlowArchitecture },
  "sleep-efficiency": {
    Hero: SleepEfficiencyHero,
    Architecture: SleepEfficiencyArchitecture,
    Results: SleepEfficiencyResults,
  },
};

export function getProjectVisuals(projectId: string): ProjectVisuals | undefined {
  return PROJECT_VISUALS[projectId];
}
