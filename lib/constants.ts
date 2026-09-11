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
    tagline: "One search across 29 job sources, with semantic CV matching",
    longDescription:
      "Jobzyl searches 29 integrated sources in one query - 23 job boards plus six applicant tracking systems read directly, so a company's own careers page is a source rather than an aggregator's copy of it - over a 3.4M row Postgres index spanning 26 countries. The fan-out is parallel with a per-provider timeout and streams back over SSE, so you can see which boards have answered while the rest are still going. Results are deduped across sources on a shared identity key, ranked by a weighted Postgres full-text function that puts the title above the description, and filtered on 11 dimensions with facet counts that apply every filter except the one being counted. The work that mattered was refusing to state what the data cannot support: pay renders in the period the employer quoted or not at all, one provider's own predicted salaries are excluded from aggregation, a liveness sweep marks a posting dead only on positive evidence, and a posting naming no recognised skill reports as too thin to score rather than as a confident 0% match. ATS keyword scoring parses the CV in the browser and uploads nothing; semantic matching (384-dimension multilingual embeddings in pgvector) and Claude scoring are opt-in, and need an account where the CV is Fernet-encrypted at rest. Seven-stage Kanban tracker, email alerts, Supabase Auth (email plus Google, LinkedIn and GitHub OAuth, PKCE) with row-level security on all 23 tables, behind 1,950 automated tests and 11 CI build gates. FastAPI on AWS App Runner, static-export frontend behind a CDN.",
    tech: ["Next.js", "React.js", "TypeScript", "FastAPI", "Supabase", "PostgreSQL", "Python", "Tailwind CSS", "AWS"],
    category: "fullstack",
    featured: true,
    liveUrl: "https://jobzyl.com",
    // Measured, not estimated - these are the figures the CV carries. Row count
    // is the whole index rather than a live-posting claim, because liveness has
    // been probed on a fraction of it. The country figure counts countries with
    // rows in the index, not search regions: an earlier "60+" came from counting
    // distinct location strings and is withdrawn. There is no first-result
    // timing here on purpose - nothing has timed it since June.
    metrics: [
      { value: "3.4M", label: "Rows in the index" },
      { value: "29", label: "Sources integrated" },
      { value: "26", label: "Countries covered" },
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
    // Only re-measured figures. Source accuracy and citation quality were
    // withdrawn: that scorer was a shape-check, not a correctness measure.
    metrics: [
      { value: "0.76", label: "RAGAS faithfulness" },
      { value: "0.74", label: "Answer relevance" },
      { value: "0.68", label: "Legal completeness" },
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

// Follows the CV. Jobzyl has moved between this list and PROJECTS twice now,
// because the CV kept changing its mind about whether founding it is a role;
// the current CV opens Experience with it, so it is a role here as well as a
// project. If it moves again, move it here first and let PROJECTS keep its own
// entry - the two are not exclusive.
export const EXPERIENCE: Experience[] = [
  {
    id: "jobzyl",
    company: "Jobzyl",
    role: "Founder & Sole Engineer",
    type: "engineering",
    location: "Bradford, UK",
    startDate: "May 2026",
    endDate: "Present",
    current: true,
    responsibilities: [
      "Build and operate a live, public job search aggregator end to end: 29 provider integrations and 6 applicant tracking systems, a 3.4M row Postgres index across 26 countries, FastAPI backend, Next.js frontend and AWS deploy pipeline.",
      "Shipped semantic CV-to-posting matching in production: 384-dimension multilingual sentence embeddings over pgvector against the full corpus, gated so a posting naming no recognised skill reports as too thin to score rather than a confident 0%.",
      "Built the LLM layer on Anthropic Claude (CV scoring, cover letter, interview prep), with prompt-injection defences on every call, per-user quotas and documented fail-open behaviour.",
      "Trained a pay regression model against the shipped salary benchmark as baseline, split by employer group to prevent leakage: MAE 27,420 to 24,001, MdAPE 18.9% to 16.4%. Reported per country and seniority, and held back from deployment.",
      "Rebuilt search ranking as a weighted Postgres full-text function with a title-relevance layer, after measuring that 27.4% of returned results had none of the user's query terms in the job title.",
      "Hardened the platform: Fernet field encryption of CV text, row-level security across 23 tables, GDPR export and deletion, behind 1,950 automated tests and 11 CI build gates.",
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
      "Built VoiceFlow, a FastAPI service running Whisper large-v3 in-process over the 2,100+ call recordings, threading each export so blocking downloads and torch inference stay off the asyncio event loop.",
    ],
  },
  {
    // The CV no longer lists this as a role. FinLaw-UK was the MSc dissertation,
    // and it is carried by PROJECTS, its case study and the EDUCATION entry, so
    // dropping the Experience entry loses no detail. The old bradford-ra entry
    // said as much in its own first bullet.
    id: "comsats-intern",
    company: "COMSATS University Islamabad",
    // A three-month summer internship. The site previously ran it to Jul 2024
    // and hung the diabetes thesis off it; the CV now separates the two, and
    // the thesis is its own final-year project.
    role: "Data Science Intern",
    // Still typed research, not internship: the badge is about the kind of work
    // (it produced the Springer paper), and "internship" would recolour it into
    // the engineering palette.
    type: "research",
    location: "Islamabad, Pakistan",
    startDate: "Jul 2023",
    endDate: "Sep 2023",
    current: false,
    responsibilities: [
      "Implemented and compared machine learning models for sleep-efficiency prediction in Python (scikit-learn, pandas, NumPy): four models over 452 study records, Random Forest strongest at R² 0.8569.",
      "Developed the work into a first and corresponding author Springer paper, presented at ICSMAI 2024 in Saidia, Morocco.",
    ],
  },
];

export const EDUCATION: Education[] = [
  {
    id: "bradford-msc",
    institution: "University of Bradford",
    degree: "MSc",
    // "(Merit)" per both CVs - the classification was missing from the site.
    field: "Artificial Intelligence (Merit)",
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
 * Skills, grouped and ordered exactly as the CV groups them, so the two can be
 * diffed at a glance. Every entry here appears on the CV - do not add anything
 * that does not, and do not drop anything that does.
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
      { name: "scikit-learn" },
      { name: "XGBoost" },
      { name: "Sentence Transformers" },
      { name: "fastembed (ONNX)", usedIn: ["jobzyl"] },
      { name: "pgvector", usedIn: ["jobzyl"] },
      { name: "Semantic search", usedIn: ["finlaw-uk", "jobzyl"] },
      { name: "RAG" },
      { name: "Cross-encoder re-ranking", usedIn: ["finlaw-uk"] },
      { name: "RAGAS", alias: ["RAGAS"] },
      { name: "Anthropic Claude API", usedIn: ["jobzyl"] },
      { name: "Ollama" },
      { name: "Whisper" },
    ],
  },
  {
    label: "Engineering & data",
    skills: [
      { name: "Python" },
      { name: "TypeScript" },
      { name: "SQL" },
      { name: "PL/pgSQL", usedIn: ["jobzyl"] },
      { name: "FastAPI" },
      { name: "asyncio", alias: ["AsyncIO"] },
      { name: "Flask" },
      { name: "REST APIs", alias: ["REST API"] },
      { name: "PostgreSQL" },
      { name: "Postgres full-text search", usedIn: ["jobzyl"] },
      { name: "Supabase" },
      { name: "Neo4j" },
      { name: "Next.js" },
      { name: "React", alias: ["React.js"] },
      { name: "pandas / NumPy", alias: ["pandas"] },
    ],
  },
  {
    label: "Infrastructure & quality",
    skills: [
      { name: "AWS", alias: ["AWS"] },
      { name: "Oracle Cloud" },
      { name: "Docker" },
      { name: "Git" },
      { name: "Linux" },
      { name: "CI build gates", alias: ["CI/CD"], usedIn: ["jobzyl"] },
      { name: "pytest", usedIn: ["jobzyl"] },
      { name: "Playwright", usedIn: ["jobzyl"] },
      { name: "Sentry", usedIn: ["jobzyl"] },
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

// TERMINAL_COMMANDS was removed with the fake command shell. Ctrl+K now opens
// the real agent console (AgentConsole.tsx) instead - one console, not two, and
// no hand-maintained duplicate of the experience list to fall out of date.
