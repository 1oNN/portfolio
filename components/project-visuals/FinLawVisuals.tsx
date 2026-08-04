// FinLaw-UK editorial visuals - knowledge graph hero + ingestion-to-answer architecture.
// Animation contract: draw/pop/fade classes fire when the wrapping VisualFrame
// sets data-inview; hover groups highlight a cluster and dim the rest (pv-* in globals.css).

interface Props {
  accent: string;
  className?: string;
}

// Inner-ring regime anchors with their leaf rules - grouped so hover lights
// up a whole cluster (anchor, leaves, and the edges between them).
const CLUSTERS = [
  {
    label: "MiFID II",
    x: 220,
    y: 130,
    leaves: [
      { x: 115, y: 65, label: "Rule 3.2.1" },
      { x: 155, y: 200, label: "Rule 4.1" },
    ],
  },
  {
    label: "SMCR",
    x: 580,
    y: 130,
    leaves: [
      { x: 690, y: 65, label: "Rule 7.5" },
      { x: 650, y: 200, label: "Rule 8.3" },
    ],
  },
  {
    label: "PRA Rulebook",
    x: 200,
    y: 380,
    leaves: [
      { x: 100, y: 445, label: "Rule 11.2" },
      { x: 265, y: 455, label: "Rule 12.4" },
    ],
  },
  {
    label: "COBS",
    x: 600,
    y: 380,
    leaves: [
      { x: 535, y: 455, label: "Rule 14.1" },
      { x: 700, y: 445, label: "Rule 16.2" },
    ],
  },
];

export function FinLawHero({ accent, className }: Props) {
  // Knowledge-graph constellation. Center hub = FCA Handbook root, inner ring = chapter/regime
  // anchors, outer ring = individual rule nodes. Dashed lines mark cross-references - the
  // structural connections graph expansion exploits beyond pure dense retrieval.
  const muted = "var(--text-muted)";
  const surface = "var(--surface-elevated)";

  return (
    <svg
      viewBox="0 0 800 500"
      className={`pv-interactive ${className ?? ""}`}
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

      {/* Cross-reference edges (dashed) - fade in rather than draw so the
          dash pattern survives; drawn first to sit behind solid edges */}
      <g stroke={accent} strokeWidth="1" strokeDasharray="3 4" opacity="0.45" fill="none" className="pv-fade" style={{ animationDelay: "0.9s" }}>
        <path d="M 220 130 Q 400 200 580 130" />
        <path d="M 220 130 Q 200 250 200 380" />
        <path d="M 580 130 Q 600 250 600 380" />
        <path d="M 200 380 Q 400 440 600 380" />
      </g>

      {/* Regime clusters: hub spoke + anchor + leaves, one hover group each */}
      {CLUSTERS.map((c, ci) => (
        <g key={c.label} className="pv-hover-group">
          {/* Hub spoke */}
          <line
            x1="400" y1="250" x2={c.x} y2={c.y}
            pathLength={1}
            className="pv-edge pv-draw"
            stroke={accent} strokeWidth="1.25" opacity="0.55"
            style={{ animationDelay: `${0.15 + ci * 0.12}s` }}
          />
          {/* Leaf edges + leaves */}
          {c.leaves.map((leaf, li) => (
            <g key={leaf.label}>
              <line
                x1={c.x} y1={c.y} x2={leaf.x} y2={leaf.y}
                pathLength={1}
                className="pv-edge pv-draw"
                stroke={accent} strokeWidth="1.25" opacity="0.55"
                style={{ animationDelay: `${0.45 + ci * 0.12 + li * 0.08}s` }}
              />
              <circle
                cx={leaf.x} cy={leaf.y} r="9"
                className="pv-node pv-pop"
                fill={surface} stroke={accent} strokeWidth="1.5"
                style={{ animationDelay: `${0.6 + ci * 0.12 + li * 0.08}s` }}
              />
              <text
                x={leaf.x}
                y={leaf.y + 26}
                textAnchor="middle"
                fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                fontSize="10"
                fill={muted}
              >
                {leaf.label}
              </text>
            </g>
          ))}
          {/* Regime anchor */}
          <circle
            cx={c.x} cy={c.y} r="18"
            className="pv-node pv-pop"
            fill={accent} fillOpacity="0.18" stroke={accent} strokeWidth="1.5"
            style={{ animationDelay: `${0.3 + ci * 0.12}s` }}
          />
          <text
            x={c.x}
            y={c.y + 4}
            textAnchor="middle"
            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
            fontSize="10"
            fontWeight="600"
            fill={accent}
          >
            {c.label}
          </text>
        </g>
      ))}

      {/* Hub - FCA Handbook root, gently pulsing */}
      <g className="pv-hover-group">
        <circle cx="400" cy="250" r="44" className="pv-node pv-pop pv-pulse" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.75" />
        <circle cx="400" cy="250" r="28" className="pv-pop" fill={accent} fillOpacity="0.65" style={{ animationDelay: "0.1s" }} />
        <text
          x="400"
          y="246"
          textAnchor="middle"
          fontFamily="ui-monospace, 'JetBrains Mono', monospace"
          fontSize="10"
          fontWeight="700"
          fill="var(--accent-contrast)"
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
          fill="var(--accent-contrast)"
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
        -- graph expansion follows cross-references --
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

  const Arrow = ({ x1, y1, x2, y2, dashed, delay }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean; delay?: number }) => (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      pathLength={dashed ? undefined : 1}
      className={dashed ? "pv-fade" : "pv-draw"}
      stroke={accent} strokeWidth="1.25" opacity="0.7"
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd="url(#finlaw-arrow)"
      style={{ animationDelay: `${delay ?? 0}s` }}
    />
  );

  // Data packets riding the two extraction streams.
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
      viewBox="0 0 900 360"
      className={`pv-interactive ${className ?? ""}`}
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
      <Box x={40} y={140} w={140} h={60} title="FCA Documents" sub="chapters · MiFID · COBS" delay={0} />

      {/* Stage 2a: Embedding stream (top) */}
      <Box x={240} y={70} w={150} h={60} title="Sentence Transformer" sub="dense embeddings" delay={0.15} />
      <Box x={420} y={70} w={130} h={60} title="Vector Index" delay={0.3} />

      {/* Stage 2b: Graph stream (bottom) */}
      <Box x={240} y={210} w={150} h={60} title="Entity Extraction" sub="rule · chapter · ref" delay={0.15} />
      <Box x={420} y={210} w={130} h={60} title="Neo4j Graph" sub="citation validation" delay={0.3} />

      {/* Stage 3: Retrieval (merge) */}
      <Box x={600} y={140} w={130} h={60} title="Graph-Aug Retrieval" sub="expand + re-rank" highlight delay={0.45} />

      {/* Stage 4: Generate */}
      <Box x={760} y={140} w={120} h={60} title="Mistral 7B" sub="cited answer" delay={0.6} />

      {/* RAGAS evaluation strip */}
      <Box x={420} y={300} w={310} h={36} title="RAGAS+ · 0.82 source accuracy · 0.76 faithfulness" delay={0.75} />

      {/* Arrows */}
      <Arrow x1={180} y1={170} x2={240} y2={100} delay={0.1} />
      <Arrow x1={180} y1={170} x2={240} y2={240} delay={0.1} />
      <Arrow x1={390} y1={100} x2={420} y2={100} delay={0.25} />
      <Arrow x1={390} y1={240} x2={420} y2={240} delay={0.25} />
      <Arrow x1={550} y1={100} x2={600} y2={155} delay={0.4} />
      <Arrow x1={550} y1={240} x2={600} y2={185} delay={0.4} />
      <Arrow x1={730} y1={170} x2={760} y2={170} delay={0.55} />
      {/* Feedback */}
      <Arrow x1={820} y1={200} x2={730} y2={300} dashed delay={0.9} />

      {/* Data packets hopping the pipeline gaps - top and bottom streams */}
      <FlowDot path="M 180 170 L 240 100" dur={2.2} delay={0} />
      <FlowDot path="M 390 100 L 420 100" dur={2.2} delay={0.7} />
      <FlowDot path="M 550 100 L 600 155" dur={2.2} delay={1.4} />
      <FlowDot path="M 180 170 L 240 240" dur={2.2} delay={0.35} />
      <FlowDot path="M 390 240 L 420 240" dur={2.2} delay={1.05} />
      <FlowDot path="M 550 240 L 600 185" dur={2.2} delay={1.75} />
      <FlowDot path="M 730 170 L 760 170" dur={2.2} delay={2.1} />
    </svg>
  );
}
