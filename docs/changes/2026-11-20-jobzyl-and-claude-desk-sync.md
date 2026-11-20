# 2026-11-20 - two months of Jobzyl change, Claude Desk as a seventh project, four posts

The site was last synced on 2026-09-20. Since then Jobzyl cut its source list, gained a
crawler, and passed 10,000 tests, and Claude Desk went public. The site still described
September. This brings every Jobzyl figure to a dated measurement, adds Claude Desk, and
adds four posts.

## Jobzyl

### Before

- "29 integrated sources: 23 job boards plus 6 ATS APIs", "4.2M+ rows", "26 countries",
  "1,950 automated tests", "row-level security across 23 tables", "GDPR export and
  deletion", "documented fail-open behaviour".
- The architecture diagram named Adzuna and Jooble as sources. Both were retired on
  2026-11-18.
- The diagram and the case study said keyword scoring ran in the browser and uploaded
  nothing, and the experience bullets said Claude scored CVs.
- Rail stat 4.2M+.

### After

- 11 job sources, named only where the source has a documented public API (Reed,
  Careerjet, USAJOBS, France Travail, JobTechDev), plus the crawler: more than 35
  applicant tracking systems read by fixed rules, 2.6M open jobs from 111,850 employer
  pages on 2026-11-19, 51% of new jobs in the seven days to 2026-11-18.
- The cut is stated as a decision: 29 to 11 on 2026-11-18, the retired sources' 1.79M
  rows archived.
- 4.4M+ rows (4,439,471 on 2026-11-20). Over 10,000 tests (7,255 API and 2,965 frontend
  on 2026-11-20). "Row-level security on every table" replaces the table count.
  "Account data export and deletion" replaces the GDPR wording, which was a compliance
  claim nobody had checked.
- The country count is gone. The last count (26) is from 2026-09-26, before the cut.
- The fit score is described as what it is: a count of matched skills from a fixed list
  of about 250, no score under three named skills, and agreement with an expert grade on
  19 of 109 pairs on 2026-11-07. Claude structures job ads and drafts cover letters and
  interview prep. It does not score CVs.
- Embeddings: 8.9% of rows had a vector on the afternoon of 2026-11-20. The worker that
  replaced the sweep measured 5.3 rows a second live, and a backfill of 3,568,446 rows
  finished at 22:20 UTC, leaving 22,243 live jobs without one. An earlier draft of this
  sync quoted 14.8 rows a second. That was a read-only trial with no writes, so it is
  not used.
- Search: a UK search went from 2,654 ms to 490 ms of database time on the live site.
  That figure belongs to the whole set of search fixes of 19 and 20 November, and the
  copy says so.
- Quotas "fail closed". The old "documented fail-open behaviour" described September.

## Claude Desk

New: a seventh project (`claude-desk` in `PROJECTS`, third in the list), a case study,
three visuals in `ClaudeDeskVisuals.tsx`, two screenshots under
`public/projects/claude-desk/` taken from the public repo, and an entry in the chat
agent's prompt. Figures are from GitHub main at 0.2.6: eight releases between 6 and 20
November 2026, 48 tests, MIT.

Kept out on purpose: any count of accounts, stars, views or downloads, and anything
that reads as getting around a usage limit. Every surface carries the line that it is
an independent project, not made by or affiliated with Anthropic.

## Posts

Four added to `lib/seed-posts.ts`:

- `two-kills-one-handle-node-pty-crash`
- `fourteen-rankings-for-one-search`
- `the-word-it-stopword-title-search`
- `readme-said-finished-download-never-did`

The first post in the file (`six-boards-to-twenty-ingest-fan-out`) gets a dated note
that the source list was cut to 11. Its body is left as written.

## Where the numbers come from

Jobzyl figures are from the change records on `origin/main` of the Jobzyl repo and the
crawler's own report of 2026-11-19. The embedding backfill figures are from the
before/after page written when it finished, not from a commit. Claude Desk figures are
from the public repo.

## Not verifiable from this repo

- 4.44M rows, 111,850 pages, 2.6M open jobs and the embedding counts are production
  reads recorded elsewhere. Nothing here can recount them.
- The two Claude Desk posts quote measurements from change records that are not in the
  public repo (the crash reproduction counts, 7 of 20 live rows). The public code they
  describe is public. The numbers are not.
- "More than 35 applicant tracking systems" is the crawler's own count.
- Older posts still name sources that were retired on 2026-11-18. They are dated
  history and were not rewritten.
- The CV PDF is still the 2026-09-19 one and now lags the site.

## Checks

`npx tsc --noEmit` clean, `npm run lint` clean, `npm test` 228 passed in 10 files,
`npm run build` in a detached worktree, at both commits.

The `1oNN/1oNN` profile README is updated separately, after this deploys, because its
Writing table links to the four new posts.
