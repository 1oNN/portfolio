import type {
  Project,
  Experience,
  Education,
  Publication,
} from "@/types";

// Order is the display order everywhere: the home list, /projects, and the
// sitemap. The first two are the lead pair - the shipped product and the
// dissertation - and /projects gives them the large panes.
export const PROJECTS: Project[] = [
  {
    id: "jobzyl",
    title: "Jobzyl",
    tagline: "One search across 20 job boards, with ATS resume matching",
    longDescription:
      "Jobzyl searches 20 live job boards in parallel - Reed, Adzuna, Careerjet, Jooble, USAJobs and 15 more, covering 60+ countries - and streams results over SSE as each board responds, first results in about 1.4s. It is live fan-out over a warm cache: scheduled 6-hourly refreshes keep results fresh between searches. Application tracking (Saved → Applied → Interview → Offer → Rejected), client-side ATS resume matching (the CV is only sent to the server if saved to an account, encrypted at rest), Supabase Auth (email + Google + LinkedIn OAuth, PKCE) with row-level security on every table. AWS App Runner backend, static-export frontend behind CDN.",
    tech: ["Next.js", "React.js", "TypeScript", "FastAPI", "Supabase", "PostgreSQL", "Python", "Tailwind CSS", "AWS"],
    category: "fullstack",
    featured: true,
    liveUrl: "https://jobzyl.com",
    metrics: [
      { value: "20", label: "Job boards searched" },
      { value: "60+", label: "Countries covered" },
      { value: "~1.4s", label: "First results streamed" },
    ],
  },
  {
    id: "finlaw-uk",
    title: "FinLaw-UK",
    tagline: "Graph-augmented RAG for UK financial regulation",
    longDescription:
      "FinLaw-UK is my MSc dissertation - a graph-augmented RAG pipeline over PRA/FCA/FRC and statutory corpora. Every clause lives twice: as a Neo4j graph node for structural precision and as a dense embedding for semantic recall; the graph then acts as a validation layer that deprioritises retrieved clauses without graph support and flags uncited rules as potential hallucinations.",
    tech: ["Python", "Mistral 7B", "Ollama", "Neo4j", "RAG", "Sentence Transformers", "RAGAS", "React.js", "JavaScript"],
    category: "research",
    featured: true,
    githubUrl: "https://github.com/1oNN/finlaw-uk",
    metrics: [
      { value: "0.82", label: "Source accuracy" },
      { value: "0.76", label: "RAGAS faithfulness" },
      { value: "0.74", label: "Answer relevance" },
    ],
  },
  {
    id: "ai-voice-agent",
    title: "Autonomous Voice Agent",
    tagline: "Cutting voice-agent latency 54%, from 2.4s to 1.1s",
    longDescription:
      "Built at Outlyst - FastAPI inference backend for a Retell AI voice agent. Profiled with py-spy to isolate event-loop blocking, restructured asyncpg connection pools, and parallelised tool calls with asyncio.gather(). Mean call latency fell from 2.4s to 1.1s across 2,100+ outbound calls.",
    tech: ["Python", "FastAPI", "Retell AI", "AsyncIO", "PostgreSQL", "Docker", "Linux", "CI/CD"],
    category: "engineering",
    featured: true,
    // Proprietary Outlyst work - deliberately no public repo link
    // 2,100+ is call VOLUME over the ~6-month contract, not concurrency. The
    // site previously read it as simultaneous sessions, which is a different
    // and unmeasured claim - do not reintroduce "concurrent" here.
    metrics: [
      { value: "54%", label: "Latency reduction" },
      { value: "2,100+", label: "Calls handled" },
      { value: "1.1s", label: "Mean call latency" },
    ],
  },
  {
    id: "diabetes-risk",
    title: "DiabetesSense",
    tagline: "93% accurate diabetes risk screening from an 11-model benchmark",
    // Accuracy is shown rounded to 93%. The precise 93.15% is retained only in
    // the 11-model comparison chart, where it sits in the context of every
    // other model's score rather than standing alone as a headline.
    longDescription:
      "BSc thesis at COMSATS - benchmarked 11 classifiers on BRFSS 2015 (253,680 records, 86/14 class imbalance, resampling confined to the training folds). Random Forest led at 93% accuracy and was strongest on ROC-AUC and sensitivity. Shipped as a React.js + Flask app with a 19-question, lab-free risk questionnaire.",
    tech: ["Python", "scikit-learn", "React.js", "JavaScript", "Flask", "REST API", "pandas"],
    category: "ml",
    featured: true,
    githubUrl: "https://github.com/1oNN/diabetes-app",
    metrics: [
      { value: "93%", label: "Accuracy (Random Forest)" },
      { value: "11", label: "Models benchmarked" },
      { value: "253,680", label: "CDC BRFSS records" },
    ],
  },
  {
    id: "voiceflow",
    title: "VoiceFlow",
    tagline: "Retell call exporter with local Whisper transcription",
    longDescription:
      "Companion tooling for the Retell stack: a FastAPI + Next.js tool that exports call recordings and metadata, then transcribes them with locally-run Whisper (large-v3, GPU-accelerated when available). Call audio never leaves the machine; an async job manager streams progress and logs over server-sent events.",
    tech: ["Python", "FastAPI", "Whisper", "Next.js", "React.js", "TypeScript", "SSE", "Docker", "Linux"],
    category: "engineering",
    featured: false,
    githubUrl: "https://github.com/1oNN/VoiceFlow",
    metrics: [
      { value: "local", label: "Whisper large-v3" },
      { value: "SSE", label: "Live job progress" },
    ],
  },
  {
    id: "sleep-efficiency",
    title: "Sleep Efficiency Predictor",
    tagline: "Published ML research served as a lifestyle-factor prediction app",
    longDescription:
      "Companion app to my peer-reviewed paper on ML methods for sleep-efficiency prediction. Four models compared on 452 study records; Random Forest won at R² 0.8569 / MSE 0.0027. The app takes age, sleep-stage percentages, awakenings, caffeine, alcohol, exercise, and smoking status, then returns an efficiency score, a classification, and recommendations keyed to the result.",
    tech: ["Python", "scikit-learn", "Random Forest", "Flask", "Docker", "Linux"],
    category: "research",
    featured: false,
    githubUrl: "https://github.com/1oNN/sleep-efficiency-app",
    metrics: [
      { value: "0.8569", label: "R² · Random Forest" },
      { value: "452", label: "Records · 15 features" },
    ],
  },
];

export const EXPERIENCE: Experience[] = [
  {
    // Not an employment entry: "Independent" as a company read as a job title
    // the CV does not support. Framed as self-directed project work, and
    // cross-referenced to the case study so the same work does not look like
    // two separate things.
    id: "independent-jobzyl",
    company: "Jobzyl",
    role: "Independent project work",
    type: "engineering",
    location: "Bradford, UK",
    startDate: "Apr 2026",
    endDate: "Present",
    current: true,
    responsibilities: [
      "Self-directed build, shipped to jobzyl.com - the full case study is under Projects.",
      "Designed a multi-tenant job aggregator searching 20 live boards across 60+ countries in parallel, with first results in about 1.4 seconds.",
      "Built the aggregation layer as a FastAPI service on AWS App Runner: per-board rate limits, Server-Sent Events streaming search progress as each board responds, and scheduled 6-hourly cache refreshes behind the live fan-out.",
      "Implemented ATS scoring that runs client-side - the CV is parsed in-browser and only sent to the server if the user saves it to their account, where it is encrypted at rest.",
      "Modelled multi-tenant data on Supabase Postgres with row-level security and PKCE OAuth.",
    ],
  },
  {
    id: "outlyst",
    company: "Outlyst",
    role: "AI / Machine Learning Engineer",
    type: "engineering",
    location: "Leeds, UK (Remote)",
    startDate: "Oct 2025",
    endDate: "Mar 2026",
    current: false,
    responsibilities: [
      "Engineered and optimized the inference architecture for an autonomous AI voice agent (Retell AI, FastAPI), handling 2,100+ outbound calls.",
      "Enhanced agent capabilities to detect gatekeepers and schedule callbacks rather than dead-ending the transfer.",
      "Conducted rigorous backend profiling to isolate inefficient asynchronous I/O and connection pooling, driving a 54% reduction in systemic latency (2.4s → 1.1s).",
      "Built an internal micro-CRM with automated contact-extraction pipelines, removing external CRM licensing costs.",
    ],
  },
  {
    id: "bradford-ra",
    company: "University of Bradford",
    role: "Research Assistant - Machine Learning",
    type: "research",
    location: "Bradford, UK",
    startDate: "Jan 2025",
    endDate: "Sep 2025",
    current: false,
    responsibilities: [
      "Engineered FinLaw-UK, a Retrieval-Augmented Generation architecture integrating Mistral 7B-Instruct with a Neo4j knowledge graph for domain-aware regulatory retrieval. This work was also my MSc dissertation project - the Education and Experience entries describe the same system, not two.",
      "Built a hybrid retrieval pipeline: BM25 sparse retrieval fused with BGE-small dense embeddings via reciprocal rank fusion, then cross-encoder re-ranking, with graph-grounded citation verification over Neo4j.",
      "Evaluated on a 110-item regulatory benchmark: 0.76 faithfulness and 0.74 answer relevance (RAGAS), 0.82 source accuracy, 0.81 citation quality.",
      "Built reproducible experimental pipelines with structured evaluation protocols, extending RAGAS with custom citation-precision and legal-completeness metrics.",
    ],
  },
  {
    id: "comsats-ra",
    company: "COMSATS University Islamabad",
    role: "Research Assistant - Data Science",
    type: "research",
    location: "Islamabad, Pakistan",
    startDate: "Jul 2023",
    endDate: "Jul 2024",
    current: false,
    responsibilities: [
      "Benchmarked 11 ML classifiers for diabetes risk on 253,680 CDC BRFSS records, resampling confined to the training folds; Random Forest led at 93% accuracy and performed best on ROC-AUC and sensitivity.",
      "Deployed predictive models via REST APIs with correlation-driven risk-factor analysis surfacing the drivers behind each score.",
      "Built a production web interface (React.js + Flask) for real-time clinical risk scoring.",
      "First and corresponding author on a Springer conference paper; presented at ICSMAI 2024, Saidia, Morocco.",
    ],
  },
];

export const EDUCATION: Education[] = [
  {
    id: "bradford-msc",
    institution: "University of Bradford",
    degree: "MSc",
    field: "Applied Artificial Intelligence & Data Analytics",
    location: "Bradford, UK",
    startDate: "Sep 2024",
    endDate: "Sep 2025",
    dissertation:
      "FinLaw-UK: A Graph-Augmented Retrieval Chatbot for Reliable and Transparent UK Financial Regulation",
    focus:
      "Modules - Artificial Intelligence and Data Science (79), Business Data Analytics (79), Responsible AI: Ethics, Law and Governance (75)",
  },
  {
    id: "comsats-bs",
    institution: "COMSATS University Islamabad",
    degree: "BS",
    field: "Bioinformatics",
    location: "Islamabad, Pakistan",
    startDate: "Sep 2020",
    endDate: "Jul 2024",
    dissertation: "AI-Assisted Analysis and Prediction of At-Risk Diabetic Individuals",
    focus: "Predictive analytics, interpretability, biological impact modelling",
  },
];

export const PUBLICATIONS: Publication[] = [
  {
    id: "sleep-efficiency",
    title:
      "Comparative Analysis of Machine Learning Methods for Enhancing Sleep Efficiency and Prediction",
    authors: "Ahmad, H. (first & corresponding author), Khan, M.U., Azam, M.",
    venue:
      "ICSMAI 2024. In: Information Systems Engineering and Management, vol 12, eds. Serrhini & Ghoumid. Springer, Cham, pp. 3-15",
    year: "2024",
    doi: "10.1007/978-3-031-66854-8_1",
    type: "conference",
  },
];

/**
 * Skills, grouped as both CVs group them so the two can be diffed at a glance.
 * Every entry here appears on at least one CV - do not add anything that does
 * not, and do not drop anything that does.
 *
 * `alias` exists only where the CV's wording differs from the string used in a
 * project's `tech` array; the Skills section matches on it to work out which
 * projects evidence a given skill. A skill with no matching project simply
 * shows no project list, which is the honest outcome rather than a hidden one.
 */
export interface Skill {
  name: string;
  alias?: string[];
  /**
   * Explicit project ids for capabilities that are genuinely part of a build
   * but are not a named dependency, so they never appear in a `tech` array -
   * the retrieval techniques in FinLaw-UK, for instance. Listed here rather
   * than padded into `tech` so the project cards stay readable.
   */
  usedIn?: string[];
}

export const SKILL_GROUPS: { label: string; skills: Skill[] }[] = [
  {
    label: "Machine learning, NLP & LLMs",
    skills: [
      { name: "PyTorch" },
      { name: "TensorFlow" },
      { name: "scikit-learn" },
      { name: "XGBoost" },
      { name: "LightGBM" },
      { name: "RAG" },
      { name: "Sentence Transformers" },
      { name: "Cross-encoder re-ranking", usedIn: ["finlaw-uk"] },
      { name: "RAGAS", alias: ["RAGAS"] },
      { name: "Vector embeddings", usedIn: ["finlaw-uk"] },
      { name: "Semantic search", usedIn: ["finlaw-uk"] },
      { name: "Ensemble methods", alias: ["Random Forest"] },
      { name: "Ollama" },
      { name: "Whisper" },
    ],
  },
  {
    label: "Engineering & data",
    skills: [
      { name: "Python" },
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "C++" },
      { name: "SQL" },
      { name: "FastAPI" },
      { name: "Flask" },
      { name: "REST APIs", alias: ["REST API"] },
      { name: "React", alias: ["React.js"] },
      { name: "Next.js" },
      { name: "PostgreSQL" },
      { name: "Supabase" },
      { name: "Neo4j" },
      { name: "pandas / NumPy", alias: ["pandas"] },
    ],
  },
  {
    label: "MLOps, cloud & DevOps",
    skills: [
      { name: "MLflow" },
      { name: "Docker" },
      { name: "Git" },
      { name: "GitHub Actions", alias: ["CI/CD"] },
      { name: "AWS", alias: ["AWS"] },
      { name: "GCP" },
      { name: "Linux" },
    ],
  },
];

export const CONTACT_EMAIL = "hammadahmad.ml@gmail.com";

export const ORCID_ID = "0009-0000-7873-4977";
export const ORCID_URL = `https://orcid.org/${ORCID_ID}`;

export const SOCIAL_LINKS = [
  { platform: "GitHub", url: "https://github.com/1oNN", icon: "FiGithub" },
  { platform: "LinkedIn", url: "https://linkedin.com/in/hammadahmad123", icon: "FiLinkedin" },
  { platform: "ORCID", url: ORCID_URL, icon: "SiOrcid" },
  { platform: "Email", url: `mailto:${CONTACT_EMAIL}`, icon: "FiMail" },
] as const;

export const AGENT_SUGGESTIONS = [
  "What's your strongest ML project?",
  "How did you reduce latency by 54%?",
  "Tell me about FinLaw-UK",
  "What's your experience with RAG systems?",
  "Are you open to PhD opportunities?",
  "What's your tech stack?",
] as const;

// Mini-terminal easter egg commands (Ctrl+`)
export const TERMINAL_COMMANDS: Record<string, string> = {
  help: "Available commands: about, skills, experience, contact, whoami, ls, pwd, date, clear, exit",
  about:
    "Hammad Ahmad - AI/ML Engineer & Researcher.\nMSc Applied AI @ University of Bradford.\nSpecialising in LLMs, RAG systems, and latency optimisation.",
  skills:
    "Core: Python · PyTorch · FastAPI · Neo4j · RAG · LLMs\nAlso: TypeScript · React · Docker · AWS · PostgreSQL",
  experience:
    "→ Independent (Apr 2026-present): AI / Machine Learning Engineer, Jobzyl\n→ Outlyst (Oct 2025 - Mar 2026): AI / Machine Learning Engineer\n→ University of Bradford (Jan-Sep 2025): Research Assistant (ML)\n→ COMSATS University (Jul 2023-Jul 2024): Research Assistant (Data Science)",
  contact:
    "Email: hammadahmad.ml@gmail.com\nLinkedIn: linkedin.com/in/hammadahmad123\nGitHub: github.com/1oNN",
  whoami: "hammad@portfolio:~$",
  ls: "about.md  skills.json  projects/  research/  contact.txt",
  pwd: "/home/hammad/portfolio",
  date: new Date().toUTCString(),
};
