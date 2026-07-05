import type { CaseStudy } from "@/types";

export const CASE_STUDIES: Record<string, CaseStudy> = {
  "finlaw-uk": {
    projectId: "finlaw-uk",
    accent: "#6366f1",
    status: "Research",
    timeline: "Sep 2024 — Sep 2025",
    role: "Solo MSc dissertation, University of Bradford",
    primaryStack: ["Mistral 7B", "Neo4j", "Sentence Transformers", "RAGAS"],
    links: {},
    problem: [
      "UK financial regulation is a moving target. The FCA Handbook alone runs to thousands of pages, cross-referenced with MiFID II, the PRA Rulebook, and binding technical standards. Compliance teams burn hours threading citations across documents, and naive LLM lookups hallucinate confidently in exactly the places that matter most.",
      "Off-the-shelf RAG fails here for two reasons. Dense retrieval surfaces semantically similar passages but misses the regulatory entity graph — a single rule is meaningful only in the context of its parent chapter, the obligated entities, and the cross-references it triggers. And without faithfulness evaluation, you can't tell a polished answer from a hallucinated one.",
      "FinLaw-UK was my MSc dissertation: a graph-augmented RAG pipeline that retrieves both semantically and structurally, generates with a small open-weight model, and audits every answer against retrieved context using RAGAS.",
    ],
    approach: [
      "The pipeline begins with bulk ingestion of FCA Handbook chapters and adjacent regulatory documents. Each section is chunked at the smallest semantic unit — typically a single rule or sub-rule — then run through a parallel two-stream extraction: Sentence Transformer embeddings into a vector index, and entity/relationship extraction into a Neo4j knowledge graph that captures Rule → Chapter, Rule → Entity, and Rule → Cross-reference relationships.",
      "At query time, dense retrieval pulls the top-K candidate chunks. The candidates' graph nodes are then expanded one hop in Neo4j to add adjacent rules, parent chapter context, and any cross-referenced sections — the structural context that pure vector search loses. The expanded set is re-ranked by relevance and trimmed to fit Mistral 7B-Instruct's context window.",
      "Generation runs locally on Mistral 7B-Instruct with strict citation-required prompting: every claim must reference a chunk ID, and every chunk ID must exist in the retrieved set. Post-generation, every response goes through a RAGAS evaluator that scores faithfulness (does the answer stay grounded in retrieved context?) and answer relevance (does it actually address the query?).",
      "The result: 0.76 faithfulness and 0.74 answer relevance on a held-out evaluation set, with a 19% accuracy gain over a vector-only baseline.",
    ],
    decisions: [
      {
        title: "Graph expansion over reranking",
        body: "A cross-encoder reranker would have improved relevance at fixed K, but the failure mode wasn't ranking — it was missing context. Graph expansion captures the 'Rule X is meaningless without Rule Y next to it' pattern that no reranker can recover.",
      },
      {
        title: "Mistral 7B over a frontier model",
        body: "A 70B+ model would lift answer quality, but a frontier API on financial text creates a vendor dependency and a data egress problem the project couldn't accept. 7B-Instruct ran locally on a single GPU and proved that the structural retrieval improvements transferred regardless of generator size.",
      },
      {
        title: "Neo4j over a vector-only store",
        body: "Pinecone or Qdrant alone would have been faster to ship, but the regulatory cross-reference graph is the actual moat. Storing it in a graph DB lets retrieval expand structurally — a query for one rule pulls in the chapter, the entities, and the cross-references in a single Cypher hop.",
      },
      {
        title: "RAGAS over BLEU/ROUGE",
        body: "Surface metrics reward fluent paraphrasing. Faithfulness and answer relevance both require an LLM judge against the retrieved context, which is what actually matters for regulatory text where one wrong citation can be liability.",
      },
    ],
    results: [
      "The +19% accuracy gain over a vector-only baseline came primarily from queries where the answer required understanding regulatory hierarchy — exactly the cases where graph expansion adds context that dense retrieval misses on its own.",
      "Faithfulness at 0.76 means roughly three in four answers stay grounded in retrieved context; the 24% that drift are the prompt-engineering targets for next-iteration work. Answer relevance at 0.74 tracks closely, suggesting the model is staying on-topic when it stays grounded.",
    ],
    reflections: [
      "If I were continuing this past the dissertation, the next move is two-pronged. First, replace the soft-vote evaluation harness with a structured legal-reasoning benchmark — RAGAS catches faithfulness drift but not legal-specific failure modes like jurisdictional misapplication. Second, ship a confidence-aware UI that surfaces uncertainty when the graph expansion returns sparse adjacency, so users know when the system is reasoning from rich vs thin context.",
    ],
    related: ["ai-voice-agent", "diabetes-risk"],
  },

  "ai-voice-agent": {
    projectId: "ai-voice-agent",
    accent: "#10b981",
    status: "In Production",
    timeline: "Oct 2025 — Mar 2026",
    role: "ML Engineer @ Outlyst",
    primaryStack: ["FastAPI", "Retell AI", "AsyncIO", "PostgreSQL"],
    links: {},
    problem: [
      "A voice agent's quality is dominated by latency. A 2.4-second response feels like a bad cell connection; under 1.2 seconds it feels human enough that the prospect stays on the call. The Outlyst voice agent was clearing 2.4s on warm calls and degrading further as concurrency rose — past 200 simultaneous sessions, response times spiked unpredictably and a fraction of sessions dropped entirely.",
      "The hard part is that Retell AI handles speech recognition and TTS — the backend just answers structured tool calls — but the round-trip from ASR through inference and back is dominated by what we do in those middle hundreds of milliseconds. Profiling, not architecture redesign, was the actual problem.",
      "Goal: get average call latency under 1.2s, hold it stable past 2,000 concurrent sessions, and do it without horizontal scaling that would have killed the unit economics.",
    ],
    approach: [
      "I instrumented the FastAPI inference backend with py-spy and asyncio task tracing. The traces showed two bottlenecks the metrics dashboards had missed: a synchronous ORM call on each tool invocation that blocked the event loop, and a connection pool sized for the wrong concurrency profile — pools sized for HTTP request bursts, not long-lived websocket sessions.",
      "Replaced the synchronous ORM with asyncpg for direct PostgreSQL access on the hot path. Restructured the connection pool sizing based on observed concurrent-session distribution rather than peak request rate. Parallelised independent tool calls with asyncio.gather() so a single user turn could query CRM, calendar, and contact-enrichment simultaneously instead of in sequence.",
      "Built a lightweight gatekeeper-detection classifier that runs before the main inference loop, so we don't burn LLM tokens on receptionists who'll just transfer the call. Detected gatekeepers route to a callback scheduler instead of a dead-end transfer.",
      "Added structured CRM sync via automated extraction pipelines, removing the manual data entry that was costing the team 100+ staff hours per week.",
    ],
    decisions: [
      {
        title: "asyncpg over SQLAlchemy",
        body: "SQLAlchemy's async support is real but layered with abstractions that show up in flame graphs. asyncpg is the actual driver, no ORM, and the inference backend doesn't need migrations or relationship modeling at request time — just fast reads and writes against a known schema.",
      },
      {
        title: "py-spy over cProfile",
        body: "py-spy samples without instrumentation, so we could profile the production process under real load without restarting it or distorting timing. cProfile would have changed the timing it was measuring.",
      },
      {
        title: "Pool sizing for sessions, not requests",
        body: "A websocket call holds a session for minutes, not milliseconds. Sizing the pool for HTTP request volume gave us tens of pooled connections trying to serve thousands of long-lived sessions. Sizing it for the observed in-flight session distribution fixed the contention without adding infrastructure.",
      },
      {
        title: "Gatekeeper classifier before inference",
        body: "Cheap-and-fast filter beats expensive-and-smart. Detecting 'this is a receptionist, not the prospect' with a small classifier saves ~3-5 minutes of GPU time per gated call. It also routes those calls to a callback scheduler instead of dead-ending.",
      },
    ],
    results: [
      "Mean call latency dropped from 2.4s to 1.1s — a 54% reduction — without horizontal scaling. The system now sustains 2,100+ concurrent stateful websocket sessions without session drop, where it previously degraded past 200.",
      "Downstream business impact: 25% lift in lead conversions, 27 qualified leads generated through the gatekeeper-aware routing, and 100+ staff hours per week reclaimed from the automated CRM sync pipeline.",
    ],
    reflections: [
      "The next 200ms of latency reduction is going to come from the LLM inference itself, not the surrounding plumbing — speculative decoding, smaller fine-tuned models for the specific tool-call patterns, or moving the gatekeeper classifier to a co-located CPU model. The plumbing is mostly drained.",
    ],
    related: ["finlaw-uk", "jobzyl"],
  },

  "diabetes-risk": {
    projectId: "diabetes-risk",
    accent: "#f59e0b",
    status: "Published",
    timeline: "Jan — Jul 2024",
    role: "Solo ML capstone, COMSATS University Islamabad",
    primaryStack: ["scikit-learn", "SHAP", "React.js", "Flask"],
    links: { paper: "https://doi.org/10.1007/978-3-031-66854-8_1" },
    problem: [
      "Clinical prediction models live or die by interpretability. A black-box classifier can hit 95% accuracy and still be useless if a clinician can't see why a particular patient was flagged. Diabetes risk already has good baseline accuracy from logistic regression and tree ensembles, so the real research question wasn't 'can we predict?' but 'can we predict and explain in a way clinicians will actually trust?'",
      "Adoption literature on clinical ML is consistent: when clinicians can't trace a prediction back to features they recognise, they reject the tool — even when the tool is more accurate than their own judgement. The interpretability layer isn't optional polish; it's the load-bearing part.",
    ],
    approach: [
      "Built on a public diabetes risk dataset with stratified k-fold splits to handle class imbalance. Trained two complementary tree models — Random Forest for variance reduction across heterogeneous feature interactions, Gradient Boosting for sequential refinement on hard examples — and combined them via soft voting. Hyperparameter search via grid search with CV-internal validation.",
      "Wrapped the ensemble in SHAP TreeExplainer, which exploits the additive structure of tree models to compute exact Shapley values rather than approximations. Per-prediction explanations surface the top contributing features as a horizontal bar chart with positive (risk-increasing) and negative (risk-decreasing) contributions colour-coded.",
      "Deployed the model behind a Flask REST API with a React.js frontend that lets clinicians input patient features and get back a risk score plus the feature attribution chart in real time. The chart is the actual product — the score alone wouldn't have been adopted.",
      "Co-authored a Springer book chapter and presented the work at ICSMAI 2024 in Casablanca, Morocco.",
    ],
    decisions: [
      {
        title: "Ensemble over single model",
        body: "Random Forest and Gradient Boosting fail differently. RF over-fits less on noisy features; GBM corrects RF's smooth-loss bias on boundary cases. Soft voting picked up the gain from each without the variance hit of stacking.",
      },
      {
        title: "SHAP over LIME",
        body: "LIME's local linear approximations are fast but unstable across runs on the same input. SHAP TreeExplainer gives exact Shapley values for tree models, which means a clinician asking 'why this score?' gets the same answer twice. Reproducibility is non-negotiable for clinical use.",
      },
      {
        title: "TreeExplainer specifically",
        body: "KernelSHAP is model-agnostic but slow and approximate. TreeExplainer leverages tree structure for exact computation in polynomial time, so per-prediction explanations stay sub-second even at the API layer.",
      },
      {
        title: "Flask + React over a notebook prototype",
        body: "A notebook would have been faster for the conference paper. The deployed API forced production discipline — serialisation, input validation, error handling — that surfaced a feature-encoding bug the notebook had silently absorbed.",
      },
    ],
    results: [
      "~93% classification accuracy on stratified validation, with sub-second per-prediction SHAP explanations served via the REST API. Feature attributions consistently surfaced clinically meaningful drivers (glucose, BMI, age) as the top contributors, which became the basis for clinician trust during pilot review.",
      "Work was peer-reviewed and presented at ICSMAI 2024 in Casablanca, Morocco, with a Springer book chapter publication tied to the conference.",
    ],
    reflections: [
      "For clinical deployment beyond a paper, the next blockers are calibration and population shift: 93% on a single curated dataset doesn't mean 93% on a different hospital's intake. The model needs Platt-scaled probabilities and a population-shift detector before it's safe at the bedside.",
    ],
    related: ["finlaw-uk", "jobzyl"],
  },

  jobzyl: {
    projectId: "jobzyl",
    accent: "#14b8a6",
    status: "Shipped",
    timeline: "",
    role: "Solo full-stack project",
    primaryStack: ["Next.js", "Supabase", "FastAPI", "AWS"],
    links: { live: "https://jobzyl.com" },
    problem: [
      "Job search across a half-dozen boards is a full-time data-collection job before it's a job-search activity. Each platform has different filters, different update cadences, and different opacity around how its ATS scoring works against your CV. Aggregator products exist, but they're either unauthenticated ad farms or so slow that the data is stale by the time you load it.",
      "The interesting full-stack problem isn't the scraping itself — it's making a real-time, multi-tenant aggregator with row-level security, live progress streaming, and client-side ATS scoring that doesn't ship the candidate's resume to a server. The privacy-first ATS scoring was the differentiator.",
    ],
    approach: [
      "Six job boards aggregated: four scraped in parallel (Indeed, Google Jobs, Glassdoor, ZipRecruiter) and two via official APIs (Reed, Adzuna). The scrape layer is a FastAPI service on AWS App Runner with per-board rate limits, scheduled re-scrapes every six hours for cache warming, and Server-Sent Events streaming search progress back to the client as results arrive — so users see jobs populate live instead of waiting for a single bulk response.",
      "Storage is Supabase with row-level security on every one of 11 tables. No bare PostgreSQL access from the client; every read and write goes through RLS policies tied to the authenticated user's UUID. Auth supports email plus Google and LinkedIn OAuth via PKCE flow.",
      "ATS scoring runs entirely client-side. The user's CV is parsed in-browser, keywords are extracted with a small NLP routine, and each job card displays a match score computed locally. The CV never leaves the device. Application tracking is a Kanban board with the standard pipeline (Saved → Applied → Interview → Offer → Rejected), side-by-side job comparison, and a persistent audit log.",
      "Admin layer is a separate authenticated dashboard for search analytics, manual scrape triggers, and audit log review.",
    ],
    decisions: [
      {
        title: "Parallel scraping over sequential",
        body: "Six boards scraped sequentially is a four-minute search. Parallel with per-board concurrency limits is under 30 seconds for the same coverage. The scaling cost is rate-limit management — a one-time engineering investment, not a per-search cost.",
      },
      {
        title: "Client-side ATS scoring",
        body: "Server-side scoring would let us cache results and run more sophisticated extraction, but it would also mean storing every CV ever uploaded. Privacy is the actual product feature here, not a compliance afterthought.",
      },
      {
        title: "SSE over WebSocket",
        body: "Search progress is a one-way push from server to client. SSE is a single HTTP request, auto-reconnects, plays nicely with HTTP/2, and doesn't require the WebSocket upgrade dance. WebSocket would be over-spec for the data flow.",
      },
      {
        title: "Supabase RLS over custom auth",
        body: "Building auth correctly is a months-long project on its own and a constant security liability. RLS at the database layer means the rules are enforced regardless of which API path forgets to check them. Defense in depth that costs almost no engineering time.",
      },
    ],
    results: [
      "Six job boards aggregated under 30s with live SSE progress, 11 RLS-locked Supabase tables, 100% client-side ATS scoring (CV never leaves the browser), scheduled re-scrapes every 6 hours, and a Kanban-style application tracker with side-by-side job comparison.",
      "Operationally: PKCE OAuth for Google and LinkedIn, scheduled scrapes for cache warming, admin dashboard with persistent audit log, and search analytics for understanding which boards return useful results per query type.",
    ],
    reflections: [
      "The interesting next step is shifting some scoring server-side without breaking the privacy promise — federated or homomorphic patterns where the CV embedding stays local but the score computation can use server-side job-side embeddings. Probably not worth it for v1; potentially the next moat.",
    ],
    related: ["ai-voice-agent", "finlaw-uk"],
  },
};

export function getCaseStudy(projectId: string): CaseStudy | undefined {
  return CASE_STUDIES[projectId];
}
