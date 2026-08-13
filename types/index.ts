// ─── Domain Models ────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  tagline: string;
  longDescription: string;
  tech: string[];
  category: "ml" | "fullstack" | "research" | "engineering";
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  metrics?: ProjectMetric[];
}

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface CaseStudyDecision {
  title: string;
  body: string;
}

export interface CaseStudy {
  projectId: string;
  accent: string;
  status: string;
  timeline: string;
  role: string;
  primaryStack: string[];
  /**
   * One line each, above the long-form prose. `tackles` is the problem in the
   * reader's terms, `delivers` is the measured outcome - both condensed from
   * the `problem` and `results` arrays below, never claiming anything they do
   * not. Most visitors read these two lines and nothing else.
   */
  tackles: string;
  delivers: string;
  /**
   * First-person account of why this got built, in the owner's own words.
   * Runs above the technical sections, because the reason usually lands harder
   * than the architecture. Only set where the owner has actually said why -
   * never inferred from the code or written on his behalf.
   */
  whyIBuiltIt?: string[];
  links: {
    github?: string;
    live?: string;
    paper?: string;
    docs?: string;
  };
  problem: string[];
  approach: string[];
  decisions: CaseStudyDecision[];
  results: string[];
  reflections: string[];
  related: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  type: "research" | "engineering" | "internship";
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  dissertation?: string;
  focus?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  doi?: string;
  type: "conference" | "journal" | "chapter";
}

// ─── Terminal / RAG Agent ─────────────────────────────────────────

export type TerminalRole = "user" | "assistant" | "system";

export interface TerminalMessage {
  id: string;
  role: TerminalRole;
  content: string;
  timestamp: Date;
}

// ─── API Contracts ────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

// ─── Blog ─────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  type: "blog" | "case-study";
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
