# Home page "bolder" redesign - design spec

Date: 2026-08-03
Status: approved by owner (approach A of A/B/C: "turn up the existing dials")
Scope: home page only. Case studies, /projects, /blog, admin, terminal untouched.

## Goal

Owner wants the home page "smart, appealing, bold" in three approved directions:
richer color presence, louder typography, motion & energy. The navy/green scheme
stays; no rebrand. Constraints inherited from the shipped design system:

- Home stays a server component; no framer-motion; motion is CSS-only.
- AA contrast rules hold in both themes (see globals.css token comments).
- Inline-style hover trap: twinned properties use bracket classes; every
  hover state has a focus-visible twin.
- prefers-reduced-motion users and browsers without scroll-timeline support
  must see all content, always - nothing may be stuck hidden.

## The five moves

### 1. Two-tone drifting atmosphere

`app/page.tsx` currently has one fixed green radial glow (top-left) plus a
grid. Add a second, fainter periwinkle radial anchored bottom-right using
`--accent-secondary` via color-mix (no new tokens needed unless contrast
tuning demands one). Both glow layers get a very slow (~30s, alternate)
transform drift keyframe. Reduced motion: global rule zeroes duration;
end state equals base state so nothing jumps.

### 2. Gradient name + bigger hero + stat glow (LeftRail.tsx)

- Name clamp: `clamp(3.25rem, 2.2rem + 2.6vw, 4.5rem)` grows to
  `clamp(3.5rem, 2.4rem + 3vw, 5.25rem)`. Fits the max-w-md rail.
- "Hammad" stays solid `--text-primary`. "Ahmad" gets a green -> periwinkle
  gradient clip (`--accent` -> `--accent-secondary`, background-clip: text)
  with a one-time shimmer sweep on load (background-position keyframe, runs
  once, ends at rest position). Both gradient stops are AA on both themes
  (they are existing accent text colors).
- Stat numerals (54% / 93% / 2,100+) get `text-shadow: 0 0 18px var(--accent-glow)`.

### 3. Louder headers + gradient hairlines + About statement

- `SectionHeader` gains an optional `size` prop; `size="lg"` renders the h2 at
  text-4xl sm:text-5xl (3rem) with tracking -0.03em. Home sections pass it;
  case-study pages keep the current default - their density needs the
  smaller scale.
- New `.hairline-accent` utility in globals.css: 1px gradient line
  (accent at left -> var(--border) -> transparent) replacing the flat
  `border-t` on home section tops (About, Experience, HomeProjects,
  AgentSection, Publications, Contact).
- About: the SectionHeader `description` ("ML engineer at heart, researcher
  by training...") is promoted to a display-font statement line - rendered in
  font-display at ~text-xl/2xl, `--text-primary`, with the two role phrases
  kept plain (no gradient; one gradient moment per page).

### 4. Project rows that respond (HomeProjects.tsx)

- Row hover: full-row wash via `-mx-4 px-4 rounded-lg` +
  `hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]`-equivalent
  bracket class; title translates x by 4px; a 2px green bar (absolute, left
  edge, scaleY 0 -> 1, origin center) accompanies the wash.
- Every hover class gets its focus-visible twin (group-focus-visible).
- Existing arrow micro-interaction stays.

### 5. CSS scroll-reveal

- New `.animate-reveal` utility: base state fully visible. Inside
  `@supports (animation-timeline: view())`, elements get
  `animation: reveal both; animation-timeline: view(); animation-range: entry 0% entry 40%;`
  (fade + 14px rise, mirroring the `rise` keyframe).
- Explicit `@media (prefers-reduced-motion: reduce)` disables the reveal
  animation entirely (the global duration-zeroing rule does not apply to
  scroll-driven timelines).
- Applied to the inner `div` of each home section (not the section element
  itself - it carries the hairline).

## Verification

No test framework: `npm run type-check` + `npm run build` (never while the
dev server runs) + gstack browse screenshots of the home page, light and
dark, desktop and ~390px mobile width. Check: gradient name legible both
themes, hairlines visible but quiet, reveal degrades (test via reduced-motion
emulation if available), no console errors.

## Out of scope / explicitly rejected

- B (full-bleed statement hero restructure) - rejected: dismantles the
  just-shipped rail identity.
- C (animated graph SVG motif) - deferred, owner picked A.
- Count-up animations on stats (needs JS; static glow only).
- Any change to the always-dark terminal or case-study layouts.
