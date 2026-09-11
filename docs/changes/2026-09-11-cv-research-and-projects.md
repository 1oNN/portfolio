# 2026-09-11 - The CV separates employment from academic work

## Before

`public/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf` was the file from this morning's
push, 114,582 bytes. It listed four things under EXPERIENCE. Two of them were
not jobs:

- **University of Bradford, "Research Assistant, Graph-Augmented LLM
  Engineering", Jan 2025 - Sep 2025.** FinLaw-UK. The site's own entry admitted
  the problem in its first bullet: "This work was also my MSc dissertation
  project - the Education and Experience entries describe the same system, not
  two."
- **COMSATS, "Research Intern, Data Science", Jul 2023 - Jul 2024**, carrying
  the DiabetesSense benchmark. A twelve-month span that ran a three-month
  internship straight into a final-year thesis.

## After

A new PDF replaces it in place, 122,797 bytes, same filename, so the URL printed
on the CV and sitting on LinkedIn still resolves.

Diffed through `pdftotext -layout`, then again word by word to see past the
reflow. The two extractions are identical for their first 393 words: the contact
block, all three TECHNICAL SKILLS lines, every Jobzyl bullet and every Outlyst
bullet are unchanged. Everything that differs is downstream of Outlyst:

- The Bradford role is gone from EXPERIENCE. FinLaw-UK reappears under a new
  RESEARCH & PROJECTS heading as "MSc Dissertation, University of Bradford",
  dated 2025.
- COMSATS narrows to "Data Science Intern", Jul 2023 - Sep 2023, and its bullet
  is now the sleep-efficiency work and the Springer paper, not diabetes.
- DiabetesSense moves to RESEARCH & PROJECTS as "BSc Final-Year Thesis", Jan
  2024 - Jun 2024.
- EDUCATION and PUBLICATIONS are unchanged.

The site follows. `EXPERIENCE` goes from four entries to three: `bradford-ra` is
deleted, and `comsats-ra` becomes `comsats-intern`, ending Sep 2023, with the
sleep-efficiency bullets. Nothing about FinLaw-UK is lost by the deletion: it
keeps its `PROJECTS` entry, its case study, which already carried the
measurement correction in full and already described the role as "Solo MSc
dissertation", and the dissertation line in `EDUCATION`.

The agent prompt needed more care, because the deleted section was where most of
its FinLaw knowledge lived. The hybrid-retrieval description, the 110-item
benchmark composition, the never-quote-source-accuracy directive and the refusal
arithmetic all moved onto the MSc dissertation block under EDUCATION. The
"quote it as 93%, paired with ROC-AUC and sensitivity, because 86/14 makes bare
accuracy a weak claim" guidance moved with the diabetes work into PROJECTS. A
new line at the top of EXPERIENCE says he has held three roles and that the two
academic projects must never be added to that list.

The DiabetesSense case study is retimed from Jul 2023 - Jul 2024 to Jan 2024 -
Jun 2024. The Experience section header said "Engineering roles and research
posts"; with one research internship left, it now says "a research internship".

Measured after the change: `tsc --noEmit` clean, `eslint .` clean, 209 tests in
9 files pass, `next build` clean. "Research Assistant" appears in none of the
built HTML, and `/projects/diabetes-risk` renders the new timeline. Five files,
30 insertions and 45 deletions plus the PDF.

## Rejected

**Mirroring the CV's new heading with a Research & Projects section on the
site.** The CV needs that heading because a one-page CV has only Experience to
demote things out of. The site already carries both items three times over: a
`PROJECTS` entry, a full case study each, and both named as dissertations in
Education. A fourth surface would be the same two items again.

**Deleting the FinLaw detail along with the role.** It is the deepest work on
the site and the agent gets asked about it. The relevant question is whether the
detail is true, not which heading it sits under, so it moved rather than went.

**Re-dating the sleep-efficiency case study.** It runs "2024 - Apr 2026" because
it covers the app, which was built well after the paper. The CV dates the
internship, not the project, and re-dating a thing the CV does not date would be
inventing a fact.

## Noticed, not changed

The degree title disagrees with both CVs. `EDUCATION` carries "Artificial
Intelligence (Merit)" and the agent prompt says "MSc Artificial Intelligence";
the CV says "Applied Artificial Intelligence and Data Analytics (Merit)", and
so did the previous one. `docs/changes/2026-09-09-sync-to-the-new-cv.md` records
a decision to keep the fuller title on the site on the grounds that "the site
has room the CV does not", but the code has the short one, so that record and
the code do not agree. This CV did not touch it, and fixing it means touching
the About prose as well, so it belongs in its own commit rather than buried in
this one.
