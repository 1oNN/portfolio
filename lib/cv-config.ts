export interface CvEntry {
  label: string;
  href: string;
  cvType: "ai-ml" | "software-engineer" | "research-phd";
  primary?: boolean;
}

// No CVs are published yet. To publish one: drop the PDF into `public/cv/`
// and add an entry here - the About section and agent prompt will pick it up.
export const AVAILABLE_CVS: CvEntry[] = [];
