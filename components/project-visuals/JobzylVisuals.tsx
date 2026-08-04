// TODO: replace with real screenshot when available
// Jobzyl - dashboard mockup hero (browser frame + job rows + status pills) + scrape pipeline arch.

interface Props {
  accent: string;
  className?: string;
}

export function JobzylHero({ accent, className }: Props) {
  // Stylised browser frame containing a job-list dashboard. Rows show job cards with company,
  // title, location, ATS match score, and status pill. Sidebar shows the application pipeline.
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const surfaceDark = "var(--surface)";
  const border = "var(--border)";

  const jobs = [
    { co: "Anthropic", role: "ML Research Engineer", match: 92, status: "Interview", statusKind: "active" },
    { co: "DeepMind", role: "Research Scientist", match: 88, status: "Applied", statusKind: "active" },
    { co: "Cohere", role: "Backend ML Engineer", match: 84, status: "Saved", statusKind: "neutral" },
    { co: "Hugging Face", role: "Open Source Engineer", match: 79, status: "Saved", statusKind: "neutral" },
  ];

  const statusColor = (kind: string) => (kind === "active" ? accent : muted);

  return (
    <svg
      viewBox="0 0 800 500"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="Jobzyl dashboard mockup with job list and application status"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Browser frame */}
      <rect x="40" y="40" width="720" height="420" rx="10" ry="10" fill={surface} stroke={border} strokeWidth="1.25" />

      {/* Browser chrome */}
      <rect x="40" y="40" width="720" height="36" rx="10" ry="10" fill={surfaceDark} />
      <rect x="40" y="64" width="720" height="12" fill={surfaceDark} />
      <circle cx="60" cy="58" r="5" fill="#ef4444" opacity="0.6" />
      <circle cx="78" cy="58" r="5" fill="#f59e0b" opacity="0.6" />
      <circle cx="96" cy="58" r="5" fill="#10b981" opacity="0.6" />
      <rect x="200" y="48" width="320" height="20" rx="4" ry="4" fill={surface} stroke={border} strokeWidth="1" />
      <text x="216" y="62" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="10" fill={muted}>
        🔒 jobzyl.com/dashboard
      </text>

      {/* Sidebar */}
      <rect x="40" y="76" width="160" height="384" fill={surfaceDark} />
      <text x="60" y="106" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fontWeight="700" fill={muted} letterSpacing="1.5">
        PIPELINE
      </text>
      {[
        { label: "Saved", count: 12 },
        { label: "Applied", count: 4, active: true },
        { label: "Interview", count: 2, active: true },
        { label: "Offer", count: 0 },
        { label: "Rejected", count: 3 },
      ].map((item, i) => (
        <g key={item.label}>
          <text
            x="60"
            y={140 + i * 28}
            fontFamily="ui-sans-serif, Inter, system-ui"
            fontSize="12"
            fontWeight={item.active ? 600 : 400}
            fill={item.active ? accent : text}
          >
            {item.label}
          </text>
          <text
            x="180"
            y={140 + i * 28}
            textAnchor="end"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            fontSize="11"
            fill={muted}
          >
            {item.count}
          </text>
        </g>
      ))}

      {/* Main column header */}
      <text x="222" y="106" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fontWeight="700" fill={muted} letterSpacing="1.5">
        SEARCH RESULTS · 6 BOARDS · LIVE
      </text>
      {/* Live dot */}
      <circle cx="438" cy="103" r="3" fill={accent}>
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Job rows - stagger in like live search results streaming over SSE */}
      {jobs.map((j, i) => {
        const y = 130 + i * 70;
        return (
          <g key={j.co} className="pv-pop pv-hover-group" style={{ animationDelay: `${0.2 + i * 0.18}s` }}>
            <rect x="220" y={y} width="520" height="58" rx="6" ry="6" className="pv-node" fill={surface} stroke={border} strokeWidth="1" />
            {/* Logo placeholder */}
            <rect x="234" y={y + 12} width="34" height="34" rx="4" ry="4" fill={accent} fillOpacity="0.15" />
            <text x="251" y={y + 33} textAnchor="middle" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="10" fontWeight="700" fill={accent}>
              {j.co.slice(0, 2).toUpperCase()}
            </text>
            {/* Role */}
            <text x="284" y={y + 22} fontFamily="ui-sans-serif, Inter, system-ui" fontSize="13" fontWeight="600" fill={text}>
              {j.role}
            </text>
            <text x="284" y={y + 40} fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="10" fill={muted}>
              {j.co} · Remote
            </text>
            {/* Match score */}
            <g transform={`translate(540, ${y + 18})`}>
              <text fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">
                ATS MATCH
              </text>
              <text y="20" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="14" fontWeight="700" fill={accent}>
                {j.match}%
              </text>
            </g>
            {/* Status pill */}
            <g transform={`translate(640, ${y + 18})`}>
              <rect width="86" height="22" rx="11" ry="11" fill={`color-mix(in srgb, ${statusColor(j.statusKind)} 13%, transparent)`} stroke={statusColor(j.statusKind)} strokeWidth="1" />
              <text x="43" y="15" textAnchor="middle" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="10" fontWeight="600" fill={statusColor(j.statusKind)}>
                {j.status}
              </text>
            </g>
          </g>
        );
      })}

      {/* Footer */}
      <text x="222" y="448" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} opacity="0.7">
        Streaming via SSE · scrape progress: indeed ✓ · google ✓ · glassdoor ✓ · ziprecruiter ⋯ · reed ✓ · adzuna ✓
      </text>
    </svg>
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
