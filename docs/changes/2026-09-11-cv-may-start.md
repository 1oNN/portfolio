# 2026-09-11 - Jobzyl starts May 2026, and the CV behind it

## Before

`public/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf` was the 2026-09-09 file, 114,619
bytes. It dated Jobzyl "Apr 2026 - Present" and carried a headline line under
the name: "AI / Machine Learning Engineer | Semantic Search, LLMs, RAG".

The site repeated Apr in five places: `EXPERIENCE[0].startDate`, the Jobzyl
case-study `timeline`, and three passages in the agent prompt (the current-role
line, the numbered experience list, the project description). The GitHub profile
repeated it once, in the Experience details block.

## After

A new PDF replaces it in place, 114,582 bytes, same filename, so the URL printed
on the CV and sitting on LinkedIn still resolves. Diffed against the old one
through `pdftotext -layout`: six changed lines, and only two changes of
substance. Jobzyl moves to "May 2026 - Present", and the headline line is gone.
Every other line, including all of Technical Skills, is byte-identical.

Apr is now May in all five site locations and on the profile
(`1oNN/1oNN` `26bdb21`). The only "Apr 2026" strings left in `lib/` are the
VoiceFlow and sleep-efficiency case-study timelines, which are their own dates
and have nothing to do with the founding of Jobzyl.

## Rejected

**Following the headline's removal into the site's positioning.** The 2026-09-09
sync took "semantic search, LLMs, RAG" from that headline and pushed it into the
hero, About, `SITE_DESCRIPTION` and the agent prompt. This CV drops the line
from the PDF, but a one-page layout dropping a subtitle is not a retraction of
what the person does, and the skills section it summarises did not change by a
single character. `SITE_DESCRIPTION` stands.

**Re-deriving the date from anything.** May is what the CV says. Nothing here
was measured or inferred, and the repo has no independent record of when Jobzyl
was founded, so if May is wrong the CV is the thing to fix first.

## Correction to the record

`docs/changes/2026-09-11-skill-chip-icons.md` and the body of `2ff39f9` both say
the 2026-09-09 CV sync stranded all seven dead `SKILL_ICONS` keys. It stranded
four. TensorFlow, C++ and GCP left `SKILL_GROUPS` earlier, in `9a9c63f`, so
those three had been dead for longer than that record claims. The count of seven
and everything else in it hold.
