// DiabetesSense - risk-factor correlation chart hero + benchmark pipeline architecture.
// All figures are from the BSc thesis (BRFSS 2015, Table 3.1 and Figure 3.2).
// Animation contract: pv-* classes fire when VisualFrame sets data-inview.

interface Props {
  accent: string;
  className?: string;
}

export function DiabetesSenseHero({ accent, className }: Props) {
  // Pearson correlation of each factor with diabetes status - measured values
  // from the thesis correlation analysis, not illustrative numbers.
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const features = [
    { name: "High blood pressure", r: 0.38 },
    { name: "High cholesterol", r: 0.29 },
    { name: "BMI", r: 0.29 },
    { name: "Age group", r: 0.27 },
    { name: "Physical health", r: 0.21 },
    { name: "Physical activity", r: -0.09 },
    { name: "Education", r: -0.15 },
    { name: "Income", r: -0.19 },
    { name: "General health", r: -0.41 },
  ];

  // Center axis at x=430. Scale: 0.45 correlation = 250px.
  const center = 430;
  const scale = 250 / 0.45;
  const rowHeight = 33;
  const startY = 96;

  return (
    <svg
      viewBox="0 0 800 500"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="Correlation of risk factors with diabetes status in BRFSS 2015"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Header */}
      <text x="40" y="48" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        BRFSS 2015 · CORRELATION WITH DIABETES
      </text>
      <text x="40" y="68" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="14" fontWeight="600" fill={text}>
        Measured drivers across 253,680 CDC health records
      </text>

      {/* Vertical center axis */}
      <line x1={center} y1={84} x2={center} y2={400} stroke={border} strokeWidth="1.5" />

      {/* Axis labels */}
      <text x={center - 80} y={82} fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} textAnchor="middle">
        ← protective
      </text>
      <text x={center + 80} y={82} fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} textAnchor="middle">
        risk-raising →
      </text>

      {/* Bars - grow out from the axis on reveal; hover dims the other rows */}
      {features.map((f, i) => {
        const y = startY + i * rowHeight;
        const w = Math.abs(f.r) * scale;
        const x = f.r >= 0 ? center : center - w;
        const isPositive = f.r >= 0;
        return (
          <g key={f.name} className="pv-hover-group">
            {/* feature label */}
            <text
              x={40}
              y={y + 16}
              fontFamily="ui-monospace, 'JetBrains Mono', monospace"
              fontSize="11"
              fill={text}
              textAnchor="start"
            >
              {f.name}
            </text>
            {/* bar */}
            <rect
              x={x}
              y={y + 5}
              width={w}
              height="18"
              rx="2"
              ry="2"
              className={isPositive ? "pv-grow-r" : "pv-grow-l"}
              fill={isPositive ? accent : surface}
              fillOpacity={isPositive ? 0.85 : 1}
              stroke={isPositive ? accent : border}
              strokeWidth="1"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            />
            {/* value label */}
            <text
              x={isPositive ? x + w + 8 : x - 8}
              y={y + 19}
              textAnchor={isPositive ? "start" : "end"}
              fontFamily="ui-monospace, 'JetBrains Mono', monospace"
              fontSize="10"
              fontWeight="600"
              fill={isPositive ? accent : muted}
              className="pv-fade"
              style={{ animationDelay: `${0.35 + i * 0.07}s` }}
            >
              {f.r >= 0 ? `+${f.r.toFixed(2)}` : f.r.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Footer caption */}
      <text x="40" y="450" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} opacity="0.7">
        Pearson correlation with diabetes status · prevalence peaks at 63.2% in the 70-74 age band
      </text>
      <text x="40" y="470" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} opacity="0.5">
        Random Forest on these features: 93.15% accuracy, best of 11 models
      </text>
    </svg>
  );
}

export function DiabetesSenseArchitecture({ accent, className }: Props) {
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

  const Arrow = ({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay?: number }) => (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      pathLength={1}
      className="pv-draw"
      stroke={accent} strokeWidth="1.25" opacity="0.7"
      markerEnd="url(#dsense-arrow)"
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
      aria-label="DiabetesSense benchmark-to-deployment architecture"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="dsense-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      <text x="30" y="26" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">DATA</text>
      <text x="220" y="26" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">BALANCE</text>
      <text x="410" y="26" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">BENCHMARK</text>
      <text x="610" y="26" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">SELECT</text>
      <text x="785" y="26" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">SERVE</text>

      <Box x={20} y={120} w={150} h={60} title="BRFSS 2015" sub="253,680 · 22 features" delay={0} />
      <Box x={210} y={120} w={150} h={60} title="Random Over-Sampling" sub="86/14 → 50/50 balance" delay={0.15} />
      <Box x={400} y={120} w={160} h={60} title="11-Model Benchmark" sub="LR · KNN · trees · MLP" delay={0.3} />
      <Box x={600} y={120} w={140} h={60} title="Random Forest" sub="93.15% accuracy" highlight delay={0.45} />

      <Box x={770} y={48} w={120} h={50} title="Flask API" sub="joblib model" delay={0.6} />
      <Box x={770} y={202} w={120} h={50} title="React.js UI" sub="19-question screen" delay={0.6} />

      {/* Arrows */}
      <Arrow x1={170} y1={150} x2={210} y2={150} delay={0.1} />
      <Arrow x1={360} y1={150} x2={400} y2={150} delay={0.25} />
      <Arrow x1={560} y1={150} x2={600} y2={150} delay={0.4} />
      <Arrow x1={740} y1={140} x2={770} y2={73} delay={0.55} />
      <Arrow x1={740} y1={160} x2={770} y2={227} delay={0.55} />

      {/* Data packets hopping the pipeline gaps in sequence */}
      <FlowDot path="M 170 150 L 210 150" dur={2.4} delay={0} />
      <FlowDot path="M 360 150 L 400 150" dur={2.4} delay={0.8} />
      <FlowDot path="M 560 150 L 600 150" dur={2.4} delay={1.6} />
      <FlowDot path="M 740 140 L 770 73" dur={2.4} delay={2.4} />
      <FlowDot path="M 740 160 L 770 227" dur={2.4} delay={2.4} />
    </svg>
  );
}
