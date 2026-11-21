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
      "A retrieval pipeline that resolves every citation against a Neo4j graph and refuses rather than answer when verification fails, released with a measurement-integrity report on which figures reproduce and which do not.",
    links: { github: "https://github.com/1oNN/finlaw-uk" },
    problem: [
      "UK financial regulation is a moving target. The FCA Handbook alone runs to thousands of pages, cross-referenced with MiFID II, the PRA Rulebook, and binding technical standards. Compliance teams burn hours threading citations across documents, and naive LLM lookups hallucinate confidently in exactly the places that matter most.",
      "Off-the-shelf RAG fails here for two reasons. Dense retrieval surfaces semantically similar passages but misses the regulatory entity graph - a single rule is meaningful only in the context of its parent chapter, the obligated entities, and the cross-references it triggers. And without faithfulness evaluation, you can't tell a polished answer from a hallucinated one.",
      "FinLaw-UK was my MSc dissertation: a graph-augmented RAG pipeline that retrieves both semantically and structurally, generates with a small open-weight model, and audits every answer against retrieved context using RAGAS.",
    ],
    approach: [
      "The pipeline begins with bulk ingestion of FCA Handbook chapters and adjacent regulatory documents. Each section is chunked at the smallest semantic unit - typically a single rule or sub-rule - then run through a parallel two-stream extraction: Sentence Transformer embeddings into a vector index, and entity/relationship extraction into a Neo4j knowledge graph that captures Rule → Chapter, Rule → Entity, and Rule → Cross-reference relationships.",
      "At query time retrieval is hybrid: BM25 lexical search and BGE-small dense search run in parallel and are fused by reciprocal rank fusion, so an exact rule reference and a paraphrased description both land. The fused candidates' graph nodes are expanded two hops in Neo4j to add adjacent rules, parent chapter context, and cross-referenced sections - the structural context pure vector search loses. A cross-encoder re-ranks the expanded set before it is trimmed to fit Mistral 7B-Instruct's context window.",
      "Generation runs locally on Mistral 7B-Instruct with strict citation-required prompting: every claim must reference a chunk ID, and every chunk ID must exist in the retrieved set. Post-generation, every response goes through a RAGAS evaluator that scores faithfulness (does the answer stay grounded in retrieved context?) and answer relevance (does it actually address the query?).",
      "Evaluation runs against a 110-item benchmark I built and released: 80 factual questions, 20 document tasks, 10 case scenarios. The pipeline reaches 0.76 RAGAS faithfulness and 0.74 answer relevance, with a custom legal-completeness metric at 0.68.",
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
      {
        title: "Refuse rather than answer",
        body: "Every citation is resolved against the graph before the answer ships, and an answer that cannot be verified is refused instead of returned. It scores worse: RAGAS marks a refusal zero, so 30 refusals pull the headline relevancy down 23 points. On regulatory text a confident wrong citation is the expensive failure, not a blank.",
      },
    ],
    results: [
      "The result I would lead with is a correction to my own submitted work. Re-measuring the evaluation after submission showed that the reported source-accuracy and citation-quality figures were regex shape-checks, not correctness measures: the scorer awarded a flat 0.85 to any citation-shaped string, and 103 of the 110 rows carried that constant. The true graph-verified citation rate was 3 in 110. Both figures are withdrawn, and the repository ships a measurement-integrity report stating which numbers reproduce and which do not.",
      "The figures that do reproduce: 0.76 RAGAS faithfulness, 0.74 answer relevance, and a custom legal-completeness metric that holds at 0.68 across both evaluation tracks. That correction is what motivated the citation normaliser, the cross-encoder re-ranker and the refusal gate.",
      "Refusing costs something measurable, and it is worth paying. Headline answer relevancy drops 23 points because RAGAS scores a refusal as zero by construction. Exclude the 30 refusals and the mean is 0.658, against 0.641 for the non-refusing baseline - which scored higher only by confabulating answers to questions the corpus cannot support.",
    ],
    reflections: [
      "The measurement bug is the part I would want a supervisor to press me on. A scorer returning the same constant for 103 of 110 rows is visible in the distribution and invisible in the mean, and I only caught it because I went back to reproduce my own numbers after the dissertation was already submitted. Publishing the correction next to the code was the only defensible option, and it changed what the system does: the refusal gate exists because the citation numbers did not survive scrutiny.",
      "If I were continuing this past the dissertation, the next move is two-pronged. First, extend the evaluation harness into a structured legal-reasoning benchmark - RAGAS catches faithfulness drift but not legal-specific failure modes like jurisdictional misapplication. Second, ship a confidence-aware UI that surfaces uncertainty when the graph expansion returns sparse adjacency, so users know when the system is reasoning from rich vs thin context.",
    ],
    related: ["ai-voice-agent", "diabetes-risk"],
  },

  "ai-voice-agent": {
    projectId: "ai-voice-agent",
    accent: "var(--status-engineering)",
    status: "In Production",
    timeline: "Oct 2025 - Mar 2026",
    role: "AI/ML Engineer @ Outlyst",
    primaryStack: ["FastAPI", "Retell AI", "AsyncIO", "PostgreSQL"],
    tackles:
      "At 2.4s a turn, a voice agent sounds like a bad phone line and the prospect starts talking over it. Under 1.2s it feels human enough that they stay on the call.",
    delivers:
      "1.1s mean call latency, a 54% cut, with no horizontal scaling and no change to the model - the win came out of profiling, not architecture.",
    // No links: Outlyst client work with no public repo. Left empty rather than
    // annotated. Do NOT link VoiceFlow here - separate codebase.
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
    // The CV dates the final-year thesis Jan - Jun 2024. The old span ran from
    // the start of the summer internship, which was separate work.
    timeline: "Jan 2024 - Jun 2024",
    role: "BSc thesis (with Inshra Javed), COMSATS University Islamabad",
    primaryStack: ["scikit-learn", "React.js", "Flask", "pandas"],
    tackles:
      "A diabetes classifier can hit high accuracy and still be useless: a clinician who cannot see why a patient was flagged will not act on the score.",
    delivers:
      "An 11-model benchmark on the 253,680-record CDC BRFSS 2015 dataset, won by Random Forest at 93% accuracy and strongest on ROC-AUC and sensitivity, served as a lab-free 19-question screening app with the risk drivers shown alongside the score.",
    links: { github: "https://github.com/1oNN/diabetes-app" },
    problem: [
      "Clinical prediction models live or die by interpretability. A black-box classifier can hit 95% accuracy and still be useless if a clinician can't see why a particular patient was flagged. Diabetes risk already has good baseline accuracy from logistic regression and tree ensembles, so the real research question wasn't 'can we predict?' but 'can we predict and explain in a way clinicians will actually trust?'",
      "Adoption literature on clinical ML is consistent: when clinicians can't trace a prediction back to features they recognise, they reject the tool - even when the tool is more accurate than their own judgement. The interpretability layer isn't optional polish; it's the load-bearing part.",
    ],
    approach: [
      "Built on the CDC BRFSS 2015 dataset - 253,680 records, 22 features, and a 14% positive class handled with Random Over-Sampling, chosen after comparing ROS against SMOTE and ADASYN. Benchmarked 11 classifiers spanning linear, instance-based, tree, boosting, and neural families under an 80/20 split.",
      "The tree ensembles led the field, with Random Forest strongest on ROC-AUC and sensitivity, then the instance-based models, and the linear baseline last. Interpretability came from correlation-driven risk-factor analysis - general health (-0.41), high blood pressure (+0.38), high cholesterol and BMI (+0.29 each) topped the drivers, with prevalence climbing sharply from age 50 onward.",
      "Persisted the winning model with joblib behind a Flask REST API with a React.js frontend: a 19-question, lab-free questionnaire that returns a risk classification plus a future-risk probability and lifestyle recommendations keyed to the user's dominant risk factors.",
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
        title: "Lab-free questionnaire over clinical inputs",
        body: "BRFSS features are all self-reportable - blood pressure history, BMI, activity, general health. That constraint means anyone can complete the 19-question screen without lab tests, which is exactly what makes a public-facing risk tool usable.",
      },
    ],
    results: [
      "Random Forest led the 11-model benchmark on the held-out split at 93% accuracy, and was strongest on ROC-AUC and sensitivity - the metrics that matter on an 86/14 imbalance. The risk-factor analysis surfaced clinically coherent drivers: general health, high blood pressure, high cholesterol, BMI, and age.",
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
    timeline: "May 2026 - present",
    role: "AI/ML Engineer · self-employed, sole designer and engineer",
    primaryStack: ["Next.js", "FastAPI", "Supabase", "AWS"],
    tackles:
      "Searching for a job across the major boards is a data-collection chore before it is a job search: different filters, different refresh cadences, the same role listed under four different URLs, and no visibility into how your CV scores.",
    delivers:
      "One search across more than 100,000 sources (111,850 employer career pages read directly, plus 11 job boards and public job sites), over a 4.4M row index, with a pay estimate only where the employer stated nothing, a CV fit score that is a plain count of skills, and a seven-stage tracker for everything applied to.",
    links: { live: "https://jobzyl.com" },
    whyIBuiltIt: [
      "I built this one for myself first. I was job hunting, and every search meant opening the same handful of boards, scrolling past the same reposted listings, and losing track of what I had already seen. The searching was taking longer than the applying.",
      "The part that actually bothered me was the second half: after all that, I still had no idea whether my CV would get past the screener. You send it, and you hear nothing, and you never find out which of the two things went wrong.",
      "So Jobzyl answers both. One search instead of twenty tabs, and a match score against the job description before you apply, so you know where you stand rather than guessing.",
    ],
    problem: [
      "Job search across the major boards is a full-time data-collection job before it is a job-search activity. Each platform has different filters, different update cadences, and different opacity around how its scoring works against your CV. The same role appears on four of them under four URLs, and none of them tell you that.",
      "The interesting engineering is not fetching listings. It is what you are willing to say about them once you have. An aggregator inherits every gap in every upstream source: a listing with no stated pay, a listing that was filled three weeks ago, a figure that is a day rate wearing an annual costume, a salary that is not the employer's number at all but the board's own model output. Passing that through to a job seeker as though it were fact is the easy version, and it is the one that makes the product worthless.",
      "So the constraint I built to is narrow: never state something the data does not support. That one rule is what most of the difficult code in this project is enforcing.",
    ],
    approach: [
      "Ingest runs on two legs. The first is a fan-out across 11 job boards and public job sites behind a single search() interface, parallel with a per-provider timeout so one slow board cannot hold the response, and with one failure mode banned at the base class: a provider that catches its own transport error and returns an empty list, because that shape reports 100% success forever. The second leg now carries more of the load. It is a crawler I wrote as its own project, which reads employers' career pages directly from more than 35 applicant tracking systems by fixed rules, with no AI, under one honest user agent and each site's robots.txt. On 19 November 2026 it held 2,639,277 open jobs from 111,850 employer pages, and in the seven days to 18 November it supplied 51% of the new jobs, 443,809 of 875,026. Each of those pages is a source in its own right, which is what puts the total over 100,000.",
      "The crawler feeds Jobzyl through a staging table and one merge function. The merge upserts through the same path every other source uses, and where an employer's own posting matches a job board's copy on company, normalised title and place, it archives the board's copy and records the replacement. The employer's page is the better record. In a link check on 11 November 2026, 2 of 46 crawler links were dead, 4.3%, against 55% for the worst job board in the same check. That is a small sample and I quote it as one.",
      "The job board list went down in November, not up. An audit on 18 November 2026 found that 24 boards and feeds added little unique coverage for what they cost in paid keys, blocks and rate limits: 18 of the 29 counted on the home page, and six more feeds that were never in that count. They are no longer called, the board count on the home page went from 29 to 11, and their 1,794,596 rows moved to an archive table rather than being deleted, with their 272,028 AI summaries kept beside them. The cut had measured costs, and they are listed under reflections.",
      "Storage is self-hosted Supabase Postgres: 185 migrations, row-level security on every table. Writes go through an upsert RPC chunked internally on both a row count and a byte bound, because PostgREST connects with an 8-second statement timeout and one 10,350-row call died and took a whole sweep with it. A job someone saved or tracked is never archived: when the retired sources were moved out, 18 such rows stayed where they were on purpose.",
      "Search is SSE over POST, streaming per-provider progress so the reader can watch boards answer instead of watching a spinner. Anonymous visitors get the cache; only the live fan-out needs an account, and that gate sits on the pipeline step rather than on one branch, because there are three ways in. Ranking lives in a Postgres function rather than the query builder, over a full-text index that weights the title above the description. Thirteen filter dimensions carry facet counts that apply every filter except the one being counted, which is the only way the number beside an option answers the question the reader is actually asking: what do I get if I click this.",
      "Matching is deliberately plain. The fit score on every job is not a model: it looks for a fixed list of about 250 skills in the ad and in the CV, and prints matched over named. Semantic matching uses 384-dimension multilingual embeddings in pgvector, and its limit was coverage rather than quality. On the afternoon of 20 November 2026 only 8.9% of 4.44M rows had a vector, because the sweep inside the API managed 800 to 3,200 rows a day against an intake of 61,099. Embedding moved to a dedicated worker on the database box, measured live at 5.3 rows a second (about 458,000 a day), and a one-off backfill of 3.57M rows that evening left 22,243 live jobs without one. A stored CV is Fernet-encrypted at rest, and the backend refuses to start in production without the key.",
      "Claude Haiku does the language work, and nothing else. It sorts each job ad into the same sections, drafts cover letters, interview prep and CV tips under a per-user daily quota, and answers questions about the job you have open as Zyl, a beta assistant. The quota used to fail open. Since 20 November 2026 a count error in production refuses the call instead.",
    ],
    decisions: [
      {
        title: "Drop a pay figure rather than reinterpret it",
        body: "Zero is dropped: it means the provider had nothing, never that the job is unpaid. A figure whose annual equivalent is implausible is dropped too, not converted. I know GBP 450 is not an annual salary, but I do not know whether it is a day rate, an hourly rate or a typo, and guessing daily would replace a wrong fact with an invented one. Pay renders in the period the employer quoted, or it does not render.",
      },
      {
        title: "Exclude one provider's predicted salaries",
        body: "One provider flagged when a figure was its own market estimate rather than the employer's. Measured on 2026-08-18, 49 of 50 US data-scientist rows that carried pay were predicted. No plausibility check catches that, because a model's output is plausible by construction, so those figures were rendering as quotes under a promise of employer-stated pay. They came out of aggregation entirely. That provider was among the sources retired in November, and the rule outlived it: a number the employer did not write is not the employer's pay.",
      },
      {
        title: "Train the pay model, then leave it on the shelf",
        body: "The shipped estimate is a lookup over measured cells, so the obvious upgrade is a regression. I trained one against that lookup as the baseline, split by employer group so the same poster could not sit on both sides of the split: MAE 27,420 down to 24,001, MdAPE 18.9% down to 16.4%, reported per country and seniority rather than as one headline. It is not deployed. A model output is plausible by construction, which is the exact failure I already excluded one provider for, and a 16% median error is not good enough to start speaking where the employer did not.",
      },
      {
        title: "Only positive evidence marks a listing dead",
        body: "Nothing revalidated a stored posting until August. On the newest 40 rows per site, 12.1% of what was being served was already gone, and on two boards it was over half. So a sweep reprobes stored URLs, but a 403 or a timeout writes nothing at all: 170 of 593 probes were refusals, and treating a refusal as an answer would have buried 168,238 live rows in a single pass. Going faster makes it worse rather than better. At concurrency 10, 126 of 200 probes came back unknown.",
      },
      {
        title: "Stop promising that duplicates are merged",
        body: "A duplicate is the same role under a different URL, so the identity key is accent-folded and punctuation-stripped with company legal suffixes dropped. A clean-up on 26 September 2026 found 1,082,939 of 5,282,458 rows sharing a key, 20.5%, and removed 735,362 repeat copies after backing each one up. The read path still collapses rows, but per page and by text match, and overlap between boards measured 5-13% on a city match. That is not the same as showing every job once. In October a re-check found the claim in about 25 places on the site, so it came out of all of them, and a build check now fails if it comes back.",
      },
      {
        title: "Show a count of skills, not a cosine",
        body: "For a while the pgvector cosine could replace the skills count as the number printed under CV match, so two different measurements wore one label and the card beside it explained only one of them. The printed number is now always skills matched over the skills the posting names, so 8 of 10 and the chips listing those skills are the same fact. A posting has to name at least three listed skills to be scored at all. The cosine is still fetched, and it breaks ties in the best-fit sort. It is never printed.",
      },
      {
        title: "Retire job boards rather than keep counting them",
        body: "Twenty-nine was the bigger number, and most of it was not earning its place. The audit measured unique coverage per board against what each one cost to keep alive, and 18 of the 29 failed. Keeping them would have kept the headline and the maintenance. Cutting them made the count on the home page true again, at the price of thinner coverage in places I could name, and I would rather publish the thinner number with the list of what it cost.",
      },
      {
        title: "Ranking in a Postgres function, not the query builder",
        body: "The shape this replaced shipped 27.4% of results with none of the user's search words in the job title. The fix is a full-text index weighting the title above the description, and those weights are only read by ts_rank_cd, so the weighting and the ranking function are one change in two files and neither does anything alone. There is no paid placement in the ranking: sponsorship came out of the function in a migration.",
      },
      {
        title: "Rank a search once, not once per page",
        body: "Every deep page called the same search function, which matches, ranks, dedupes and counts the whole match set before taking its slice, so a 14-page walk ranked the same set 14 times. Now one call returns up to 15,000 ids in rank order and each page is read by id. On a 60,000 row local table, five deep pages of 3,000 took 1,738-2,014 ms the old way and 498-655 ms ranked once. On the live site on 20 November 2026, with the title-index fixes that went in beside it, project manager in the UK went from 2,654 ms of database time to 490 ms.",
      },
      {
        title: "SSE over WebSocket",
        body: "Search progress is a one-way push from server to client. SSE is a single HTTP request, reconnects on its own, and skips the upgrade dance. A WebSocket would be over-specified for a stream that never carries anything upstream.",
      },
    ],
    results: [
      "A 4.44M row index on 20 November 2026, over a taxonomy of 1,173 keywords in 42 groups, with 2,639,277 open jobs read from 111,850 employer pages. Employer pages supplied 51% of new jobs in the seven days to 18 November and 40% of everything held.",
      "Search got faster by measurement, one query at a time. A walk through deep pages ranks once instead of 14 times. Searching IT support in the UK used to come back cut short at 342 jobs after 26.7 seconds, because the English text search config throws the word it away and what was left matched about 79% of UK rows. With a second title index that keeps stopwords it returns 3,000 jobs in 6.0 seconds. That is still slow, and the write-up says so.",
      "The integrity work is the part I would actually defend. Two thirds of listings state no pay at all, so the estimate speaks only where the employer did not, is a lookup over measured cells rather than a model, and has no country-wide fallback, because a national median tells a nurse nothing about nursing. Cells are deduplicated per job before they count: one poster ran the same role 220 times at an identical figure, and on raw row counts that one poster would have set a UK salary cell that every UK engineer reading it would have taken as fact.",
      "The newer features carry their own numbers. A sponsor badge built from 12 official government lists sat on 433,027 live jobs on 20 November 2026, 17.7%. Zyl turned away 51 of 51 prompt-injection attempts in a test on the same day, which is a small sample and not a guarantee. The sitemap lists 25,407 pages.",
      "Operationally: 185 migrations with row-level security on every table, 7,255 API tests and 2,965 frontend tests passing on 20 November 2026, 11 build checks around every frontend build and six checks in CI, account data export and deletion, Google sign-in, header-only admin auth with an audit log that escalates to Sentry if its own write fails, and 200 curated category pages inside that sitemap.",
    ],
    reflections: [
      "The claim I most want to correct is one I made myself. This page used to say 2M postings, 60+ countries, and first results in about 1.4 seconds, and not one of the three had been measured. The index passed 2M for real on a sweep with a date on it, which is the least comfortable version of being right: the number was a guess that happened to land near the truth, and a guess that lands is still a guess. The country figure was worse and was withdrawn outright - it counted distinct search-location strings, so it was counting query regions and multi-counting any country I had searched under several city names. A later count of 26 countries with rows in the index was a real measurement, taken on 26 September 2026, and it has gone from this page too: the job board cut came after it and nobody has counted since. The timings here are database time for named queries on named dates, not a promise about first results.",
      "What the numbers above do not say. Cutting to 11 job boards cost coverage, and I measured where: a remote search now reaches two boards, India is served by one, three smaller countries lost their lead source and Portugal is no longer queued. The honest verb is still that a live search queries up to 11 boards, not that the index draws on 11 evenly. And the figure of more than 100,000 sources counts employer pages the crawler reads on its own schedule, not sites queried at the moment you press search. The fit score is honest about what it is, a count against a fixed list, and it is not good yet: on 109 graded CV and job pairs on 7 November 2026 it agreed with an expert grade on 19. And until the evening of 20 November only 8.9% of rows had an embedding, so ranking every job against your CV is not built. What the vectors feed today is the similar-jobs panel and tie-breaks in the best-fit sort.",
      "What is next follows from that. Search ranked against a CV first, which could not start until most rows had a vector and can now. Then the crawler's known gaps: freshness on the largest platform it reads, where most jobs had not been rechecked for three days or more on 19 November, and small employers who use no applicant tracking system at all.",
    ],
    related: ["claude-desk", "finlaw-uk"],
  },

  "claude-desk": {
    projectId: "claude-desk",
    accent: "var(--status-engineering)",
    status: "Open source",
    timeline: "Nov 2026 - present",
    role: "Sole designer and engineer, open source (MIT)",
    primaryStack: ["Electron", "node-pty", "xterm.js", "Node.js"],
    tackles:
      "Running four or five Claude Code sessions means four or five terminal windows, a login per account, and no way to see at a glance which one is waiting for you.",
    delivers:
      "One frame for all of them: every session marked working, needs you, finished or idle beside the last thing it was asked, and every account's limits on one page, read from files Claude Code already writes.",
    // The Pages site is a landing page with a guide and a help page, not a
    // running demo, so it goes under docs and the card gets no "Live demo".
    links: { github: "https://github.com/1oNN/claude_desk", docs: "https://1onn.github.io/claude_desk/" },
    problem: [
      "Claude Code is a terminal program, and one session in one terminal is fine. The trouble starts at four or five. Each is its own window, each account is its own login, and the only way to learn that one of them stopped ten minutes ago to ask a question is to click through all of them. A session is cheap to start and expensive to leave waiting.",
      "The obvious build is a chat wrapper: your own interface over the model, with diffs and a file tree. I did not want that. Anthropic's desktop app and the VS Code extension already do it, and a wrapper has to chase every change to the thing it wraps. Desk hosts the real claude program in a real terminal and adds only what a terminal cannot tell you: which session needs you, what each one was last asked, and how much of each account's limit is left.",
      "That choice sets the constraint the rest of the build works under. Desk cannot ask a session what it is doing, and it should not spend the user's tokens to find out. Everything on screen has to come from what Claude Code already writes to disk.",
    ],
    approach: [
      "Electron in plain JavaScript, with no bundler and no framework: about 5,900 lines across 21 files. The main process owns the windows, a serial start queue and the state. The renderer draws each session with xterm.js, and a contextBridge preload is the only way between the two. Each session is one node-pty child, and claude.exe is started directly rather than through the npm shim, so the pid node-pty reports is the same pid Claude Code records for itself. That equality is what lets everything else join up.",
      "State is read back rather than tracked. Claude Code writes a small JSON file per live session, and Desk polls those every two seconds across every account's config folder, mapping the status to working, needs you, finished or idle. A pid that survives a reboot would point at somebody else's process, so an entry only counts if the process start time matches too. A turn Claude Code has moved to the background is followed to its background job instead of being left at working forever.",
      "The last ask on each row is read from the tail of the session transcript: a 64 KB window, widened once to 1 MB, skipping tool results, slash commands and interrupt records. Usage works the same way. Claude Code hands its status line the rate-limit percentages on stdin, so Desk gives its own sessions a status line script that files those numbers per session, writing to a temp file and renaming so the reader never sees half a file. An account that already has its own status line is left alone and shows no usage.",
      "Accounts are separate config folders, set per session through CLAUDE_CONFIG_DIR, so logins, history and settings stay apart. Signing in runs Claude Code's own login in a pane. A new account shares skills, agents, commands and plugins with the main one through directory junctions, which need no admin rights. It ships as a per-user NSIS installer that updates itself from GitHub Releases, with the suite running on windows-latest on every push.",
    ],
    decisions: [
      {
        title: "Host the real terminal, do not wrap the chat",
        body: "A wrapper owns the conversation and has to reimplement whatever Claude Code does next. A terminal host owns nothing: every feature Claude Code ships works the day it ships, because the pane is Claude Code. The cost is that Desk can show less, with no diffs and no git, and the README says to use Anthropic's own app if that is what you want beside the chat.",
      },
      {
        title: "Trust Claude Code's registry over my own bookkeeping",
        body: "Early versions decided state from files written on hook events, and it was wrong in three ways: finished beside a spinner, a turn stopped with Esc stuck at working, and a backgrounded turn at working forever. Esc fires no stop hook, so anything built on hooks never hears about it. From 0.2.5, Claude Code's own status decides whenever there is one. Checked on 20 live sessions on one machine, where 7 rows changed, and on six held cases in a bench copy on both commits.",
      },
      {
        title: "No model call for the line on each row",
        body: "A one-line summary per session is the obvious feature and an LLM is the obvious way to write it. That would mean Desk spending tokens the user did not ask it to spend, on every session, forever. The newest request the user typed is already in the transcript, and reading it costs a file read. It is less clever and it is always true.",
      },
      {
        title: "Start claude.exe directly, from absolute PATH entries only",
        body: "Starting the exe directly is what makes the pids line up. Finding it was the risk: a relative PATH entry such as a single dot resolves against the working folder, so a claude.exe planted in a project could have been picked up and run in every session. Measured with a planted exe on the path: found before the change, not found after.",
      },
      {
        title: "One guard on every kill path",
        body: "Forgetting a live shell took the whole app down with a heap corruption fault in ntdll. The cause was two kill() calls before the exit event landed, which node-pty 1.1.0 passes straight to ClosePseudoConsole on a handle the first call already closed. It reproduced in plain Node with no Electron at all: one kill survived 3 of 3 runs, two kills died 3 of 3. Every stop, forget and quit now goes through one function that kills a process once, and 10 of 10 start, wait and forget cycles survived afterwards.",
      },
    ],
    results: [
      "Eight releases between 6 and 20 November 2026, from 0.1.0 to 0.2.6, under the MIT licence. The installer is per-user and needs no admin rights, and the app updates itself from GitHub Releases. 48 tests run on every push.",
      "The release I would point at is 0.2.3, because it fixed a claim rather than a crash. The README promised a finished state and a line beside every session. The 0.2.2 download showed neither: both came from files that only my own setup wrote, so on anyone else's machine a session went from working straight to idle and its row said no summary yet. The fix marks a turn finished when Claude Code's own status steps from busy to idle, and reads the last ask from the transcript. Tests went from 36 to 41 in that change, and I now check the README against a clean install rather than against my own machine.",
      "Memory, measured by me on one Windows 11 machine in November 2026: Desk idles at about 200 MB private, and with seven sessions open it accounted for 479 MB of a 3,771 MB working set, 13%. The sessions are the cost, not the frame around them.",
    ],
    reflections: [
      "The mistake I would warn someone else about is building on my own environment. Everything Desk showed worked for me because my machine had extra files that nobody else's had, and nothing failed loudly on a clean install: the rows were just quieter. A feature that degrades to plausible silence is harder to catch than one that throws.",
      "What it does not do yet. It is Windows only, and the installer is unsigned, so SmartScreen warns on first run. node-pty 1.1.0 still has an upstream race when several terminals exit at the same moment, which my kill guard does not touch. The remote path over ssh and tmux exists but has had far less use than the local one.",
    ],
    related: ["jobzyl", "voiceflow"],
  },
};

export function getCaseStudy(projectId: string): CaseStudy | undefined {
  return CASE_STUDIES[projectId];
}
