export interface CvEntry {
  label: string;
  href: string;
  cvType: "ai-ml" | "data-scientist" | "research-phd";
}

// Drop the matching PDF into `public/cv/` before committing an entry here -
// the About section chips, the agent prompt, and the track-download API
// validation all read this list.
// One CV now, so the label is plain. The audience labels ("engineering roles"
// / "research / PhD") existed because two PDFs shipped and the visitor had to
// pick; with a single file that phrasing only raises the question of where the
// other one went.
export const AVAILABLE_CVS: CvEntry[] = [
  {
    label: "Download CV",
    href: "/cv/Hammad_Ahmad_CV.pdf",
    cvType: "ai-ml",
  },
];
