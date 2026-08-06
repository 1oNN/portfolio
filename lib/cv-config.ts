export interface CvEntry {
  label: string;
  href: string;
  cvType: "ai-ml" | "data-scientist" | "research-phd";
}

// Drop the matching PDF into `public/cv/` before committing an entry here -
// the About section chips, the agent prompt, and the track-download API
// validation all read this list.
// Labelled by audience, because the site courts two: hiring managers and
// research supervisors. An unlabelled "Download CV" made the visitor guess
// which one they were getting.
export const AVAILABLE_CVS: CvEntry[] = [
  {
    label: "CV - engineering roles",
    href: "/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf",
    cvType: "ai-ml",
  },
  {
    label: "CV - research / PhD",
    href: "/cv/Hammad_Ahmad_CV_Research.pdf",
    cvType: "research-phd",
  },
];
