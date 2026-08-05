// Jobzyl - real product screenshot hero (captured from jobzyl.com) + scrape pipeline arch.

import Image from "next/image";

interface Props {
  accent: string;
  className?: string;
}

// Real screenshot of the live product (jobzyl.com, Aug 2026). Deliberately not a
// mockup: the previous hand-drawn dashboard invented job rows, which read as
// fabricated placements. The live hero also states the case-study numbers
// (20 live boards, 60+ countries, ~1.4s streaming) on the record.
export function JobzylHero({ className }: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Image
        src="/projects/jobzyl/jobzyl-live.png"
        alt="Jobzyl homepage: 'Every public job posting. One search.' - 20 live boards across 60+ countries, searched in parallel and streamed in about 1.4s"
        fill
        sizes="(min-width: 1024px) 960px, 100vw"
        className="object-cover object-top"
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
    { name: "Indeed", kind: "scrape" },
    { name: "Google Jobs", kind: "scrape" },
    { name: "Glassdoor", kind: "scrape" },
    { name: "ZipRecruiter", kind: "scrape" },
    { name: "Reed", kind: "api" },
    { name: "Adzuna", kind: "api" },
  ];

  return (
    <svg
      viewBox="0 0 900 480"
      className={className}
      role="img"
      aria-label="Jobzyl scraper aggregation and SSE streaming pipeline"
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

      {/* Sources stack - 6 boxes vertical, staggered like parallel scrapers spinning up */}
      {sources.map((s, i) => (
        <Box
          key={s.name}
          x={20}
          y={50 + i * 60}
          w={140}
          h={44}
          title={s.name}
          sub={s.kind === "api" ? "official API" : "scraper"}
          delay={i * 0.08}
        />
      ))}

      {/* Aggregator */}
      <Box x={210} y={200} w={140} h={56} title="FastAPI" sub="aggregator · App Runner" delay={0.55} />

      {/* Supabase */}
      <Box x={400} y={170} w={150} h={56} title="Supabase" sub="11 RLS-locked tables" highlight delay={0.7} />

      {/* Scheduler (cache warming) */}
      <Box x={400} y={260} w={150} h={44} title="Scheduler" sub="every 6h re-scrape" delay={0.78} />

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

      {/* Job packets: scrapers → aggregator → storage → stream → client */}
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
        Privacy boundary: CV never leaves the browser. ATS keyword scoring runs entirely client-side; only de-identified job features touch the server.
      </text>
    </svg>
  );
}
