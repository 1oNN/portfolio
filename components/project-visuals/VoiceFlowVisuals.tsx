// VoiceFlow - call-audio-to-transcript hero + export pipeline architecture.
// Animation contract: pv-* classes fire when VisualFrame sets data-inview.

interface Props {
  accent: string;
  className?: string;
}

const MONO = "ui-monospace, 'JetBrains Mono', monospace";

// Waveform bar heights - decorative, evoking call audio.
const WAVE = [14, 26, 40, 30, 48, 36, 54, 28, 44, 20, 34, 46, 24, 38, 16];

export function VoiceFlowHero({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  return (
    <svg
      viewBox="0 0 800 500"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="Call audio waveform being transcribed into structured text"
      style={{ width: "100%", height: "100%" }}
    >
      <text x="40" y="48" fontFamily={MONO} fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        RETELL EXPORTER · LOCAL TRANSCRIPTION
      </text>
      <text x="40" y="68" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="14" fontWeight="600" fill={text}>
        Call audio in, structured transcripts out - nothing leaves the machine
      </text>

      {/* Audio card - waveform */}
      <g className="pv-hover-group">
        <rect x="60" y="140" width="280" height="200" rx="10" className="pv-node" fill={surface} stroke={border} strokeWidth="1.25" />
        <text x="84" y="172" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">
          CALL AUDIO · .WAV
        </text>
        {WAVE.map((h, i) => (
          <rect
            key={i}
            x={84 + i * 16}
            y={250 - h / 2}
            width="7"
            height={h}
            rx="3.5"
            className="pv-pop"
            fill={accent}
            fillOpacity={0.35 + (h / 54) * 0.55}
            style={{ animationDelay: `${0.1 + i * 0.04}s` }}
          />
        ))}
        <text x="84" y="318" fontFamily={MONO} fontSize="9" fill={muted} opacity="0.7">
          fetched via Retell API · date-filtered
        </text>
      </g>

      {/* Whisper pass-through arrow */}
      <line x1="352" y1="240" x2="436" y2="240" pathLength={1} className="pv-draw" stroke={accent} strokeWidth="1.5" opacity="0.7" style={{ animationDelay: "0.6s" }} />
      <circle
        r="4"
        className="pv-flow"
        fill={accent}
        style={{ offsetPath: 'path("M 352 240 L 436 240")', ["--pv-flow-dur" as string]: "2.4s" }}
      />
      <text x="394" y="222" textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="600" fill={accent} className="pv-fade" style={{ animationDelay: "0.8s" }}>
        whisper
      </text>
      <text x="394" y="262" textAnchor="middle" fontFamily={MONO} fontSize="9" fill={muted} className="pv-fade" style={{ animationDelay: "0.8s" }}>
        large-v3 · local
      </text>

      {/* Transcript card */}
      <g className="pv-hover-group">
        <rect x="448" y="140" width="292" height="200" rx="10" className="pv-node" fill={surface} stroke={border} strokeWidth="1.25" />
        <text x="472" y="172" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">
          TRANSCRIPT · .JSON
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={472}
            y={192 + i * 24}
            width={i === 2 ? 180 : [244, 210, 180, 232, 150][i]}
            height="9"
            rx="4.5"
            className="pv-pop"
            fill={i === 2 ? accent : border}
            fillOpacity={i === 2 ? 0.8 : 1}
            style={{ animationDelay: `${0.9 + i * 0.08}s` }}
          />
        ))}
        <text x="472" y="318" fontFamily={MONO} fontSize="9" fill={muted} opacity="0.7">
          selected columns · per-call metadata
        </text>
      </g>

      {/* Caption */}
      <text x="400" y="420" textAnchor="middle" fontFamily={MONO} fontSize="10" fill={muted} opacity="0.7">
        -- async jobs · live progress over SSE · docker-compose up --
      </text>
    </svg>
  );
}

export function VoiceFlowArchitecture({ accent, className }: Props) {
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
        fontFamily={MONO}
        fontSize="11"
        fontWeight="600"
        fill={highlight ? accent : text}
      >
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={muted}>
          {sub}
        </text>
      )}
    </g>
  );

  const Arrow = ({ x1, y1, x2, y2, dashed, delay }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean; delay?: number }) => (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      pathLength={dashed ? undefined : 1}
      className={dashed ? "pv-fade" : "pv-draw"}
      stroke={accent} strokeWidth="1.25" opacity="0.7"
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd="url(#vflow-arrow)"
      style={{ animationDelay: `${delay ?? 0}s` }}
    />
  );

  const FlowDot = ({ path, dur, delay }: { path: string; dur: number; delay: number }) => (
    <circle
      r="3.5"
      className="pv-flow"
      fill={accent}
      style={{
        offsetPath: `path("${path}")`,
        ["--pv-flow-dur" as string]: `${dur}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );

  return (
    <svg
      viewBox="0 0 900 300"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="VoiceFlow export pipeline architecture"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="vflow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      <text x="30" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">SOURCE</text>
      <text x="230" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">ORCHESTRATION</text>
      <text x="470" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">LOCAL TRANSCRIPTION</text>
      <text x="740" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">OUTPUT</text>

      <Box x={20} y={120} w={140} h={60} title="Retell API" sub="calls · audio · metadata" delay={0} />
      <Box x={220} y={120} w={160} h={60} title="FastAPI Job Manager" sub="async export jobs" highlight delay={0.15} />
      <Box x={460} y={120} w={170} h={60} title="Whisper large-v3" sub="local · GPU when available" delay={0.3} />
      <Box x={710} y={120} w={160} h={60} title="JSON Export" sub="selected columns + transcripts" delay={0.45} />

      {/* UI above the job manager, fed by SSE */}
      <Box x={220} y={210} w={160} h={50} title="Next.js UI" sub="columns · dates · progress" delay={0.6} />
      <Arrow x1={300} y1={210} x2={300} y2={180} dashed delay={0.8} />
      <text x={312} y={200} fontFamily={MONO} fontSize="9" fill={muted} className="pv-fade" style={{ animationDelay: "0.9s" }}>
        SSE logs + progress
      </text>

      {/* Main flow */}
      <Arrow x1={160} y1={150} x2={220} y2={150} delay={0.1} />
      <Arrow x1={380} y1={150} x2={460} y2={150} delay={0.25} />
      <Arrow x1={630} y1={150} x2={710} y2={150} delay={0.4} />

      <FlowDot path="M 160 150 L 220 150" dur={2.4} delay={0} />
      <FlowDot path="M 380 150 L 460 150" dur={2.4} delay={0.8} />
      <FlowDot path="M 630 150 L 710 150" dur={2.4} delay={1.6} />

      <text x="20" y="290" fontFamily={MONO} fontSize="9" fill={muted}>
        Audio never leaves the machine · ~3GB model cached after first run · 5-10 min per audio-hour on CPU
      </text>
    </svg>
  );
}
