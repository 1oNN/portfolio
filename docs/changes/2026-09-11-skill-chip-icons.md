# 2026-09-11 - fill in the skill chip icons the CV sync left behind

## Before

`SKILL_ICONS` in `components/sections/SkillsExplorer.tsx` was written against
the old `SKILL_GROUPS`. The 2026-09-09 CV sync rewrote that list and did not
touch the icon map, so the map had drifted in both directions at once.

Seven keys pointed at skills that no longer existed anywhere on the site:
`TensorFlow`, `MLflow`, `Ensemble methods`, `JavaScript`, `C++`, `GCP` and
`GitHub Actions`. Their imports were still in the bundle.

Every skill the sync added rendered as bare text: fastembed (ONNX), pgvector,
Anthropic Claude API, PL/pgSQL, pytest, Playwright, Sentry. So did Neo4j,
Ollama, Sentence Transformers, Oracle Cloud, SQL, Postgres full-text search and
CI build gates, which had never had one. 15 of 37 chips carried a mark.

## After

29 of 37, verified in the browser rather than by reading the map: 29 `<svg>`
nodes under `#skills`, each 13x13 with path geometry and `fill` inherited from
the chip.

Three kinds of entry, and the comment above the map now says which is which:

- the skill's own brand mark, where react-icons 5.7 ships one - `SiPytest`,
  `SiSentry`, `SiNeo4J`, `SiOllama`, `SiClaude`, `SiOnnx`;
- the parent product's mark, where the skill is part of it: `SiPostgresql` for
  pgvector, PL/pgSQL and Postgres full-text search, `SiHuggingface` for
  sentence-transformers, `SiGithubactions` for the CI gates;
- a plain glyph for the two real tools with no mark in any pack react-icons
  carries: `FaDatabase` for SQL, `FaMasksTheater` for Playwright.

Oracle Cloud uses `GrOracle`. It is the real Oracle ring, but Grommet is the
only pack that still has it, which is why there is now an import from a third
icon pack.

Eight chips stay text-only because there is no mark and no honest stand-in:
XGBoost, Whisper (Simple Icons dropped `SiOpenai` in react-icons 5.7), RAGAS,
asyncio, REST APIs, and the three technique-level entries - semantic search,
RAG, cross-encoder re-ranking.

## Rejected

**Drawing Playwright's own logo.** It is a seven-path colour illustration
(`playwright.dev/img/playwright-logo.svg`, 5KB, three greens and two reds). At
13px monochrome it collapses to a blob. The theatre masks are the same metaphor
its logo uses, and read as a glyph rather than a counterfeit mark.

**Inventing marks for the technique entries.** A stock "search" or "network"
glyph next to "RAG" is decoration that implies a product exists. The pre-existing
rule in this file was that a wrong-but-close glyph is worse than none, and it
still holds for anything that is not a shippable tool.

**Leaving the seven dead keys in place.** They cost nothing at runtime, but the
next person to edit the map would have had to work out which half of it was live.
