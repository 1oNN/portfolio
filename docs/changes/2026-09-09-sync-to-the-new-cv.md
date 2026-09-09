# 2026-09-09 - sync the site to the new CV, drop the research CV

## Before

Two PDFs shipped from `public/cv/`, labelled by audience: "CV - engineering
roles" and "CV - research / PhD". The site's figures came from the pair of CVs
dated Aug 2026.

Jobzyl was in `PROJECTS` and `CASE_STUDIES` only, with a comment in
`lib/constants.ts` forbidding it from `EXPERIENCE`, because at that point both
CVs filed it under projects rather than employment. Its figures were 2M+ live
postings, 20 job boards, 23 implemented providers and 7 ATS platforms, from the
2026-08-19 sweep. `SKILL_GROUPS` tracked the union of the two CVs and so carried
LightGBM, MLflow, GitHub Actions and JavaScript. The COMSATS role read "Research
Assistant, Data Science". The hero, the About header and `SITE_DESCRIPTION` all
led with graph-augmented retrieval.

## After

One PDF, `public/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf`, replaced in place so
the URL on the CV itself, on LinkedIn and in any existing link still resolves.
`AVAILABLE_CVS` is one entry labelled "Download CV"; the audience labels went
with the second file, since with one PDF they only raise the question of where
the other went. The research CV is deleted, and with it every research/PhD
framing that hung off it.

Jobzyl is now the first `EXPERIENCE` entry, Founder & Sole Engineer, Apr 2026 to
present, because the new CV opens Experience with it. It keeps its `PROJECTS`
and `CASE_STUDIES` entries; the "do not re-add it as a role" comment is replaced
by one saying the two lists are not exclusive.

Figures resynced across `lib/constants.ts`, `lib/case-studies.ts`,
`lib/agent-system-prompt.ts` and `components/project-visuals/JobzylVisuals.tsx`:
29 integrated sources (23 boards, 6 ATS), a 3.4M row Postgres index, 26
countries, 1,950 tests behind 11 CI build gates. New on the site: semantic
CV-to-posting matching over pgvector with the too-thin-to-score gate, the Claude
layer with prompt-injection defences and per-user quotas, and the pay regression
model that was trained and then held back.

`SKILL_GROUPS` is now the single CV's three groups verbatim, so LightGBM,
MLflow, GitHub Actions, JavaScript and the Random Forest entry are out, and
fastembed, pgvector, Anthropic Claude API, PL/pgSQL, asyncio, Oracle Cloud,
pytest, Playwright and Sentry are in. Positioning moved from graph-augmented
retrieval to semantic search, LLMs and RAG, in the hero, the About header,
`SITE_DESCRIPTION` and the agent's ABOUT block. COMSATS is "Research Intern",
which is what both CVs always said.

## Verified

`npm run type-check`, `npm run lint`, `npm test` (209 tests, 9 files) and
`npm run build` all clean after the change. The ATS count and names were checked
against `api/services/ats/client.py` in the JobFlux repo rather than taken from
the CV: 6 connectors, Teamtailor gone. The board count is the 23 entries in
`api/sources/registry.py`, which is where 23 + 6 = 29 comes from.

## Rejected

**Rewriting the dated passages in the Jobzyl case study.** The 2026-08-17
census, the 2026-08-18 Adzuna measurement and the liveness probe numbers stay as
they are with their dates. Re-dating a measurement I have not re-taken is the
exact failure that page is about.

**Editing the seed blog posts.** `lib/seed-posts.ts` still says 20 boards, two
million postings and seven ATS integrations. Those are dated pieces of writing,
not live claims, and quietly correcting them would be worse than leaving them.

**Dropping the Outlyst micro-CRM bullet and the "Applied AI and Data Analytics"
degree title.** The CV omits both, but omission for space is not retraction, and
the site has room the CV does not.
