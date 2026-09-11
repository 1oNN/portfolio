# 2026-09-11 - Degree title, CV filename, Urdu, and two more chip marks

Four small things asked for in one sitting. They share a commit because they are
all the same kind of edit: what the site says about the person, brought in line
with what is true.

## The degree title

### Before

The site called the degree "MSc Artificial Intelligence" in five places:
`EDUCATION[0].field`, two lines of the agent prompt, the About prose, the
LeftRail hero, and `SITE_DESCRIPTION`. Both CVs and the GitHub profile call it
"Applied Artificial Intelligence and Data Analytics (Merit)". The profile spelled
it in full in two places, so the site was the only surface with the short form.

`docs/changes/2026-09-09-sync-to-the-new-cv.md` lists keeping that fuller title
as a deliberate decision, on the grounds that "the site has room the CV does
not". The code did not match the decision. That record is right about the intent
and wrong about the outcome.

### After

All five carry the full title. The exception is `SITE_DESCRIPTION`, which was
already 168 characters, past where search results truncate; the spelled-out name
takes it to 194, so it uses "MSc Applied AI and Data Analytics (Merit)" instead.
"AI/ML Engineer" opens that same sentence, so the abbreviation is not ambiguous
there.

## The CV filename

### Before

`public/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf`. The suffix dates from when two
PDFs shipped and the visitor had to pick between them. One CV has shipped since
`20c0353`, so the discriminator names a distinction that no longer exists.

### After

`public/cv/Hammad_Ahmad_CV.pdf`, via `git mv`, so the file history follows.
`lib/cv-config.ts` points at the new path, and the `analytics-links` test case
uses it too, though that test asserts on the `/cv/` prefix rather than the name.

A permanent redirect in `next.config.js` keeps the old path alive. Renaming a
file that has been public since at least 2026-09-09 would otherwise 404 every
link already sent out, and the GitHub profile's CV badge pointed straight at it.
Confirmed in `.next/routes-manifest.json`: a 308 from the old path to the new.
The badge now points at the new path as well.

## Urdu

Removed from the site's language chips and from the agent prompt's spoken
languages line, as asked. The chips now read EN fluent, DE A1. No reason is on
record, so none is invented here.

## Two more chip marks

Whisper and asyncio were text-only. The file's own comment gave the reason:
Simple Icons dropped `SiOpenai` in react-icons 5.7, and asyncio has no mark
anywhere.

Both now use the parent product's mark, which is the convention the file already
follows for pgvector, PL/pgSQL, fastembed and the CI gates. Whisper is an OpenAI
model and takes the OpenAI knot, which survives in Remix Icon as `RiOpenaiFill`
even though Simple Icons dropped it. asyncio is Python's own standard library and
takes `SiPython`. Chip icon coverage goes 29 to 31 of 37, counted in the built
HTML by the icon wrapper span rather than by eye. XGBoost, RAGAS, REST APIs and
the four technique-level entries stay text-only, still for want of an honest
mark.

## Measured

`tsc --noEmit` clean, `eslint .` clean, 209 tests in 9 files pass, `next build`
clean. In the built HTML: the full degree title appears 6 times and the short
form 0, the UR chip is gone, `/cv/Hammad_Ahmad_CV.pdf` is the only CV path, and
the Whisper and asyncio chips both carry an svg where they carried none. Ten
files, 33 insertions and 17 deletions plus the rename.

The GitHub profile took the matching half in `1oNN/1oNN` `4b12ece`: Urdu out of
the languages line, CV badge repointed. Its degree title already read in full
and was not touched.

## Not done

**Renaming anything else to match.** `cvType: "ai-ml"` stays as it is. It is the
analytics key written into every historical `track-download` row in DynamoDB,
and renaming it would split one CV's download history across two keys for the
sake of a string nobody sees.

## Assumption worth checking

The rename was asked for as "Ahmad Ahmad CV". Taken as the obvious slip for
Hammad Ahmad, so the file is `Hammad_Ahmad_CV.pdf`. Say the word if the doubled
first name was intended.
