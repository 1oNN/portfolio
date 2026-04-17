import type {
  Project,
  Experience,
  Education,
  Publication,
  Skill,
  NavItem,
} from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Chat", href: "#agent" },
  { label: "Research", href: "#research" },
  { label: "Contact", href: "#contact" },
];

export const SKILLS: Skill[] = [
  { name: "Python", category: "languages", level: 5 },
  { name: "TypeScript", category: "languages", level: 4 },
  { name: "JavaScript", category: "languages", level: 4 },
  { name: "C++", category: "languages", level: 3 },
  { name: "SQL", category: "languages", level: 4 },
  { name: "PyTorch", category: "ai", level: 5 },
  { name: "TensorFlow", category: "ai", level: 4 },
  { name: "scikit-learn", category: "ai", level: 5 },
  { name: "LLMs / NLP", category: "ai", level: 5 },
  { name: "RAG", category: "ai", level: 5 },
  { name: "Retell AI", category: "ai", level: 4 },
  { name: "MLflow", category: "ai", level: 4 },
  { name: "FastAPI", category: "infrastructure", level: 5 },
  { name: "Docker", category: "infrastructure", level: 4 },
  { name: "CI/CD", category: "infrastructure", level: 4 },
  { name: "AWS", category: "infrastructure", level: 3 },
  { name: "GCP", category: "infrastructure", level: 3 },
  { name: "REST APIs", category: "infrastructure", level: 5 },
  { name: "Neo4j", category: "data", level: 4 },
  { name: "PostgreSQL", category: "data", level: 4 },
  { name: "MongoDB", category: "data", level: 3 },
  { name: "pandas / NumPy", category: "data", level: 5 },
  { name: "Sentence Transformers", category: "data", level: 4 },
  { name: "React.js", category: "frontend", level: 4 },
  { name: "Next.js", category: "frontend", level: 4 },
  { name: "Flask", category: "frontend", level: 4 },
];

export const SKILL_CATEGORIES = [
  { key: "languages", label: "Languages" },
  { key: "ai", label: "AI & ML" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "data", label: "Data Engineering" },
  { key: "frontend", label: "Frontend & APIs" },
] as const;

export const PROJECTS: Project[] = [
  {
    id: "finlaw-uk",
    title: "FinLaw-UK",
    tagline: "Graph-augmented RAG for UK financial regulation",
    description:
      "Production-grade RAG system combining Mistral 7B with a Neo4j knowledge graph to deliver faithful, cited answers on UK financial regulation.",
    longDescription:
      "FinLaw-UK is my MSc dissertation — a graph-augmented RAG pipeline built to tackle the complexity of FCA rulebooks and MiFID II. Dense retrieval + graph expansion significantly outperforms naive vector search on regulatory queries.",
    tech: ["Python", "Mistral 7B", "Neo4j", "RAG", "Sentence Transformers", "FastAPI", "RAGAS"],
    category: "research",
    featured: true,
    bentoSize: "large",
    metrics: [
      { value: "+19%", label: "Answer accuracy" },
      { value: "0.76", label: "RAGAS faithfulness" },
      { value: "0.74", label: "Answer relevance" },
    ],
    highlights: [
      "Integrated Mistral 7B-Instruct with a Neo4j knowledge graph for domain-aware retrieval",
      "Improved answer accuracy by 19% through fine-tuned prompt and retrieval strategies",
      "Achieved faithfulness score of 0.76 and answer relevance of 0.74 via RAGAS evaluation",
      "Built end-to-end: ingestion pipeline, graph construction, API, and evaluation harness",
    ],
    pipeline: {
      nodes: [
        { id: "query", label: "User Query", color: "#818cf8", x: 15, y: 45 },
        { id: "embed", label: "Sentence", sublabel: "Transformer", color: "#22d3ee", x: 28, y: 25 },
        { id: "neo4j", label: "Neo4j", sublabel: "Knowledge Graph", color: "#a78bfa", x: 55, y: 25 },
        { id: "mistral", label: "Mistral 7B", sublabel: "Instruct", color: "#f59e0b", x: 75, y: 45 },
        { id: "ragas", label: "RAGAS", sublabel: "Evaluation", color: "#10b981", x: 55, y: 70 },
        { id: "answer", label: "Answer +", sublabel: "Citations", color: "#818cf8", x: 85, y: 45 },
      ],
      edges: [
        { from: "query", to: "embed" },
        { from: "embed", to: "neo4j" },
        { from: "neo4j", to: "mistral" },
        { from: "mistral", to: "answer" },
        { from: "mistral", to: "ragas", animated: true },
      ],
    },
  },
  {
    id: "ai-voice-agent",
    title: "Autonomous Voice Agent",
    tagline: "2,100+ concurrent AI sales calls at 1.1s latency",
    description:
      "High-throughput outbound calling system with a 54% latency reduction achieved by profiling async I/O bottlenecks and restructuring connection pooling.",
    longDescription:
      "Built at Outlyst — FastAPI inference backend for a Retell AI voice agent. Profiled with py-spy to isolate event-loop blocking, restructured asyncpg connection pools, and parallelised tool calls with asyncio.gather(). 2,100+ concurrent stateful sessions.",
    tech: ["Python", "FastAPI", "Retell AI", "AsyncIO", "PostgreSQL", "Docker", "CI/CD"],
    category: "engineering",
    featured: true,
    bentoSize: "medium",
    metrics: [
      { value: "54%", label: "Latency reduction" },
      { value: "2,100+", label: "Concurrent sessions" },
      { value: "25%", label: "Lead conversion lift" },
    ],
    highlights: [
      "Reduced average call latency from 2.4s to 1.1s by fixing async I/O blocking and connection pool exhaustion",
      "Supported 2,100+ concurrent stateful websocket sessions without session drop",
      "Built gatekeeper-detection classifier to avoid wasted inference cycles",
      "Automated contact-sync pipeline saving 100+ staff hours/week",
    ],
    pipeline: {
      nodes: [
        { id: "caller", label: "Caller", color: "#94a3b8", x: 15, y: 50 },
        { id: "retell", label: "Retell AI", sublabel: "Voice Layer", color: "#22d3ee", x: 28, y: 30 },
        { id: "fastapi", label: "FastAPI", sublabel: "Inference", color: "#818cf8", x: 55, y: 50 },
        { id: "gate", label: "Gatekeeper", sublabel: "Classifier", color: "#f59e0b", x: 55, y: 70 },
        { id: "crm", label: "CRM", sublabel: "Sync", color: "#10b981", x: 80, y: 30 },
        { id: "callback", label: "Callback", sublabel: "Scheduler", color: "#a78bfa", x: 80, y: 70 },
      ],
      edges: [
        { from: "caller", to: "retell" },
        { from: "retell", to: "fastapi" },
        { from: "fastapi", to: "gate" },
        { from: "fastapi", to: "crm" },
        { from: "gate", to: "callback", animated: true },
      ],
    },
  },
  {
    id: "diabetes-risk",
    title: "DiabetesSense",
    tagline: "93% accurate clinical risk scoring with SHAP interpretability",
    description:
      "Ensemble ML pipeline for diabetes risk prediction with SHAP-based per-prediction explanations and a production REST API — presented at ICSMAI 2024.",
    longDescription:
      "Built at COMSATS — Random Forest + Gradient Boosting ensemble on clinical data, with SHAP TreeExplainer surfacing feature attribution to clinicians. React.js + Flask frontend for real-time risk scoring.",
    tech: ["Python", "scikit-learn", "SHAP", "React.js", "Flask", "REST API", "pandas"],
    category: "ml",
    featured: true,
    bentoSize: "medium",
    metrics: [
      { value: "93%", label: "Classification accuracy" },
      { value: "SHAP", label: "Interpretability" },
      { value: "ICSMAI", label: "Published & presented" },
    ],
    highlights: [
      "~93% accuracy on high-dimensional clinical data under stratified validation",
      "Integrated SHAP TreeExplainer to surface per-prediction feature attribution",
      "Full-stack: Flask API + React.js frontend for real-time clinical risk scoring",
      "Presented at ICSMAI 2024, Casablanca, Morocco",
    ],
    pipeline: {
      nodes: [
        { id: "data", label: "Clinical", sublabel: "Dataset", color: "#94a3b8", x: 15, y: 50 },
        { id: "feat", label: "Feature", sublabel: "Engineering", color: "#22d3ee", x: 28, y: 50 },
        { id: "rf", label: "Random", sublabel: "Forest", color: "#818cf8", x: 55, y: 25 },
        { id: "gb", label: "Gradient", sublabel: "Boosting", color: "#a78bfa", x: 55, y: 70 },
        { id: "shap", label: "SHAP", sublabel: "Explainer", color: "#f59e0b", x: 78, y: 50 },
        { id: "api", label: "REST API", sublabel: "+ UI", color: "#10b981", x: 85, y: 50 },
      ],
      edges: [
        { from: "data", to: "feat" },
        { from: "feat", to: "rf" },
        { from: "feat", to: "gb" },
        { from: "rf", to: "shap" },
        { from: "gb", to: "shap" },
        { from: "shap", to: "api", animated: true },
      ],
    },
  },
];

export const EXPERIENCE: Experience[] = [
  {
    id: "outlyst",
    company: "Outlyst",
    role: "AI Automation & ML Engineer",
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
    role: "Research Assistant — Machine Learning",
    type: "research",
    location: "Bradford, UK",
    startDate: "Jan 2025",
    endDate: "Sep 2025",
    current: false,
    responsibilities: [
      "Engineered FinLaw-UK, a Retrieval-Augmented Generation architecture integrating Mistral 7B-Instruct with a Neo4j knowledge graph for domain-aware regulatory retrieval.",
      "Fine-tuned retrieval and prompt strategies using Sentence Transformers, improving answer accuracy by 19%.",
      "Evaluated model faithfulness (0.76) and answer relevance (0.74) using the RAGAS framework.",
      "Developed scalable retrieval systems and managed complex relational data structures for high-performance query processing.",
    ],
  },
  {
    id: "comsats-ra",
    company: "COMSATS University Islamabad",
    role: "Research Assistant — Data Science",
    type: "research",
    location: "Islamabad, Pakistan",
    startDate: "Jan 2024",
    endDate: "Jul 2024",
    current: false,
    responsibilities: [
      "Developed ensemble ML models (Random Forest, Gradient Boosting) for diabetes risk prediction; ~93% classification accuracy under stratified validation.",
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
      "FinLaw-UK: A Graph-Augmented Retrieval Chatbot for Reliable UK Financial Regulation",
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
    authors: "Ahmad, H., Khan, U., Azam, M.",
    venue:
      "International Conference on Smart Medical, IoT & Artificial Intelligence (ICSMAI 2024), Morocco",
    year: "2024",
    doi: "10.1007/978-3-031-668544-8_1",
    type: "conference",
  },
];

export const SOCIAL_LINKS = [
  { platform: "GitHub", url: "https://github.com/1onn", icon: "FiGithub" },
  { platform: "LinkedIn", url: "https://linkedin.com/in/hammadahmad123", icon: "FiLinkedin" },
  { platform: "Email", url: "mailto:hammadahmad9999@hotmail.com", icon: "FiMail" },
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
  help: "Available commands: about, skills, experience, contact, ls, pwd, date, clear, exit",
  about:
    "Hammad Ahmad — AI/ML Engineer & Researcher.\nMSc Applied AI @ University of Bradford.\nSpecialising in LLMs, RAG systems, and high-performance ML infrastructure.",
  skills:
    "Core: Python · PyTorch · FastAPI · Neo4j · RAG · LLMs\nAlso: TypeScript · React · Docker · AWS · PostgreSQL",
  experience:
    "→ Outlyst (Oct 2025 – Mar 2026): AI Automation & ML Engineer\n→ University of Bradford (Jan–Sep 2025): Research Assistant (ML)\n→ COMSATS University (Jan–Jul 2024): Research Assistant (Data Science)",
  contact:
    "Email: hammadahmad9999@hotmail.com\nLinkedIn: linkedin.com/in/hammadahmad123\nGitHub: github.com/1onn",
  whoami: "hammad@portfolio:~$",
  ls: "about.md  skills.json  projects/  research/  contact.txt",
  pwd: "/home/hammad/portfolio",
  date: new Date().toUTCString(),
};
