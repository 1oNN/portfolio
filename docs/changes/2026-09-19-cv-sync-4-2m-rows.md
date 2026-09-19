# 2026-09-19 - sync to the rebuilt CV: 4.2M rows, and the tooling line

A new `Hammad_Ahmad_CV_AI_ML_Engineer.pdf` landed in the repo root, dated
2026-09-19. Diffed against the shipped `public/cv/Hammad_Ahmad_CV.pdf` of
2026-09-11, four things are genuinely different and the rest is line wrapping.

## The CV and the site now agree on the title

`docs/changes/2026-09-15-ai-ml-engineer-title.md` closed with the site saying
"AI/ML Engineer" at "Jobzyl · Self-Employed" while the PDF still said "Founder &
Sole Engineer", a divergence that could not be fixed from here because the PDF
is a binary. The rebuilt CV says "AI / Machine Learning Engineer
(self-employed)". The comment above `EXPERIENCE` that told the next sync not to
revert the site now records that the CV caught up instead.

The PDF is copied over `public/cv/Hammad_Ahmad_CV.pdf` rather than added under
its own name, so the URL on the CV itself, on LinkedIn and in any existing link
still resolves. `AVAILABLE_CVS` is unchanged.

## The index figure

### Before

3.4M rows, in nine places: the left rail stat, the About paragraph, the Jobzyl
`longDescription`, its metric chip, its Experience bullet, the case study's
`delivers` and `results`, three lines of the agent prompt, and a comment in
`JobzylVisuals.tsx` explaining why the product tour starts at the search rather
than the hero.

### After

4.2M+ everywhere, except one sentence. The case study's `results` opened with
"A 3.4M row index ... On the 2026-08-17 census, 82.7% of the corpus had been
posted within the previous 30 days", which pairs a current figure with a dated
one in a single breath. It now reads "A 4.2M+ row index ... On the 2026-08-17
census, taken when the index held 3.4M rows, 82.7% ...", so the census keeps the
corpus it was actually taken over.

4.2M+ is the CV's figure and is not verifiable from either repo: it is a live
database count. The last written measurement in JobFlux is roughly 3.67M on
2026-09-09, after 1,576,634 archived rows came back into the searchable set, and
3,445,530 on 2026-08-30. 4.2M+ ten days on is consistent with that trend rather
than confirmed by it.

## Skills

The CV's Infrastructure & Quality line gained two entries: GitHub Actions, which
`2026-09-09-sync-to-the-new-cv.md` had removed because the merged CV dropped it,
and "AI-assisted development (Claude Code, GitHub Copilot)".

Both are in `SKILL_GROUPS` and in the agent prompt's skills block, in CV order.
The chip is named "AI-assisted development" without the bracketed tools, which
is what the AWS chip already does with App Runner, Amplify and CloudFront.

Two icon consequences in `SkillsExplorer.tsx`. GitHub Actions takes the mark it
owns, which "CI build gates" had been borrowing as the nearest honest stand-in;
with both on the page that would have put the same logo on two adjacent chips,
so CI build gates drops to a plain tick. AI-assisted development takes Copilot's
mark, because Claude's is already on the Anthropic Claude API chip two groups
up.

## Two smaller ones

The pay-model bullet in `EXPERIENCE` ended "held back from deployment". The CV
now gives the reason, and so does the site: "deliberately not released: the
error band stayed too wide to put in front of a user as a prediction about their
own pay". The agent prompt carries the same reason in one clause. The case
study's "Train the pay model, then leave it on the shelf" decision already said
it at length and is unchanged.

The Jobzyl bullets are reordered to the CV's new order, which leads with the
Claude layer and the hardening rather than with semantic matching. Same six
bullets, same words.

## Verified

`tsc --noEmit` clean, `eslint .` clean, 228 tests in 10 files pass, `next build`
clean. No dev server was listening on 3000-3009, so the build ran in place. In
the built output, "3.4M" survives only in `/projects/jobzyl`, which is the dated
census clause, and nowhere else under `.next/server/app/`. Both new chips render
with an icon rather than falling back to text, checked in the built HTML.

The 29 sources and 6 ATS platforms the CV still claims were re-counted against
the JobFlux repo rather than taken on trust: 23 entries in `build_registry()` in
`api/sources/registry.py` and 6 in `ENDPOINTS` in `api/services/ats/client.py`.

## Rejected

**"Cutting manual calling workload by roughly 50%."** The Outlyst bullet has
carried this on every CV and has never been on the site. It is not new in this
CV, and "roughly 50%" of an unmeasured baseline is the shape of claim this site
has withdrawn twice already. Left off.

**Rewriting the Outlyst bullets to the CV's new wording.** The CV merged the
gatekeeper detection into the voice-agent bullet to save a line. The site has
the room and already splits them, with the gatekeeper classifier also written up
in the case study. Merging would lose detail to match a layout constraint that
does not apply here.

**Re-dating the Jobzyl case study measurements.** The 2026-08-17 census, the
2026-08-18 Adzuna measurement, the 0.32% liveness coverage and the 61,563
collapsed rows stay as they are. Nothing has re-taken them.
