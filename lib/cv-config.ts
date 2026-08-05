export interface CvEntry {
  label: string;
  href: string;
  cvType: "ai-ml" | "data-scientist" | "research-phd";
}

// Drop the matching PDF into `public/cv/` before committing an entry here -
// the About section chips, the agent prompt, and the track-download API
// validation all read this list.
export const AVAILABLE_CVS: CvEntry[] = [
  {
    label: "Download CV",
    href: "/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf",
    cvType: "ai-ml",
  },
];
