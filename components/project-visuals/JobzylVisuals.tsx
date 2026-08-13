// Jobzyl - real product screenshot hero (captured from jobzyl.com) + aggregation pipeline arch.
// Source boxes name only vendors with documented public APIs (matching what
// jobzyl.com itself lists); the rest are grouped without vendor or method.

import Image from "next/image";

interface Props {
  accent: string;
  className?: string;
}

// Real screenshots of the live product showing REAL LISTINGS (jobzyl.com
// /jobs/machine-learning-engineer/united-kingdom, Aug 2026). This replaced a
// capture of the marketing landing page, which sold the product rather than
// showing it working.
//
// Captured from a public category page on purpose. The in-app search sits behind
// a free-account gate, and jobzyl.com's own marketing screenshot carries the
// disclaimer "the listings shown are samples with invented employers, not live
// postings" - so that one can never ship here. The category pages are the only
// surface with real employers, real dates and real source attribution and no
// login. Every row in these captures is a genuine posting.
//
// Two captures, one per theme, toggled with CSS rather than a `useTheme` hook:
// this stays a server component and the correct image is right on first paint,
// with no flash of the wrong one during hydration. Both are identically framed
// at 1280x800 @2x with the consent banner dismissed - reshoot both together or
// the light/dark switch will jump.
//
// These will age: the listings and the "updated N min ago" stamp are frozen at
// capture time. Reshoot when the dates start reading as stale.
const HERO_ALT =
  "Jobzyl showing live Machine Learning Engineer listings in the United Kingdom: 547,019 listings indexed, refreshed minutes earlier, each row naming the employer, location and source board";

export function JobzylHero({ className }: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Image
        src="/projects/jobzyl/jobzyl-live-light.png"
        alt={HERO_ALT}
        fill
        sizes="(min-width: 1024px) 960px, 100vw"
        className="object-cover object-top dark:hidden"
      />
      <Image
        src="/projects/jobzyl/jobzyl-live-dark.png"
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1024px) 960px, 100vw"
        className="hidden object-cover object-top dark:block"
      />
    </div>
  );
}

export function JobzylArchitecture({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const Box = ({ x, y, w, h, title, sub, highlight, delay }: {
    x: number; y: number; w: number; h: number; title: string; sub?: string; highlight?: boolean; delay?: number;
  }) => (
    <g className="pv-pop pv-hover-group" style={{ animationDelay: `${delay ?? 0}s` }}>
      <rect
        x={x} y={y} width={w} height={h} rx="6" ry="6"
        className="pv-node"
        fill={highlight ? `color-mix(in srgb, ${accent} 13%, transparent)` : surface}
        stroke={highlight ? accent : border}
        strokeWidth="1.25"
      />
      <text
        x={x + w / 2}
        y={y + (sub ? h / 2 - 4 : h / 2 + 4)}
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="11"
        fontWeight="600"
        fill={highlight ? accent : text}
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 10}
          textAnchor="middle"
          fontFamily="ui-monospace, 'JetBrains Mono', monospace"
          fontSize="9"
          fill={muted}
        >
          {sub}
        </text>
      )}
    </g>
  );

  const sources = [
    { name: "Reed", sub: "UK" },
    { name: "Adzuna", sub: "19 countries" },
    { name: "Careerjet", sub: "global" },
    { name: "Jooble", sub: "global" },
    { name: "USAJobs", sub: "US" },
    { name: "+15 sources", sub: "incl. remote-only" },
  ];

  return (
    <svg
      viewBox="0 0 900 480"
      className={className}
      role="img"
      aria-label="Jobzyl source aggregation and SSE streaming pipeline"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="jobzyl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      <text x="40" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        SOURCES · parallel
      </text>
      <text x="320" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        AGGREGATE
      </text>
      <text x="490" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        STORAGE · RLS
      </text>
      <text x="660" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
        STREAM · CLIENT
      </text>

      {/* Sources stack - 6 boxes vertical, staggered like parallel fetches spinning up */}
      {sources.map((s, i) => (
        <Box
          key={s.name}
          x={20}
          y={50 + i * 60}
          w={140}
          h={44}
          title={s.name}
          sub={s.sub}
          delay={i * 0.08}
        />
      ))}

      {/* Aggregator */}
      <Box x={210} y={200} w={140} h={56} title="FastAPI" sub="aggregator · App Runner" delay={0.55} />

      {/* Supabase */}
      <Box x={400} y={170} w={150} h={56} title="Supabase" sub="11 RLS-locked tables" highlight delay={0.7} />

      {/* Scheduler (cache warming) */}
      <Box x={400} y={260} w={150} h={44} title="Scheduler" sub="6-hourly cache refresh" delay={0.78} />

      {/* SSE */}
      <Box x={600} y={170} w={130} h={56} title="SSE Stream" sub="live progress" delay={0.85} />

      {/* Client */}
      <Box x={770} y={140} w={110} h={50} title="Next.js" sub="dashboard" delay={0.95} />
      <Box x={770} y={230} w={110} h={50} title="ATS Score" sub="client-side" delay={1.02} />

      {/* Arrows: 6 sources → aggregator */}
      {sources.map((s, i) => (
        <line
          key={s.name}
          x1={160}
          y1={72 + i * 60}
          x2={210}
          y2={228}
          pathLength={1}
          className="pv-draw"
          stroke={accent}
          strokeWidth="1.25"
          opacity="0.55"
          markerEnd="url(#jobzyl-arrow)"
          style={{ animationDelay: `${0.1 + i * 0.08}s` }}
        />
      ))}

      {/* Aggregator → Supabase */}
      <line x1={350} y1={222} x2={400} y2={198} pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "0.65s" }} />
      {/* Aggregator → Scheduler */}
      <line x1={350} y1={234} x2={400} y2={282} className="pv-fade" stroke={accent} strokeWidth="1.25" opacity="0.55" markerEnd="url(#jobzyl-arrow)" strokeDasharray="3 3" style={{ animationDelay: "0.85s" }} />
      {/* Scheduler → Supabase (cache warming feedback) */}
      <line x1={475} y1={260} x2={475} y2={226} className="pv-fade" stroke={accent} strokeWidth="1" opacity="0.45" strokeDasharray="3 3" style={{ animationDelay: "0.95s" }} />

      {/* Supabase → SSE */}
      <line x1={550} y1={198} x2={600} y2={198} pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "0.8s" }} />
      {/* SSE → Next.js */}
      <line x1={730} y1={188} x2={770} y2={165} pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#jobzyl-arrow)" style={{ animationDelay: "0.9s" }} />
      {/* Next.js → ATS (client-only) */}
      <line x1={825} y1={190} x2={825} y2={230} className="pv-fade" stroke={accent} strokeWidth="1.25" opacity="0.55" markerEnd="url(#jobzyl-arrow)" strokeDasharray="3 3" style={{ animationDelay: "1.05s" }} />

      {/* Job packets: sources → aggregator → storage → stream → client */}
      {[0, 2, 4].map((i) => (
        <circle
          key={i}
          r="3.5"
          className="pv-flow"
          fill={accent}
          style={{
            offsetPath: `path("M 160 ${72 + i * 60} L 210 228")`,
            ["--pv-flow-dur" as string]: "2.6s",
            animationDelay: `${i * 0.45}s`,
          }}
        />
      ))}
      <circle r="3.5" className="pv-flow" fill={accent} style={{ offsetPath: 'path("M 350 222 L 400 198")', ["--pv-flow-dur" as string]: "2.6s", animationDelay: "1.3s" }} />
      <circle r="3.5" className="pv-flow" fill={accent} style={{ offsetPath: 'path("M 550 198 L 600 198")', ["--pv-flow-dur" as string]: "2.6s", animationDelay: "1.9s" }} />
      <circle r="3.5" className="pv-flow" fill={accent} style={{ offsetPath: 'path("M 730 188 L 770 165")', ["--pv-flow-dur" as string]: "2.6s", animationDelay: "2.5s" }} />

      {/* Footer */}
      <text x="20" y="460" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted}>
        Scoring runs client-side; the CV is only sent to the server if the user saves it to their account, where it is encrypted at rest.
      </text>
    </svg>
  );
}
