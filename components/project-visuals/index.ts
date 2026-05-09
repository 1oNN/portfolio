import type { ComponentType } from "react";
import { FinLawHero, FinLawArchitecture } from "./FinLawVisuals";
import { VoiceAgentHero, VoiceAgentArchitecture } from "./VoiceAgentVisuals";
import { DiabetesSenseHero, DiabetesSenseArchitecture } from "./DiabetesSenseVisuals";
import { JobzylHero, JobzylArchitecture } from "./JobzylVisuals";

interface VisualProps {
  accent: string;
  className?: string;
}

interface ProjectVisuals {
  Hero: ComponentType<VisualProps>;
  Architecture: ComponentType<VisualProps>;
}

export const PROJECT_VISUALS: Record<string, ProjectVisuals> = {
  "finlaw-uk": { Hero: FinLawHero, Architecture: FinLawArchitecture },
  "ai-voice-agent": { Hero: VoiceAgentHero, Architecture: VoiceAgentArchitecture },
  "diabetes-risk": { Hero: DiabetesSenseHero, Architecture: DiabetesSenseArchitecture },
  jobzyl: { Hero: JobzylHero, Architecture: JobzylArchitecture },
};

export function getProjectVisuals(projectId: string): ProjectVisuals | undefined {
  return PROJECT_VISUALS[projectId];
}
