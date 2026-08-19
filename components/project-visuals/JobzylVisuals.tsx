import { PvBox } from "./primitives";
// Jobzyl - recorded product tour (captured from jobzyl.com) + ingest pipeline arch.
// Source boxes name only vendors with documented public APIs (matching what
// jobzyl.com itself lists); the rest are grouped without vendor or method.

import Image from "next/image";
import JobzylTourVideo from "./JobzylTourVideo";

interface Props {
  accent: string;
  className?: string;
}

// Recordings of the live product showing REAL LISTINGS, Aug 2026: a search
// running, then the results, the insights panel and a job detail.
//
// Recorded on public surfaces on purpose. jobzyl.com's own marketing screenshot
// carries the disclaimer "the listings shown are samples with invented
// employers, not live postings" - so that one can never ship here. Anonymous
// search is real: it serves the cache, with real employers, real dates and real
// source attribution. Every row in these recordings is a genuine posting.
//
// Both start at the search rather than the landing page, which is not a framing
// preference: the product's hero still advertises a 2M index, and this case
// study withdraws that number. Showing it here would contradict the page it
// sits on.
//
// Two recordings, one per theme, because the product's dark mode is a different
// palette rather than an inverted one. The still below is a frame from partway
// in, and is what ships when JavaScript or motion is unavailable - reshoot the
// pair together or the light/dark switch will jump.
//
// These will age: the listings, the job count and the "1w ago" stamps are frozen
// at capture time. Reshoot when the dates start reading as stale.
const HERO_ALT =
  "Jobzyl showing live Machine Learning Engineer listings in the United Kingdom: 487 jobs matched, each row naming the employer, location and the board it came from, beside a panel breaking down the salaries, skills and employers across the whole result set";

export function JobzylHero({ className }: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <StillPair />
      <JobzylTourVideo />
    </div>
  );
}

/**
 * The still on its own, for the hover preview on /projects. That carousel
 * advances every 1.8s, which is long enough to show one frame of a 22s tour and
 * not much else - so it gets the poster and none of the bytes.
 */
export function JobzylHeroStill({ className }: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <StillPair />
    </div>
  );
}

function StillPair() {
  return (
    <>
      <Image
        src="/projects/jobzyl/jobzyl-tour-light.png"
        alt={HERO_ALT}
        fill
        sizes="(min-width: 1024px) 960px, 100vw"
        className="object-cover object-top dark:hidden"
      />
      <Image
        src="/projects/jobzyl/jobzyl-tour-dark.png"
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1024px) 960px, 100vw"
        className="hidden object-cover object-top dark:block"
      />
    </>
  );
}

export function JobzylArchitecture({ accent, className }: Props) {
  const muted = "var(--text-muted)";

  // Only boards Jobzyl discloses publicly. LinkedIn, Glassdoor, Google Jobs and
  // ZipRecruiter are reached through one provider's own fan-out and are not
  // entries in the registry - naming them as sources here would be false.
  const sources = [
    { name: "Reed", sub: "UK" },
    { name: "Adzuna", sub: "19 countries" },
    { name: "Careerjet", sub: "global" },
    { name: "Jooble", sub: "global" },
    { name: "USAJobs", sub: "US federal" },
    { name: "+15 boards", sub: "incl. remote-only" },
    { name: "7 ATS APIs", sub: "company careers" },
  ];

  return (
    <svg
      viewBox="0 0 900 480"
      className={className}
      role="img"
      aria-label="Jobzyl ingest pipeline: parallel source fan-out, an integrity pass that dedupes and gates what it cannot verify, RLS-locked storage, and SSE streaming to the client"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="jobzyl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      <text x="30" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        SOURCES · parallel
      </text>
      <text x="215" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        AGGREGATE
      </text>
      <text x="400" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        STORAGE · RLS
      </text>
      <text x="600" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        STREAM · CLIENT
      </text>

      {/* Sources stack - staggered like parallel fetches spinning up */}
      {sources.map((s, i) => (
        <PvBox accent={accent}
          key={s.name}
          x={20}
          y={40 + i * 54}
          w={140}
          h={42}
          title={s.name}
          sub={s.sub}
          delay={i * 0.07}
        />
      ))}

      {/* Aggregator */}
      <PvBox accent={accent} x={210} y={150} w={150} h={52} title="FastAPI" sub="fan-out · App Runner" delay={0.55} />

      {/* The integrity pass - the part of this pipeline that is actually load-bearing */}
      <PvBox accent={accent} x={210} y={235} w={150} h={52} title="Integrity" sub="dedupe · pay gate" highlight delay={0.65} />

      {/* Supabase */}
      <PvBox accent={accent} x={400} y={150} w={150} h={52} title="Supabase" sub="23 RLS-locked tables" highlight delay={0.75} />

      {/* Scheduler */}
      <PvBox accent={accent} x={400} y={235} w={150} h={52} title="Scheduler" sub="6-hourly · 30-min queue" delay={0.82} />

      {/* Liveness sweep */}
      <PvBox accent={accent} x={400} y={320} w={150} h={42} title="Liveness" sub="reprobes stored URLs" delay={0.88} />

      {/* SSE */}
      <PvBox accent={accent} x={600} y={150} w={130} h={52} title="SSE Stream" sub="per-board progress" delay={0.9} />

      {/* Client */}
      <PvBox accent={accent} x={770} y={125} w={110} h={48} title="Next.js" sub="results" delay={0.98} />
      <PvBox accent={accent} x={770} y={210} w={110} h={48} title="ATS Score" sub="in-browser" delay={1.05} />

      {/* Arrows: sources → aggregator */}
      {sources.map((s, i) => (
        <line
          key={s.name}
          x1={160}
          y1={61 + i * 54}
          x2={210}
          y2={176}
          pathLength={1}
          className="pv-draw"
          stroke={accent}
          strokeWidth="1.25"
          opacity="0.55"
          markerEnd="url(#jobzyl-arrow)"
          style={{ animationDelay: `${0.1 + i * 0.07}s` }}
        />
      ))}

      {/* Aggregator → Integrity → Supabase: nothing reaches storage unchecked */}
      <line x1={285} y1={202} x2={285} y2={235} pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "0.6s" }} />
      <line x1={360} y1={255} x2={400} y2={190} pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "0.7s" }} />
      {/* Scheduler drives the fan-out rather than the other way round */}
      <line x1={400} y1={261} x2={360} y2={176} className="pv-fade" stroke={accent} strokeWidth="1.25" opacity="0.5" markerEnd="url(#jobzyl-arrow)" strokeDasharray="3 3" style={{ animationDelay: "0.9s" }} />
      {/* The sweep is scheduled work, not a request path */}
      <line x1={475} y1={287} x2={475} y2={318} className="pv-fade" stroke={accent} strokeWidth="1" opacity="0.45" strokeDasharray="3 3" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "1s" }} />

      {/* Supabase → SSE */}
      <line x1={550} y1={176} x2={600} y2={176} pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "0.85s" }} />
      {/* SSE → Next.js */}
      <line x1={730} y1={168} x2={770} y2={149} pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "0.95s" }} />
      {/* Next.js → ATS (client-only) */}
      <line x1={825} y1={173} x2={825} y2={210} className="pv-fade" stroke={accent} strokeWidth="1.25" opacity="0.55" markerEnd="url(#jobzyl-arrow)" strokeDasharray="3 3" style={{ animationDelay: "1.08s" }} />

      {/* Job packets: sources → aggregator → integrity → storage → stream → client */}
      {[0, 3, 6].map((i) => (
        <circle
          key={i}
          r="3.5"
          className="pv-flow"
          fill={accent}
          style={{
            offsetPath: `path("M 160 ${61 + i * 54} L 210 176")`,
            ["--pv-flow-dur" as string]: "2.6s",
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
      <circle r="3.5" className="pv-flow" fill={accent} style={{ offsetPath: 'path("M 285 202 L 285 235")', ["--pv-flow-dur" as string]: "2.6s", animationDelay: "1.2s" }} />
      <circle r="3.5" className="pv-flow" fill={accent} style={{ offsetPath: 'path("M 360 255 L 400 190")', ["--pv-flow-dur" as string]: "2.6s", animationDelay: "1.6s" }} />
      <circle r="3.5" className="pv-flow" fill={accent} style={{ offsetPath: 'path("M 550 176 L 600 176")', ["--pv-flow-dur" as string]: "2.6s", animationDelay: "2s" }} />
      <circle r="3.5" className="pv-flow" fill={accent} style={{ offsetPath: 'path("M 730 168 L 770 149")', ["--pv-flow-dur" as string]: "2.6s", animationDelay: "2.5s" }} />

      {/* Footer */}
      <text x="20" y="462" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted}>
        Keyword scoring runs in the browser and uploads nothing. Semantic and AI scoring are opt-in: they need an account and a CV stored encrypted at rest.
      </text>
    </svg>
  );
}
