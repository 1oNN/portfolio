# 2026-09-11 - instant filters on both listings, and three deep dives from the JobFlux change records

## Before

`/blog` and `/projects` each carried their own filter nav, near-identical markup
in two files, and both worked the same way: every click was a `<Link>` to
`?type=` or `?category=`, so narrowing a list already sitting in memory cost a
router round trip and a re-render of the whole segment.

That was the only filter either page had. No search, no way to filter by tag or
by stack, and no count other than the per-tab one. The empty state said "No
projects in this category yet", which names the category and nothing else,
because the category was the only thing that could have emptied it.

The blog held 8 posts, four of them Jobzyl deep dives, with three interactive
embeds between them.

## After

One `components/ui/FilterRail.tsx` renders the filter row on both pages, driven
by `hooks/useListingFilter.ts`. State leads and the URL follows, written with
`window.history.replaceState`, which Next 16 documents as integrating with the
router and syncing `useSearchParams` without a reload.

Verified rather than assumed: set `window.__noReload` in the console, clicked a
tag chip, and the variable survived while the URL became `/blog?tag=PostgreSQL`.
No navigation happens. `/blog` and `/projects` both still build as static with
their `revalidate` intact, which was the thing most at risk in this change.

Both pages now carry an instant tab filter, a type-to-filter box over titles,
excerpts and tags (`/` focuses, Escape clears then blurs), chips with live
counts folded at 8 behind a "+N more", a running result count, and a "Clear all"
that only appears when something is filtering. Empty states name every control
responsible: `Nothing matches "kubernetes" in PostgreSQL under Notes.`

Deep links survive in both directions. A cold load of
`/blog?type=case-study&tag=PostgreSQL&q=timeout` seeds all three controls and
returns the one post that matches. Tags on a post page are now links into
`/blog?tag=`, which is what makes the chip row reachable from a post.

Three new deep dives, all drawn from `F:/Projects/JobFlux/docs/changes`, each
with a runnable embed:

- `corpus-outgrew-the-box`, on 21.5 GB of working set against 12 GB of RAM and
  the 8s `statement_timeout` that turned a slow read into `total: 0`. The embed
  is a RAM and corpus slider against that 8s line, calibrated on the two
  measured configurations.
- `250-open-streams-http2-leak`, on `postgrest/_sync/client.py:102` hardcoding
  `http2=True`. The embed is a 250-slot pool you can wedge under HTTP/2 and
  cannot under HTTP/1.1.
- `thirty-of-five-hundred-starved-band`, on a yield guard reading hit/DECIDED
  where it should read hit/PROBED. The embed reproduces the measured band
  exactly from its constants: 30 decided, 470 incomplete, 6 boards, 30.4m,
  20.0% against 1.2%, 467 hours.

The blog is now 11 posts and 6 embeds. `lib/listing-filter.ts` holds the pure
matching rules and has 19 tests; the suite is 228 passing, up from 209.

## Found in the browser, not in the diff

Three things only showed up once the pages were rendered, and all three are
fixed here.

**The chip counts were dishonest.** They were first computed excluding their own
dimension, which is the right rule for a single-select facet and the wrong one
for additive AND chips. With RAGAS selected, PostgreSQL still advertised 5 while
clicking it would have returned nothing. Counts are now taken against the
current result set, so a chip predicts its own click and a dead one reads 0 and
disables itself. This is the same rule the existing `facet-counts` post argues
for, applied to the listing that shipped after it.

**The capacity model was loose.** At 24 GB it read 5.4s against a measured 2.0s,
near enough to the 8s line to blur the point the post is making. Recalibrated on
the measured point: 24 GB now reads 2.0s and 12 GB reads 21s, which sits between
the 16.3s a reader waited and the 55s the read costs untimed.

**`.blog-content ul li::before` was reaching into the embeds.** Every embed
using a list got a `→` marker, so a stack of `LocalProtocolError` lines rendered
as prose bullets. A scoped rule on a new `post-embed` class fixes it, and fixes
the two embeds that already had it.

Also swapped the embeds' failure states from `--accent-secondary` to the
existing `--danger` token. Secondary accent is green in light mode, so
"Killed at 8s" was rendering as a success.

## Rejected

**`router.replace` for the URL sync.** It is the obvious API and it puts the
round trip straight back, which is the whole thing being removed.

**Dropping the anchors for buttons.** The tab row has to stay real `<a href>` so
it is crawlable and cmd-clickable. Only an unmodified left click is intercepted;
everything else falls through to the link.

**Filtering the cards client-side on `/projects`.** The cards arrive as
already-rendered nodes, so the search box has no text to read. Rendering them in
the browser instead would have solved that and dragged the whole of
`lib/case-studies` into the bundle. The searchable string and the stack list are
flattened on the server and passed alongside the node.

**Changing what the home page shows.** `HomeWriting` takes the newest 4 posts,
and the three added here are the newest and all deep dives, so the home writing
row is now four deep dives with no Note. That is the honest consequence of the
posts, not a bug, and changing the selection rule is a separate decision.
