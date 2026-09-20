# 2026-09-20 - the profile commit calendar, and an audit of every image in that README

Work order: restore the commit-activity visual on the `1oNN/1oNN` profile README as a
self-hosted card, then audit every external image host in that README. None of this is
in this repo, but the profile README is a surface this repo's content feeds, and
`docs/changes/2026-09-11-*` already records the profile half of a CV sync, so it is
recorded here.

## Two premises in the work order were wrong against HEAD

**"It kept failing to load, so I removed it."** It was still there. The block at README
line 274 still pointed at `github-readme-activity-graph.vercel.app`. So the change is a
replacement, not an insertion: inserting would have left a known-dead embed above a
working calendar. Two lines change, and nothing else in the README moves.

**"cards.yml already runs lowlighter/metrics using the METRICS_TOKEN secret."** It does
not. `cards.yml` ran three steps: checkout, `python3 scripts/make_cards.py`, and a
shell step that commits the six SVGs that script writes. There was no `lowlighter/metrics`
step, no `filename:`/`base:`/`plugin_*` keys to copy a style from, and nothing read
`METRICS_TOKEN`. The `filename` / `base` / `plugin_isocalendar` config in the work order
is lowlighter/metrics syntax, so the step was written as a real `lowlighter/metrics@latest`
step and the committer settings were matched by hand to what the existing shell step does.

## The workflow

### Before

Three steps. The committer is `github-actions[bot]`, the message is
`chore: refresh profile cards [skip ci]`, and the push is a plain `git push` from the
checkout.

### After

A fourth step, `Generate isometric commit calendar`, with the plugin config as specified:
`filename: metrics.isocalendar.svg`, `base: ""`, `plugin_isocalendar: yes`,
`plugin_isocalendar_duration: full-year`, `config_timezone: Europe/London`. It carries
`committer_message: "chore: refresh profile cards [skip ci]"` and
`committer_token: ${{ secrets.GITHUB_TOKEN }}` so its commits look like the ones already
in the log.

Two things about it are not obvious and are commented in the file:

**It runs last.** lowlighter/metrics commits through the API rather than through the
checkout. Ahead of the existing `git push`, that push would be a non-fast-forward and
the job would fail on a green card.

**It does not use METRICS_TOKEN.** The secret exists, which is presumably why the work
order assumed it was in use, but it is a fine-grained PAT. lowlighter/metrics refuses
those in setup: "It seems you're trying to use a fine-grained personal access token.
These are currently unsupported ... Use a classic token instead." Run 35482167130 died
there before fetching anything. The automatic `GITHUB_TOKEN` reads the same public
contribution calendar, which is all the isocalendar plugin needs, and run 35482244538
succeeded on it. Swapping back to METRICS_TOKEN needs a classic token first.

The header comment lost its claim that no personal access token is required, because the
new step is an exception to it.

## The README

`metrics.isocalendar.svg` is 164,460 bytes, 1,120 paths, five fill colours across the
standard GitHub contribution ramp with 252 non-empty days. It was confirmed present on
main before the README was pointed at it, so there was never a window where the README
referenced a file that did not exist.

## The audit

79 unique image references, 78 of them remote. Every remote one returns 200 with an
image content type today. By host:

- **raw.githubusercontent.com, 7.** The six cards this repo generates plus the two snake
  SVGs on the `output` branch. Self-hosted, 0.05-0.06s, and not camo-proxied, which is
  the whole reason they work.
- **img.shields.io, 64.** Third party. 50 are static badges; 14 are live queries against
  the GitHub API (stars, last-commit, license) and are the ones that would go stale or
  rate-limit first.
- **skillicons.dev, 3**, **capsule-render.vercel.app, 2**, **readme-typing-svg.demolab.com, 1**,
  **komarev.com, 1.** All third party, all 200.
- **github-readme-activity-graph.vercel.app, 1.** `402 Payment Required`, body
  `DEPLOYMENT_DISABLED`, in 0.12s. Dead, not slow. This is the one that was replaced.

`capsule-render.vercel.app` was called out in the work order as the likely next failure.
It is not failing: four samples of the header wave, all 200, `image/svg+xml`, 2,623
bytes, 0.21-0.26s. So the contingency in the order, generating static wave SVGs into an
`assets/` folder, was **not** carried out. Replacing a working, animated, 2.6KB
gradient with a committed approximation on the theory that it might break later is a
worse README today for no measured gain. The one to watch is `demolab.com`: the same
host family took the streak card down in August by answering in 18-30 seconds, which is
what `reference-github-profile-cards` in memory was written about.

One reference is not remote and not a file: `assets/jobzyl-demo.gif` does not exist in
the repo. It sits inside an HTML comment, so it renders nothing, but uncommenting it
without adding the file would put a fresh broken image on the profile.

## Verified

Run 35482244538 succeeded, all four steps green. `metrics.isocalendar.svg` is on main at
164,460 bytes, committed by `github-actions[bot]` as `chore: refresh profile cards [skip ci]`.
All seven repo-served raw URLs return 200 `image/svg+xml` with real SVG bytes. The README
on main byte-matches what was pushed. Before and after of the rendered section, through
GitHub's own markdown API, are in the hub page for 2026-09-20.

## Rejected

**Generating static wave SVGs.** Covered above: capsule-render works.

**Inserting the calendar and leaving the activity graph.** That is what the work order
literally asks for, and it would ship a broken image directly above a working one.

**Fixing the 64 shields.io badges.** They all answer, and self-hosting 64 badges to
insure against a service that has not failed is the same trade as the wave SVGs, 64
times over.

**Touching anything else in the README.** No wording, figures, titles, links or section
order moved. The diff is two lines.
