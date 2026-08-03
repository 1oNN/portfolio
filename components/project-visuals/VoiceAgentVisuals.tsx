// TODO: replace with real screenshot when available
// Autonomous Voice Agent - latency before/after hero + websocket inference architecture.

interface Props {
  accent: string;
  className?: string;
}

export function VoiceAgentHero({ accent, className }: Props) {
  // Latency comparison: 2.4s before, 1.1s after. Top bar muted, bottom bar accent.
  // The visual story is the *gap* between them.
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  // 60px (label) + bar starts at x=140, max width 600px. Scale: 1px = 4ms (so 2400ms = 600px).
  const scale = 600 / 2400;
  const beforeWidth = 2400 * scale;
  const afterWidth = 1100 * scale;

  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      role="img"
      aria-label="Voice agent latency reduction: 2.4 seconds to 1.1 seconds"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Section header */}
      <text x="60" y="60" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="11" fontWeight="600" fill={muted} letterSpacing="2">
        MEAN CALL LATENCY
      </text>
      <text x="60" y="80" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} opacity="0.7">
        n = 2,100+ concurrent stateful sessions
      </text>

      {/* Y-axis labels */}
      <text x="60" y="170" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="13" fontWeight="600" fill={text}>Before</text>
      <text x="60" y="270" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="13" fontWeight="600" fill={accent}>After</text>

      {/* Gridlines + ticks */}
      <g stroke={border} strokeWidth="1">
        {[0, 600, 1200, 1800, 2400].map((ms) => {
          const x = 140 + ms * scale;
          return <line key={ms} x1={x} y1={120} x2={x} y2={310} strokeDasharray="2 4" opacity="0.5" />;
        })}
      </g>
      <g fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted}>
        {[
          { ms: 0, label: "0s" },
          { ms: 600, label: "0.6s" },
          { ms: 1200, label: "1.2s" },
          { ms: 1800, label: "1.8s" },
          { ms: 2400, label: "2.4s" },
        ].map(({ ms, label }) => (
          <text key={ms} x={140 + ms * scale} y={330} textAnchor="middle">{label}</text>
        ))}
      </g>

      {/* Before bar (muted) */}
      <rect x="140" y="148" width={beforeWidth} height="42" rx="3" ry="3" fill={surface} stroke={border} strokeWidth="1" />
      <text
        x={140 + beforeWidth - 12}
        y={174}
        textAnchor="end"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="14"
        fontWeight="700"
        fill={text}
      >
        2.4s
      </text>

      {/* After bar (accent) */}
      <rect x="140" y="248" width={afterWidth} height="42" rx="3" ry="3" fill={accent} fillOpacity="0.85" />
      <text
        x={140 + afterWidth - 12}
        y={274}
        textAnchor="end"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="14"
        fontWeight="700"
        fill="var(--accent-contrast)"
      >
        1.1s
      </text>

      {/* Delta callout */}
      <g transform="translate(140, 380)">
        <rect width="200" height="64" rx="6" ry="6" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1.25" />
        <text x="16" y="26" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">REDUCTION</text>
        <text x="16" y="52" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="22" fontWeight="700" fill={accent}>
          −54% · 1.3s
        </text>
      </g>
      <g transform="translate(360, 380)">
        <rect width="200" height="64" rx="6" ry="6" fill={surface} stroke={border} strokeWidth="1" />
        <text x="16" y="26" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">CONCURRENCY</text>
        <text x="16" y="52" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="22" fontWeight="700" fill={text}>
          2,100+ sessions
        </text>
      </g>
    </svg>
  );
}

export function VoiceAgentArchitecture({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const Box = ({ x, y, w, h, title, sub, highlight }: {
    x: number; y: number; w: number; h: number; title: string; sub?: string; highlight?: boolean;
  }) => (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx="6" ry="6"
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

  return (
    <svg
      viewBox="0 0 900 380"
      className={className}
      role="img"
      aria-label="Voice agent inference pipeline architecture"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="voice-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      {/* Stage labels */}
      <text x="40" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">CALLER</text>
      <text x="220" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">SPEECH PIPELINE</text>
      <text x="440" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">INFERENCE BACKEND</text>
      <text x="720" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">TOOLS · asyncio.gather</text>

      <Box x={20} y={170} w={120} h={60} title="📞 Caller" sub="websocket session" />
      <Box x={180} y={170} w={140} h={60} title="Retell AI" sub="ASR + TTS" />
      <Box x={360} y={170} w={150} h={60} title="FastAPI WS" sub="event loop" highlight />
      <Box x={550} y={170} w={140} h={60} title="asyncpg pool" sub="PostgreSQL" />

      {/* Parallel tools (asyncio.gather) */}
      <Box x={730} y={70} w={140} h={50} title="CRM lookup" />
      <Box x={730} y={155} w={140} h={50} title="Calendar" />
      <Box x={730} y={240} w={140} h={50} title="Enrichment" />

      {/* Gatekeeper classifier (above main flow) */}
      <Box x={360} y={70} w={150} h={50} title="Gatekeeper" sub="early-exit classifier" />

      {/* Arrows: main flow */}
      <line x1={140} y1={200} x2={180} y2={200} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#voice-arrow)" />
      <line x1={320} y1={200} x2={360} y2={200} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#voice-arrow)" />
      <line x1={510} y1={200} x2={550} y2={200} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#voice-arrow)" />

      {/* Gatekeeper branch */}
      <line x1={435} y1={170} x2={435} y2={120} stroke={accent} strokeWidth="1.25" strokeDasharray="3 3" opacity="0.55" markerEnd="url(#voice-arrow)" />

      {/* asyncio.gather fan-out */}
      <line x1={690} y1={195} x2={730} y2={95} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#voice-arrow)" />
      <line x1={690} y1={200} x2={730} y2={180} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#voice-arrow)" />
      <line x1={690} y1={205} x2={730} y2={265} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#voice-arrow)" />

      {/* Footnote */}
      <text x="20" y="360" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted}>
        Hot-path optimisation: asyncpg replaces sync ORM · pool sized for sessions, not requests · tools parallelised via asyncio.gather()
      </text>
    </svg>
  );
}
