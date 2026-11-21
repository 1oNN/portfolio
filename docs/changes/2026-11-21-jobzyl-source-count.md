# 2026-11-21 - Jobzyl has more than 100,000 sources, not 11

The sync of 2026-11-20 called Jobzyl "a job search over 11 sources" and put the
crawler beside that number as a separate thing. That undersold it. The 11 is only
the job boards a live search queries. Every employer career page the crawler reads
is a source too, and there were 111,850 of them on 2026-11-19.

## Before

- Tagline: "One job search over 11 sources and 111,000 employer career pages".
- About: "a live job search over 11 sources and a crawler I wrote that reads 111,000
  employer career pages".
- Metric: "111K, Employer career pages read".
- The 29 to 11 cut was described as the source list going down.
- The chat agent was told to say "up to 11 sources queried".

## After

- Headline figure everywhere: more than 100,000 sources (100,000+ or 100K+ where
  space is short), with the breakdown beside it: 111,850 employer career pages read
  by the crawler, plus 11 job boards and public job sites.
- The 29 to 11 cut is still told, as a cut to the job board list.
- The diagram's last two boxes read "+6 job boards, 11 boards in all" and "Crawler,
  111,850 employer sites".
- The chat agent is told never to say Jobzyl has only 11 sources.
- One caveat added to the case study: the 100,000 figure counts pages the crawler
  reads on its own schedule, not sites queried when you press search. A live search
  queries up to 11 boards.

## Where the number comes from

111,850 employer pages is the crawler's own report of 2026-11-19, the same figure
the site already carried. 111,850 plus 11 is 111,861. Nothing was remeasured for
this change. Only the framing moved.

## Checks

`npx tsc --noEmit` clean, `npm run lint` clean, `npm test` passing. No local build.
CI builds on push.
