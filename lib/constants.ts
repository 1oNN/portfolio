import type {
  Project,
  Experience,
  Education,
  Publication,
} from "@/types";

export const PROJECTS: Project[] = [
  {
    id: "finlaw-uk",
    title: "FinLaw-UK",
    tagline: "Graph-augmented RAG for UK financial regulation",
    longDescription:
      "FinLaw-UK is my MSc dissertation - a graph-augmented RAG pipeline over PRA/FCA/FRC and statutory corpora. Every clause lives twice: as a Neo4j graph node for structural precision and as a dense embedding for semantic recall; the graph then acts as a validation layer that deprioritises retrieved clauses without graph support and flags uncited rules as potential hallucinations.",
    tech: ["Python", "Mistral 7B", "Ollama", "Neo4j", "RAG", "Sentence Transformers", "RAGAS", "React.js"],
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
    tagline: "2,100+ concurrent AI sales calls at 1.1s latency",
    longDescription:
      "Built at Outlyst - FastAPI inference backend for a Retell AI voice agent. Profiled with py-spy to isolate event-loop blocking, restructured asyncpg connection pools, and parallelised tool calls with asyncio.gather(). 2,100+ concurrent stateful sessions.",
    tech: ["Python", "FastAPI", "Retell AI", "AsyncIO", "PostgreSQL", "Docker", "CI/CD"],
    category: "engineering",
    featured: true,
    // Proprietary Outlyst work - deliberately no public repo link
    metrics: [
      { value: "54%", label: "Latency reduction" },
      { value: "2,100+", label: "Concurrent sessions" },
      { value: "25%", label: "Lead conversion lift" },
    ],
  },
  {
    id: "diabetes-risk",
    title: "DiabetesSense",
    tagline: "93% accurate diabetes risk prediction from an 11-model benchmark",
    longDescription:
      "BSc thesis at COMSATS - benchmarked 11 classifiers on BRFSS 2015 (253,680 records, 86/14 class imbalance handled with random over-sampling). Random Forest won: 93.15% accuracy, 98.4% sensitivity, 0.9887 AUC. Shipped as a React.js + Flask app with a 19-question, lab-free risk questionnaire; SHAP/LIME attribution applied during the follow-on research assistantship.",
    tech: ["Python", "scikit-learn", "SHAP", "React.js", "Flask", "REST API", "pandas"],
    category: "ml",
    featured: true,
    githubUrl: "https://github.com/1oNN/diabetes-app",
    metrics: [
      { value: "93.15%", label: "Accuracy (Random Forest)" },
      { value: "0.99", label: "AUC" },
      { value: "253K", label: "Health records" },
    ],
  },
  {
    id: "jobzyl",
    title: "Jobzyl",
    tagline: "One search across 20 job boards, with ATS resume matching",
    longDescription:
      "Jobzyl searches 20 live job boards in parallel - Indeed, Reed, Adzuna, Careerjet, Jooble, USAJobs and more, covering 60+ countries - and streams results over SSE as each board responds, first results in about 1.4s. Application tracking (Saved → Applied → Interview → Offer → Rejected), 100% client-side ATS resume matching, Supabase Auth (email + Google + LinkedIn OAuth, PKCE) with row-level security on every table. AWS App Runner backend, static-export frontend behind CDN.",
    tech: ["Next.js", "FastAPI", "Supabase", "PostgreSQL", "Python", "Tailwind CSS", "AWS"],
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
    id: "voiceflow",
    title: "VoiceFlow",
    tagline: "Retell call exporter with local Whisper transcription",
    longDescription:
      "Companion tooling for the Retell stack: a FastAPI + Next.js tool that exports call recordings and metadata, then transcribes them with locally-run Whisper (large-v3, GPU-accelerated when available). Call audio never leaves the machine; an async job manager streams progress and logs over server-sent events.",
    tech: ["Python", "FastAPI", "Whisper", "Next.js", "SSE", "Docker"],
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
    tech: ["Python", "scikit-learn", "Random Forest", "Flask", "Docker"],
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
    id: "outlyst",
    company: "Outlyst",
    role: "AI / Machine Learning Engineer",
    type: "engineering",
    location: "Leeds, UK (Remote)",
    startDate: "Oct 2025",
    endDate: "Mar 2026",
    current: false,
    responsibilities: [
      "Engineered and optimized the inference architecture for an autonomous AI voice agent (Retell AI, FastAPI), mitigating bottlenecks to support 2,100+ concurrent stateful interactions.",
      "Enhanced agent capabilities to detect gatekeepers and schedule callbacks, boosting lead conversions by ~25% and generating 27 qualified leads.",
      "Conducted rigorous backend profiling to isolate inefficient asynchronous I/O and connection pooling, driving a 54% reduction in systemic latency (2.4s → 1.1s).",
      "Built an internal micro-CRM, modeling and syncing structured contact data via automated extraction pipelines to save 100+ staff hours/week.",
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
      "Engineered FinLaw-UK, a Retrieval-Augmented Generation architecture integrating Mistral 7B-Instruct with a Neo4j knowledge graph for domain-aware regulatory retrieval.",
      "Designed multi-modal representation learning pipelines using graph-augmented models and cross-encoder re-ranking architectures.",
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
      "Benchmarked 11 ML classifiers for diabetes risk prediction on 253,680 CDC records; Random Forest best at 93.15% accuracy and 0.9887 AUC.",
      "Deployed predictive models via REST APIs with SHAP-based interpretability for algorithmic transparency.",
      "Built a production web interface (React.js + Flask) for real-time clinical risk scoring.",
      "Co-authored Springer book chapter; presented results at ICSMAI 2024, Casablanca, Morocco.",
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
    focus: "Spatial and relational data modelling, graph networks, LLM evaluation, robustness benchmarking",
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
      "International Conference on Smart Medical, IoT & Artificial Intelligence (ICSMAI 2024), Springer Nature, pp. 3-15",
    year: "2024",
    doi: "10.1007/978-3-031-66854-8_1",
    type: "conference",
  },
];

export const CONTACT_EMAIL = "hammadahmad.ml@gmail.com";

export const SOCIAL_LINKS = [
  { platform: "GitHub", url: "https://github.com/1oNN", icon: "FiGithub" },
  { platform: "LinkedIn", url: "https://linkedin.com/in/hammadahmad123", icon: "FiLinkedin" },
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
    "Hammad Ahmad - AI/ML Engineer & Researcher.\nMSc Applied AI @ University of Bradford.\nSpecialising in LLMs, RAG systems, and high-performance ML infrastructure.",
  skills:
    "Core: Python · PyTorch · FastAPI · Neo4j · RAG · LLMs\nAlso: TypeScript · React · Docker · AWS · PostgreSQL",
  experience:
    "→ Outlyst (Oct 2025 - Mar 2026): AI / Machine Learning Engineer\n→ University of Bradford (Jan-Sep 2025): Research Assistant (ML)\n→ COMSATS University (Jul 2023-Jul 2024): Research Assistant (Data Science)",
  contact:
    "Email: hammadahmad.ml@gmail.com\nLinkedIn: linkedin.com/in/hammadahmad123\nGitHub: github.com/1oNN",
  whoami: "hammad@portfolio:~$",
  ls: "about.md  skills.json  projects/  research/  contact.txt",
  pwd: "/home/hammad/portfolio",
  date: new Date().toUTCString(),
};
