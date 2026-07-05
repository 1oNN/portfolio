// ─── Domain Models ────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  tech: string[];
  category: "ml" | "fullstack" | "research" | "engineering";
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  highlights: string[];
  metrics?: ProjectMetric[];
  bentoSize: "large" | "medium" | "small";
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

// ─── UI Primitives ────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
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
