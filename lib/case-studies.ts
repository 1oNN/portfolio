import type { CaseStudy } from "@/types";

export const CASE_STUDIES: Record<string, CaseStudy> = {
  "finlaw-uk": {
    projectId: "finlaw-uk",
    accent: "var(--status-research)",
    status: "Research",
    timeline: "Sep 2024 - Sep 2025",
    role: "Solo MSc dissertation, University of Bradford",
    primaryStack: ["Mistral 7B", "Neo4j", "Sentence Transformers", "RAGAS"],
    tackles:
      "Compliance teams thread citations by hand across the FCA Handbook, the PRA Rulebook and MiFID II, and a plain LLM answers confidently without showing which rule it relied on.",
    delivers:
      "A retrieval pipeline where a Neo4j graph validates every citation and flags uncited rules, scored on a 110-item regulatory benchmark: 0.82 source accuracy, 0.81 citation quality.",
    links: {},
    problem: [
      "UK financial regulation is a moving target. The FCA Handbook alone runs to thousands of pages, cross-referenced with MiFID II, the PRA Rulebook, and binding technical standards. Compliance teams burn hours threading citations across documents, and naive LLM lookups hallucinate confidently in exactly the places that matter most.",
      "Off-the-shelf RAG fails here for two reasons. Dense retrieval surfaces semantically similar passages but misses the regulatory entity graph - a single rule is meaningful only in the context of its parent chapter, the obligated entities, and the cross-references it triggers. And without faithfulness evaluation, you can't tell a polished answer from a hallucinated one.",
      "FinLaw-UK was my MSc dissertation: a graph-augmented RAG pipeline that retrieves both semantically and structurally, generates with a small open-weight model, and audits every answer against retrieved context using RAGAS.",
    ],
    approach: [
      "The pipeline begins with bulk ingestion of FCA Handbook chapters and adjacent regulatory documents. Each section is chunked at the smallest semantic unit - typically a single rule or sub-rule - then run through a parallel two-stream extraction: Sentence Transformer embeddings into a vector index, and entity/relationship extraction into a Neo4j knowledge graph that captures Rule → Chapter, Rule → Entity, and Rule → Cross-reference relationships.",
      "At query time, dense retrieval pulls the top-K candidate chunks. The candidates' graph nodes are then expanded one hop in Neo4j to add adjacent rules, parent chapter context, and any cross-referenced sections - the structural context that pure vector search loses. The expanded set is re-ranked by relevance and trimmed to fit Mistral 7B-Instruct's context window.",
      "Generation runs locally on Mistral 7B-Instruct with strict citation-required prompting: every claim must reference a chunk ID, and every chunk ID must exist in the retrieved set. Post-generation, every response goes through a RAGAS evaluator that scores faithfulness (does the answer stay grounded in retrieved context?) and answer relevance (does it actually address the query?).",
      "The result: 0.76 faithfulness and 0.74 answer relevance, with 0.82 source accuracy and 0.81 citation quality, on a 110-item benchmark spanning seven regulatory domains.",
    ],
    decisions: [
      {
        title: "Graph expansion, then re-rank",
        body: "Re-ranking alone can't fix the real failure mode: missing context. Graph expansion first captures the 'Rule X is meaningless without Rule Y next to it' pattern no reranker can recover, and cross-encoder re-ranking then orders the expanded set before it hits the context window.",
      },
      {
        title: "Mistral 7B over a frontier model",
        body: "A 70B+ model would lift answer quality, but a frontier API on financial text creates a vendor dependency and a data egress problem the project couldn't accept. 7B-Instruct ran locally on a single GPU and proved that the structural retrieval improvements transferred regardless of generator size.",
      },
      {
        title: "Neo4j over a vector-only store",
        body: "Pinecone or Qdrant alone would have been faster to ship, but the regulatory cross-reference graph is the actual moat. Storing it in a graph DB lets retrieval expand structurally - a query for one rule pulls in the chapter, the entities, and the cross-references in a single Cypher hop.",
      },
      {
        title: "RAGAS over BLEU/ROUGE",
        body: "Surface metrics reward fluent paraphrasing. Faithfulness and answer relevance both require an LLM judge against the retrieved context, which is what actually matters for regulatory text where one wrong citation can be liability.",
      },
    ],
    results: [
      "Source accuracy peaked at 0.85 on advanced queries and document tasks cleared 0.83 on both source accuracy and citation quality - exactly the cases where graph expansion adds regulatory hierarchy that dense retrieval misses on its own. The weakest domain was consumer redress, where fragmented DISP rules dragged completeness below 0.65.",
      "Faithfulness at 0.76 means roughly three in four answers stay grounded in retrieved context; the 24% that drift are the prompt-engineering targets for next-iteration work. Answer relevance at 0.74 tracks closely, suggesting the model is staying on-topic when it stays grounded.",
    ],
    reflections: [
      "The honest failure mode is consumer redress: DISP's fragmented rule structure dragged legal completeness below 0.65, and the one-hop graph expansion that lifts the other domains couldn't stitch it back together. Rule-level chunking is the right default for most of the Handbook, but domains like DISP likely need domain-aware chunk granularity, or a second expansion hop, before completeness recovers.",
      "If I were continuing this past the dissertation, the next move is two-pronged. First, extend the evaluation harness into a structured legal-reasoning benchmark - RAGAS catches faithfulness drift but not legal-specific failure modes like jurisdictional misapplication. Second, ship a confidence-aware UI that surfaces uncertainty when the graph expansion returns sparse adjacency, so users know when the system is reasoning from rich vs thin context.",
    ],
    related: ["ai-voice-agent", "diabetes-risk"],
  },

  "ai-voice-agent": {
    projectId: "ai-voice-agent",
    accent: "var(--status-engineering)",
    status: "In Production",
    timeline: "Oct 2025 - Mar 2026",
    role: "AI / Machine Learning Engineer @ Outlyst",
    primaryStack: ["FastAPI", "Retell AI", "AsyncIO", "PostgreSQL"],
    tackles:
      "At 2.4s a turn, a voice agent sounds like a bad phone line and the prospect starts talking over it. Under 1.2s it feels human enough that they stay on the call.",
    delivers:
      "1.1s mean call latency, a 54% cut, with no horizontal scaling and no change to the model - the win came out of profiling, not architecture.",
    links: {},
    problem: [
      "A voice agent's quality is dominated by latency. A 2.4-second response feels like a bad cell connection; under 1.2 seconds it feels human enough that the prospect stays on the call. The Outlyst voice agent was clearing 2.4s on warm calls, and response times spiked unpredictably under load.",
      "The hard part is that Retell AI handles speech recognition and TTS - the backend just answers structured tool calls - but the round-trip from ASR through inference and back is dominated by what we do in those middle hundreds of milliseconds. Profiling, not architecture redesign, was the actual problem.",
      "Goal: get average call latency under 1.2s, and do it without horizontal scaling that would have killed the unit economics.",
    ],
    approach: [
      "I instrumented the FastAPI inference backend with py-spy and asyncio task tracing. The traces showed two bottlenecks the metrics dashboards had missed: a synchronous ORM call on each tool invocation that blocked the event loop, and a connection pool sized for the wrong concurrency profile - pools sized for HTTP request bursts, not long-lived websocket sessions.",
      "Replaced the synchronous ORM with asyncpg for direct PostgreSQL access on the hot path. Restructured the connection pool sizing around observed session lifetime rather than peak request rate. Parallelised independent tool calls with asyncio.gather() so a single user turn could query CRM, calendar, and contact-enrichment in parallel instead of in sequence.",
      "Built a lightweight gatekeeper-detection classifier that runs before the main inference loop, so we don't burn LLM tokens on receptionists who'll just transfer the call. Detected gatekeepers route to a callback scheduler instead of a dead-end transfer.",
      "Added structured CRM sync via automated extraction pipelines, removing the manual data entry step between a completed call and a usable contact record.",
    ],
    decisions: [
      {
        title: "asyncpg over SQLAlchemy",
        body: "SQLAlchemy's async support is real but layered with abstractions that show up in flame graphs. asyncpg is the actual driver, no ORM, and the inference backend doesn't need migrations or relationship modeling at request time - just fast reads and writes against a known schema.",
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
        body: "Cheap-and-fast filter beats expensive-and-smart. Detecting 'this is a receptionist, not the prospect' with a small classifier saves ~3-5 minutes of call time per gated call. It also routes those calls to a callback scheduler instead of dead-ending.",
      },
    ],
    results: [
      "Mean call latency dropped from 2.4s to 1.1s - a 54% reduction - without horizontal scaling, across 2,100+ outbound calls over the contract.",
    ],
    reflections: [
      "What I'd change: instrument event-loop lag from day one. The request-rate dashboards looked healthy right up until latency spiked, because they never measured the thing that was actually saturating - time-to-yield inside the event loop. py-spy found in an afternoon what the dashboards had been hiding for weeks.",
      "The next 200ms of latency reduction is going to come from the LLM inference itself, not the surrounding plumbing - speculative decoding, smaller fine-tuned models for the specific tool-call patterns, or moving the gatekeeper classifier to a co-located CPU model. The plumbing is mostly drained.",
    ],
    related: ["voiceflow", "finlaw-uk", "jobzyl"],
  },

  "diabetes-risk": {
    projectId: "diabetes-risk",
    accent: "var(--status-ml)",
    status: "Shipped",
    timeline: "Jul 2023 - Jul 2024",
    role: "BSc thesis (with Inshra Javed), COMSATS University Islamabad",
    primaryStack: ["scikit-learn", "SHAP", "React.js", "Flask"],
    tackles:
      "A diabetes classifier can hit high accuracy and still be useless: a clinician who cannot see why a patient was flagged will not act on the score.",
    delivers:
      "An 11-model benchmark on the 253,680-record CDC BRFSS 2015 dataset, won by Random Forest at 93% accuracy and strongest on ROC-AUC and sensitivity, served as a lab-free 19-question screening app with the risk drivers shown alongside the score.",
    links: {},
    problem: [
      "Clinical prediction models live or die by interpretability. A black-box classifier can hit 95% accuracy and still be useless if a clinician can't see why a particular patient was flagged. Diabetes risk already has good baseline accuracy from logistic regression and tree ensembles, so the real research question wasn't 'can we predict?' but 'can we predict and explain in a way clinicians will actually trust?'",
      "Adoption literature on clinical ML is consistent: when clinicians can't trace a prediction back to features they recognise, they reject the tool - even when the tool is more accurate than their own judgement. The interpretability layer isn't optional polish; it's the load-bearing part.",
    ],
    approach: [
      "Built on the CDC BRFSS 2015 dataset - 253,680 records, 22 features, and a 14% positive class handled with Random Over-Sampling, chosen after comparing ROS against SMOTE and ADASYN. Benchmarked 11 classifiers spanning linear, instance-based, tree, boosting, and neural families under an 80/20 split.",
      // TODO verify against the raw dataset before republishing: the 63.2%
      // prevalence figure for the 70-74 band.
      "The tree ensembles led the field, with Random Forest strongest on ROC-AUC and sensitivity, then the instance-based models, and the linear baseline last. Interpretability came from correlation-driven risk-factor analysis - general health (-0.41), high blood pressure (+0.38), high cholesterol and BMI (+0.29 each) topped the drivers, with prevalence climbing sharply from age 50 to a peak of 63.2% in the 70-74 band.",
      "Persisted the winning model with joblib behind a Flask REST API with a React.js frontend: a 19-question, lab-free questionnaire that returns a risk classification plus a future-risk probability and lifestyle recommendations keyed to the user's dominant risk factors.",
      "During the follow-on research assistantship, extended the deployed model with SHAP and LIME attribution for per-prediction transparency.",
    ],
    decisions: [
      {
        title: "Benchmark breadth over a single favourite",
        body: "Eleven models spanning linear, instance-based, tree, boosting, and neural families. The tree ensembles' dominance over the linear baseline was a measured finding, not an assumption baked in at the start.",
      },
      {
        title: "ROS over SMOTE and ADASYN",
        // Training-fold confinement is stated on both CVs, so it is safe to
        // say here - it was the open question this decision card left blank.
        body: "All three balancing techniques were run head-to-head on the 86/14 imbalance, with resampling confined to the training folds so the held-out split stayed untouched. Synthetic interpolation (SMOTE/ADASYN) blurred the categorical questionnaire features; plain random over-sampling preserved the feature distributions and produced the strongest downstream classifier.",
      },
      {
        title: "SHAP over LIME",
        body: "Applied during the research assistantship on the deployed model: LIME's local linear approximations are fast but unstable across runs on the same input. SHAP gives consistent attributions, so someone asking 'why this score?' gets the same answer twice. Reproducibility is non-negotiable for clinical use.",
      },
      {
        title: "Lab-free questionnaire over clinical inputs",
        body: "BRFSS features are all self-reportable - blood pressure history, BMI, activity, general health. That constraint means anyone can complete the 19-question screen without lab tests, which is exactly what makes a public-facing risk tool usable.",
      },
    ],
    results: [
      "Random Forest led the 11-model benchmark on the held-out split at 93% accuracy, and was strongest on ROC-AUC and sensitivity - the metrics that matter on an 86/14 imbalance. The risk-factor analysis surfaced clinically coherent drivers: general health, high blood pressure, high cholesterol, BMI, and age, with diabetes prevalence peaking at 63.2% in the 70-74 age band.",
      "Shipped as a screening app anyone can complete without lab tests: 19 questions in, a risk classification plus future-risk probability and tailored lifestyle recommendations out.",
    ],
    reflections: [
      "If I rebuilt it, per-prediction attribution would ship in v1 rather than arriving with the follow-on assistantship - a risk score without 'why this score' is exactly the black box the thesis argued against.",
      "For clinical deployment beyond a paper, the next blockers are calibration and population shift: performance on a single curated dataset does not transfer to a different hospital's intake. The model needs Platt-scaled probabilities and a population-shift detector before it's safe at the bedside.",
    ],
    related: ["sleep-efficiency", "finlaw-uk"],
  },

  voiceflow: {
    projectId: "voiceflow",
    accent: "var(--status-engineering)",
    status: "Open source",
    timeline: "Apr 2026",
    role: "Solo open-source tool",
    primaryStack: ["FastAPI", "Whisper", "Next.js", "Docker"],
    tackles:
      "Getting Retell call recordings out for QA means hand-scripting the API every time, and the obvious transcription route ships customer audio to a third-party cloud service.",
    delivers:
      "An open-source export pipeline with filters and column selection, transcribed by Whisper large-v3 running locally, so the audio never leaves the machine.",
    links: { github: "https://github.com/1oNN/VoiceFlow" },
    problem: [
      "Teams running Retell voice agents accumulate thousands of call recordings, and getting them out for QA or analysis means hand-scripting against the API every time. Worse, the obvious transcription route - a cloud speech-to-text service - means shipping customer call audio to yet another third party.",
      "VoiceFlow is the tool I wanted while working with the Retell stack: point it at an API key, pick the columns and date range, and get transcribed, structured exports - without any audio leaving the machine.",
    ],
    approach: [
      "A FastAPI backend drives the pipeline: a column-discovery endpoint reads the first call's metadata so the UI adapts to whatever fields the account actually has, then an export job fetches calls with date-range filtering, downloads the audio, and runs Whisper transcription locally - large-v3 by default, GPU-accelerated when one is available.",
      "Exports run as async jobs. Kicking one off returns a job ID immediately; progress, per-call summaries, and live logs stream to the Next.js UI over server-sent events, so a multi-hour export is watchable rather than a black box.",
      "Everything lands in a structured JSON export with exactly the columns selected. The whole stack ships as a docker-compose file: one command, two services, running.",
    ],
    decisions: [
      {
        title: "Local Whisper over cloud STT",
        body: "Call audio is the most sensitive artifact a voice agent produces. Running Whisper locally means it never crosses another trust boundary. The price is speed - roughly 5-10 minutes per hour of audio on CPU - which GPU acceleration cuts substantially.",
      },
      {
        title: "Async jobs, not request-response",
        body: "An export can take minutes to hours depending on call volume and hardware. POST /api/run returns a job ID instantly and the job manager owns the lifecycle, so the UI never sits on a hanging request.",
      },
      {
        title: "SSE for progress, not polling",
        body: "Server-sent events push logs and progress the moment they happen - the same streaming pattern as Jobzyl's live search. For one-directional progress updates, SSE beats websockets on simplicity and beats polling on latency.",
      },
      {
        title: "Column discovery from live metadata",
        body: "Retell accounts differ in what call metadata they carry. Reading the schema from a real call instead of hardcoding fields means the export UI is always accurate for the account in front of it.",
      },
    ],
    results: [
      "A working open-source export pipeline: select columns, filter by date, and receive a structured JSON export with local transcripts attached. The ~3GB Whisper model downloads once and is cached; transcription uses the GPU when present.",
      "Deployment is a single docker-compose up - FastAPI backend on one port, Next.js frontend on another, no external services required beyond the Retell API itself.",
    ],
    reflections: [
      "The honest cost is the CPU path: 5-10 minutes per audio-hour means the privacy promise is only comfortable with a GPU. If local-first is the point, the next version should chunk audio and fan transcription across workers so the no-cloud constraint stops taxing throughput.",
      "Beyond that, the natural next steps are a persistent job store so exports survive a restart, and speaker diarization so transcripts separate agent from caller - the two things I'd want before pointing it at a production-scale call archive.",
    ],
    related: ["ai-voice-agent", "jobzyl"],
  },

  "sleep-efficiency": {
    projectId: "sleep-efficiency",
    accent: "var(--status-research)",
    status: "Published",
    timeline: "2024 - Apr 2026",
    role: "First & corresponding author · ICSMAI 2024",
    primaryStack: ["scikit-learn", "Random Forest", "Flask"],
    tackles:
      "Sleep research predicts efficiency from bedtime and wake time, which are outputs of a life rather than levers anyone can pull.",
    delivers:
      "Four models compared on the lifestyle factors people can actually change; Random Forest at R² 0.8569, published at ICSMAI 2024 and served as an app that returns a score and recommendations.",
    links: {
      paper: "https://doi.org/10.1007/978-3-031-66854-8_1",
      github: "https://github.com/1oNN/sleep-efficiency-app",
    },
    problem: [
      "Most sleep research predicts efficiency from the obvious determinants - bedtime and wake time. But those are outputs of a life, not levers. The interesting question is how much of sleep efficiency is explained by the broader factor set people can actually act on: sleep-stage composition, awakenings, caffeine, alcohol, exercise, smoking.",
      "That question became my first peer-reviewed publication - a comparative study of ML methods for sleep-efficiency prediction, presented at ICSMAI 2024 and published by Springer Nature - and later this app, which puts the winning model behind a form anyone can fill in.",
    ],
    approach: [
      "The study used the Kaggle Sleep Efficiency dataset: 452 records, 15 features, missing values imputed with KNN. Four regressors were compared under an 80/20 split - Linear Regression, Decision Tree, Random Forest, and Gradient Boosting.",
      "Random Forest won: R² 0.8569 with MSE 0.0027, a hair ahead of Gradient Boosting (0.8558) and clearly ahead of Linear Regression (0.7981). Correlation analysis quantified the drivers: deep sleep (+0.787) and light sleep (-0.819) dominate, with awakenings (-0.554), alcohol (-0.384), smoking (-0.290), and exercise (+0.258) behind them.",
      "The app wraps the trained model and scaler behind a Flask form: enter age, gender, stage percentages, awakenings, caffeine, alcohol, exercise, and smoking status, and it returns a predicted efficiency score, a High / Normal / Low classification, and recommendations keyed to the band. Ships with Docker and a Procfile.",
    ],
    decisions: [
      {
        title: "Random Forest over Gradient Boosting",
        body: "0.8569 vs 0.8558 R² is nearly a tie, so the call came down to behaviour: RF's predictions were more stable across the small dataset and it needs less tuning to stay that way. With 452 records, robustness beats squeezing a third decimal.",
      },
      {
        title: "Lifestyle factors over bedtime determinants",
        body: "The paper's core premise: predict from the broad factor set rather than the conventional bedtime/wake-time inputs. That's what makes the model useful in an app - the inputs are things a person can report and change.",
      },
      {
        title: "KNN imputation over dropping rows",
        body: "With only 452 records, discarding incomplete rows would have cost real signal. KNN imputation (n=2) preserved the sample while keeping imputed values locally plausible.",
      },
      {
        title: "Ship the model, not just the paper",
        body: "A published R² is an abstract claim; a form that returns your predicted efficiency makes it concrete. Persisting the model and scaler behind Flask turned the study into something a reader can poke at.",
      },
    ],
    results: [
      "Random Forest at R² 0.8569 and MSE 0.0027 - the best of the four models compared, published at ICSMAI 2024 (Springer Nature, pp. 3-15) with me as first and corresponding author.",
      "Beyond the headline number, the study surfaced usable findings: deep and light sleep percentages dominate efficiency, caffeine showed no significant effect in this dataset, and efficiency peaked for women in their 50s and men in their 60s.",
      "The app returns a score, a High (≥80%) / Normal (64-79%) / Low (<64%) classification, and recommendations matched to the band - runnable locally or via Docker in one command.",
    ],
    reflections: [
      "Shipping the app taught me the distance between a paper artefact and a usable tool: inference-time input validation and explaining a High/Normal/Low band to a lay user were decisions the paper never had to face.",
      "The dataset is the limit: 452 records from one study. The next iteration is validation against a larger, independent cohort - and wearable integration, so stage percentages come from a device instead of self-report.",
    ],
    related: ["diabetes-risk", "finlaw-uk"],
  },

  jobzyl: {
    projectId: "jobzyl",
    accent: "var(--status-fullstack)",
    status: "Shipped",
    timeline: "Apr 2026 - present",
    role: "Solo full-stack project",
    primaryStack: ["Next.js", "Supabase", "FastAPI", "AWS"],
    tackles:
      "Searching for a job across the major boards is a data-collection chore before it is a job search: different filters, different refresh cadences, and no visibility into how your CV scores.",
    delivers:
      "One search across 20 live boards in 60+ countries with first results in about 1.4s, ATS scoring that runs in the browser, and a Kanban tracker for everything applied to.",
    links: { live: "https://jobzyl.com" },
    problem: [
      "Job search across the major boards is a full-time data-collection job before it's a job-search activity. Each platform has different filters, different update cadences, and different opacity around how its ATS scoring works against your CV.",
      "The interesting full-stack problem isn't fetching listings - it's making a multi-tenant aggregator that fans out live over a warm cache, with row-level security, live progress streaming, and ATS scoring that runs client-side: the CV is only sent to the server if the user chooses to save it to their account, where it is encrypted at rest.",
    ],
    approach: [
      "Twenty live job boards searched in parallel - Reed, Adzuna, Careerjet, Jooble, USAJobs and 15 more, covering 60+ countries. The aggregation layer is a FastAPI service on AWS App Runner with per-board rate limits and Server-Sent Events streaming search progress back as each board responds. It's live fan-out over a warm cache: scheduled 6-hourly refreshes keep results fresh between searches, and first results land in about 1.4 seconds instead of a single bulk response.",
      "Storage is Supabase with row-level security on every one of 11 tables. No bare PostgreSQL access from the client; every read and write goes through RLS policies tied to the authenticated user's UUID. Auth supports email plus Google and LinkedIn OAuth via PKCE flow.",
      "ATS scoring runs entirely client-side. The user's CV is parsed in-browser, keywords are extracted with a small NLP routine, and each job card displays a match score computed locally. The CV is only sent to the server if the user chooses to save it to their account, where it is encrypted at rest. Application tracking is a Kanban board with the standard pipeline (Saved → Applied → Interview → Offer → Rejected), side-by-side job comparison, and a persistent audit log.",
      "Admin layer is a separate authenticated dashboard for search analytics, manual refresh triggers, and audit log review.",
    ],
    decisions: [
      {
        title: "Parallel search over sequential",
        body: "Twenty boards searched sequentially would be a minutes-long wait. Parallel with per-board concurrency limits streams first results in about 1.4 seconds. The scaling cost is rate-limit management - a one-time engineering investment, not a per-search cost.",
      },
      {
        title: "Client-side ATS scoring",
        body: "Server-side scoring would let us cache results and run more sophisticated extraction, but it would also make a stored CV the default rather than an explicit choice the user makes. Keeping the scoring local means the data minimisation is structural, not a policy promise.",
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
      "Twenty live boards searched in parallel across 60+ countries, first results streamed in about 1.4s over SSE, 11 RLS-locked Supabase tables, client-side ATS scoring (the CV is only sent to the server if the user saves it to their account, encrypted at rest), and a Kanban-style application tracker with side-by-side job comparison.",
      "The board count has grown from six at launch to twenty today without architectural change - the parallel, rate-limited fan-out absorbed the new sources.",
      "Operationally: PKCE OAuth for Google and LinkedIn, scheduled cache refreshes, admin dashboard with persistent audit log, and search analytics for understanding which boards return useful results per query type.",
    ],
    reflections: [
      "The interesting next step is shifting some scoring server-side while keeping the CV itself local - federated or homomorphic patterns where the CV embedding stays in the browser but the score computation can use server-side job-side embeddings. Probably not worth it for v1; potentially the next moat.",
    ],
    related: ["ai-voice-agent", "finlaw-uk"],
  },
};

export function getCaseStudy(projectId: string): CaseStudy | undefined {
  return CASE_STUDIES[projectId];
}
