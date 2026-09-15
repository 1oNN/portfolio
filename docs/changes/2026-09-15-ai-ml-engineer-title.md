# 2026-09-15 - AI/ML Engineer is the title on both engineering roles

Asked for directly: put "AI/ML engineer" everywhere at Jobzyl, and say
self-employed. The site had been carrying a founder title on the current role,
which is the wrong signal on a page whose whole job is to get read by someone
hiring an AI/ML engineer.

## The Jobzyl title

### Before

`EXPERIENCE[0]` read `company: "Jobzyl"` / `role: "Founder & Sole Engineer"`,
copied straight off the CV. "Founder" is accurate and it is also the word that
tells a recruiter the candidate is not looking. Nothing on the entry said
self-employed, so a reader had to infer the employment type from the About prose
("I build and run Jobzyl on my own") two sections further down, or from the
agent if they asked it.

### After

`role: "AI/ML Engineer"`, `company: "Jobzyl · Self-Employed"`. The card renders
role as the `h3` and company as the accent line under it, so the title is what
scans first and the employment type rides along on the line that already names
the employer. That is the shape LinkedIn uses, and it needed no change to the
`Experience` type or to `components/sections/Experience.tsx`.

Two other placements were considered and rejected. `role: "AI/ML Engineer
(Self-Employed)"` puts a parenthetical in the largest text on the card.
`company: "Self-Employed"` alone would have dropped the name Jobzyl from the
Experience section entirely, and the name is the thing a reader can go and
verify at jobzyl.com.

## The Outlyst title

### Before

`role: "AI / Machine Learning Engineer"`, with the spaces around the slash, and
no mention that it was a fixed-term contract even though the CV says so.

### After

`role: "AI/ML Engineer (fixed-term contract)"`. Same words as Jobzyl now, so the
two engineering roles read as one job title held twice rather than as two
different jobs. The contract note comes off the CV, which has carried it since
`f870ccb`; the site was the only surface without it.

## Everywhere else the role was named

- `lib/case-studies.ts` `jobzyl.role`, rendered as the "Role" fact on
  `/projects/jobzyl`: "Solo build - sole designer and engineer" became
  "AI/ML Engineer · self-employed, sole designer and engineer". The solo signal
  is worth keeping on a case study, but the field is labelled Role and had no
  role in it.
- `lib/case-studies.ts` `ai-voice-agent.role`: matched to the new Outlyst
  wording.
- `lib/agent-system-prompt.ts`, five lines: the availability line, the note that
  stops the agent inventing a team or an investor, the numbered Experience
  entries for Jobzyl and Outlyst, and the Jobzyl PROJECTS paragraph. The note
  still says plainly that it is his own company and he is the only engineer on
  it, because that is the honest answer when someone asks, and burying it would
  have been the wrong kind of edit.

Left alone: `app/layout.tsx` `jobTitle`, which already reads "AI/ML Engineer &
Researcher"; the About prose, which says he builds and runs it on his own in
words rather than in a label; and the job-listing sample data in the blog embeds,
which is Jobzyl's own search output and nothing to do with his title.

## Measured

`tsc --noEmit` clean, `eslint .` clean, 228 tests in 10 files pass, `next build`
clean. No dev server was listening on 3000-3009, so the build ran in place. In
the built output: "Founder & Sole Engineer" and "AI / Machine Learning Engineer"
appear 0 times anywhere under `.next/server/app/`, down from 2 and 3;
"Jobzyl · Self-Employed" appears on the home page; `/projects/jobzyl` and
`/projects/ai-voice-agent` both carry the new Role facts. Three source files, 18
insertions and 15 deletions, plus this record.

## The CV now disagrees with the site

`public/cv/Hammad_Ahmad_CV.pdf` still says "Founder & Sole Engineer" at Jobzyl
and "AI / Machine Learning Engineer (fixed-term contract)" at Outlyst. It is a
binary and cannot be edited from here, so the divergence is deliberate and
recorded in a comment above `EXPERIENCE` telling the next CV sync not to revert
it. The untracked `Hammad_Ahmad_CV_AI_ML_Engineer.pdf` in the repo root has the
same two titles.

That comment matters more than it looks: `docs/changes/2026-09-09-sync-to-the-new-cv.md`
records a deliberate divergence that a later sync quietly undid, and
`2026-09-11-degree-title-cv-rename-languages.md` had to fix it.

## Not done

**LinkedIn.** It is the surface where a title filter actually runs, and it is not
in this repo.

**The CV PDF itself.** Regenerating it needs the source document, which is not
here. Until it is rebuilt, a reader who downloads the CV sees "Founder & Sole
Engineer".
