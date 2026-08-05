import type { ComponentType } from "react";
import { FinLawHero, FinLawArchitecture } from "./FinLawVisuals";
import { VoiceAgentHero, VoiceAgentArchitecture } from "./VoiceAgentVisuals";
import { DiabetesSenseHero, DiabetesSenseArchitecture } from "./DiabetesSenseVisuals";
import { JobzylHero, JobzylArchitecture } from "./JobzylVisuals";
import { VoiceFlowHero, VoiceFlowArchitecture } from "./VoiceFlowVisuals";
import { FinLawResults, DiabetesSenseResults, VoiceAgentResults } from "./ResultsCharts";

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
}

export const PROJECT_VISUALS: Record<string, ProjectVisuals> = {
  "finlaw-uk": { Hero: FinLawHero, Architecture: FinLawArchitecture, Results: FinLawResults },
  "ai-voice-agent": { Hero: VoiceAgentHero, Architecture: VoiceAgentArchitecture, Results: VoiceAgentResults },
  "diabetes-risk": { Hero: DiabetesSenseHero, Architecture: DiabetesSenseArchitecture, Results: DiabetesSenseResults },
  jobzyl: { Hero: JobzylHero, Architecture: JobzylArchitecture },
  voiceflow: { Hero: VoiceFlowHero, Architecture: VoiceFlowArchitecture },
};

export function getProjectVisuals(projectId: string): ProjectVisuals | undefined {
  return PROJECT_VISUALS[projectId];
}
