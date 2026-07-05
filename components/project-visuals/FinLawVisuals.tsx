// TODO: replace with real screenshot when available
// FinLaw-UK editorial visuals — knowledge graph hero + ingestion-to-answer architecture.

interface Props {
  accent: string;
  className?: string;
}

export function FinLawHero({ accent, className }: Props) {
  // Knowledge-graph constellation. Center hub = FCA Handbook root, inner ring = chapter/regime
  // anchors, outer ring = individual rule nodes. Dashed lines mark cross-references — the
  // structural connections graph expansion exploits beyond pure dense retrieval.
  const muted = "var(--text-muted)";
  const surface = "var(--surface-elevated)";

  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      role="img"
      aria-label="FinLaw-UK knowledge graph illustration"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id="finlaw-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="500" fill="url(#finlaw-glow)" />

      {/* Cross-reference edges (dashed) — drawn first so they sit behind solid edges */}
      <g stroke={accent} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" fill="none">
        <path d="M 220 130 Q 400 200 580 130" />
        <path d="M 220 130 Q 200 250 200 380" />
        <path d="M 580 130 Q 600 250 600 380" />
        <path d="M 200 380 Q 400 440 600 380" />
      </g>

      {/* Solid hub-and-spoke edges */}
      <g stroke={accent} strokeWidth="1.25" opacity="0.55" fill="none">
        <line x1="400" y1="250" x2="220" y2="130" />
        <line x1="400" y1="250" x2="580" y2="130" />
        <line x1="400" y1="250" x2="200" y2="380" />
        <line x1="400" y1="250" x2="600" y2="380" />
        {/* Inner → outer leaves */}
        <line x1="220" y1="130" x2="115" y2="65" />
        <line x1="220" y1="130" x2="155" y2="200" />
        <line x1="580" y1="130" x2="690" y2="65" />
        <line x1="580" y1="130" x2="650" y2="200" />
        <line x1="200" y1="380" x2="100" y2="445" />
        <line x1="200" y1="380" x2="265" y2="455" />
        <line x1="600" y1="380" x2="535" y2="455" />
        <line x1="600" y1="380" x2="700" y2="445" />
      </g>

      {/* Outer ring — rule leaves */}
      <g>
        {[
          { x: 115, y: 65, label: "Rule 3.2.1" },
          { x: 155, y: 200, label: "Rule 4.1" },
          { x: 690, y: 65, label: "Rule 7.5" },
          { x: 650, y: 200, label: "Rule 8.3" },
          { x: 100, y: 445, label: "Rule 11.2" },
          { x: 265, y: 455, label: "Rule 12.4" },
          { x: 535, y: 455, label: "Rule 14.1" },
          { x: 700, y: 445, label: "Rule 16.2" },
        ].map((n) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="9" fill={surface} stroke={accent} strokeWidth="1.5" />
            <text
              x={n.x}
              y={n.y + 26}
              textAnchor="middle"
              fontFamily="ui-monospace, 'JetBrains Mono', monospace"
              fontSize="10"
              fill={muted}
            >
              {n.label}
            </text>
          </g>
        ))}
      </g>

      {/* Inner ring — chapters / regimes */}
      <g>
        {[
          { x: 220, y: 130, label: "MiFID II" },
          { x: 580, y: 130, label: "SMCR" },
          { x: 200, y: 380, label: "PRA Rulebook" },
          { x: 600, y: 380, label: "COBS" },
        ].map((n) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y} r="18" fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.5" />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontFamily="ui-monospace, 'JetBrains Mono', monospace"
              fontSize="10"
              fontWeight="600"
              fill={accent}
            >
              {n.label}
            </text>
          </g>
        ))}
      </g>

      {/* Hub — FCA Handbook root */}
      <g>
        <circle cx="400" cy="250" r="44" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.75" />
        <circle cx="400" cy="250" r="28" fill={accent} fillOpacity="0.65" />
        <text
          x="400"
          y="246"
          textAnchor="middle"
          fontFamily="ui-monospace, 'JetBrains Mono', monospace"
          fontSize="10"
          fontWeight="700"
          fill="#fff"
        >
          FCA
        </text>
        <text
          x="400"
          y="260"
          textAnchor="middle"
          fontFamily="ui-monospace, 'JetBrains Mono', monospace"
          fontSize="10"
          fontWeight="700"
          fill="#fff"
        >
          HANDBOOK
        </text>
      </g>

      {/* Caption */}
      <text
        x="400"
        y="490"
        textAnchor="middle"
        fontFamily="ui-monospace, 'JetBrains Mono', monospace"
        fontSize="10"
        fill={muted}
        opacity="0.7"
      >
        — — graph expansion follows cross-references — —
      </text>
    </svg>
  );
}

export function FinLawArchitecture({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  // Pipeline boxes: x, y, w, h, label, sub.
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

  const Arrow = ({ x1, y1, x2, y2, dashed }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) => (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={accent} strokeWidth="1.25" opacity="0.7"
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd="url(#finlaw-arrow)"
    />
  );

  return (
    <svg
      viewBox="0 0 900 360"
      className={className}
      role="img"
      aria-label="FinLaw-UK pipeline architecture"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="finlaw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      {/* Stage labels (top) */}
      <text x="80" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">INGEST</text>
      <text x="280" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">PARALLEL EXTRACTION</text>
      <text x="565" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">RETRIEVAL</text>
      <text x="745" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">GENERATE</text>

      {/* Stage 1: Ingest */}
      <Box x={40} y={140} w={140} h={60} title="FCA Documents" sub="chapters · MiFID · COBS" />

      {/* Stage 2a: Embedding stream (top) */}
      <Box x={240} y={70} w={150} h={60} title="Sentence Transformer" sub="dense embeddings" />
      <Box x={420} y={70} w={130} h={60} title="Vector Index" />

      {/* Stage 2b: Graph stream (bottom) */}
      <Box x={240} y={210} w={150} h={60} title="Entity Extraction" sub="rule · chapter · ref" />
      <Box x={420} y={210} w={130} h={60} title="Neo4j Graph" />

      {/* Stage 3: Retrieval (merge) */}
      <Box x={600} y={140} w={130} h={60} title="Graph-Aug Retrieval" sub="dense + 1-hop expand" highlight />

      {/* Stage 4: Generate */}
      <Box x={760} y={140} w={120} h={60} title="Mistral 7B" sub="cited answer" />

      {/* RAGAS feedback loop (dashed, visually behind) */}
      <Box x={420} y={300} w={310} h={36} title="RAGAS · faithfulness 0.76 · answer relevance 0.74" />

      {/* Arrows */}
      <Arrow x1={180} y1={170} x2={240} y2={100} />
      <Arrow x1={180} y1={170} x2={240} y2={240} />
      <Arrow x1={390} y1={100} x2={420} y2={100} />
      <Arrow x1={390} y1={240} x2={420} y2={240} />
      <Arrow x1={550} y1={100} x2={600} y2={155} />
      <Arrow x1={550} y1={240} x2={600} y2={185} />
      <Arrow x1={730} y1={170} x2={760} y2={170} />
      {/* Feedback */}
      <Arrow x1={820} y1={200} x2={730} y2={300} dashed />
    </svg>
  );
}
