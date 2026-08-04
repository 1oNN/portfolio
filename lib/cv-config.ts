export interface CvEntry {
  label: string;
  href: string;
  cvType: "ai-ml" | "data-scientist" | "research-phd";
  primary?: boolean;
}

// Drop the matching PDF into `public/cv/` before committing an entry here -
// the About section chips and the agent prompt both read this list.
// cvType values must match the validation list in app/api/track-download.
export const AVAILABLE_CVS: CvEntry[] = [
  {
    label: "Download CV",
    href: "/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf",
    cvType: "ai-ml",
    primary: true,
  },
];
