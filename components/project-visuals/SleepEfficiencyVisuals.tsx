// Sleep Efficiency Predictor - factor-correlation hero + study-to-app architecture.
// All figures are from the ICSMAI 2024 paper (Springer, DOI 10.1007/978-3-031-66854-8_1).
// Animation contract: pv-* classes fire when VisualFrame sets data-inview.

interface Props {
  accent: string;
  className?: string;
}

const MONO = "ui-monospace, 'JetBrains Mono', monospace";

export function SleepEfficiencyHero({ accent, className }: Props) {
  // Pearson correlation of each factor with sleep efficiency - measured
  // values from the published study, not illustrative numbers.
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const features = [
    { name: "Deep sleep %", r: 0.787 },
    { name: "Exercise frequency", r: 0.258 },
    { name: "Age", r: 0.098 },
    { name: "Caffeine", r: 0.063 },
    { name: "Smoking", r: -0.29 },
    { name: "Alcohol", r: -0.384 },
    { name: "Awakenings", r: -0.554 },
    { name: "Light sleep %", r: -0.819 },
  ];

  // Center axis at x=430. Scale: 0.85 correlation = 250px.
  const center = 430;
  const scale = 250 / 0.85;
  const rowHeight = 36;
  const startY = 96;

  return (
    <svg
      viewBox="0 0 800 500"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="Correlation of lifestyle factors with sleep efficiency from the published study"
      style={{ width: "100%", height: "100%" }}
    >
      <text x="40" y="48" fontFamily={MONO} fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        ICSMAI 2024 · CORRELATION WITH SLEEP EFFICIENCY
      </text>
      <text x="40" y="68" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="14" fontWeight="600" fill={text}>
        Measured drivers across 452 study records
      </text>

      {/* Vertical center axis */}
      <line x1={center} y1={84} x2={center} y2={392} stroke={border} strokeWidth="1.5" />

      <text x={center - 80} y={82} fontFamily={MONO} fontSize="9" fill={muted} textAnchor="middle">
        ← hurts efficiency
      </text>
      <text x={center + 80} y={82} fontFamily={MONO} fontSize="9" fill={muted} textAnchor="middle">
        helps efficiency →
      </text>

      {features.map((f, i) => {
        const y = startY + i * rowHeight;
        const w = Math.abs(f.r) * scale;
        const x = f.r >= 0 ? center : center - w;
        const isPositive = f.r >= 0;
        return (
          <g key={f.name} className="pv-hover-group">
            <text x={40} y={y + 16} fontFamily={MONO} fontSize="11" fill={text} textAnchor="start">
              {f.name}
            </text>
            <rect
              x={x} y={y + 5} width={w} height="18" rx="2" ry="2"
              className={isPositive ? "pv-grow-r" : "pv-grow-l"}
              fill={isPositive ? accent : surface}
              fillOpacity={isPositive ? 0.85 : 1}
              stroke={isPositive ? accent : border}
              strokeWidth="1"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            />
            <text
              x={isPositive ? x + w + 8 : x - 8}
              y={y + 19}
              textAnchor={isPositive ? "start" : "end"}
              fontFamily={MONO}
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

      <text x="40" y="450" fontFamily={MONO} fontSize="9" fill={muted} opacity="0.7">
        Pearson correlation with sleep efficiency · caffeine showed no significant effect
      </text>
      <text x="40" y="470" fontFamily={MONO} fontSize="9" fill={muted} opacity="0.5">
        Random Forest on these features: R² 0.8569 · MSE 0.0027 · Springer Nature, pp. 3-15
      </text>
    </svg>
  );
}

export function SleepEfficiencyArchitecture({ accent, className }: Props) {
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

  const Arrow = ({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay?: number }) => (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      pathLength={1}
      className="pv-draw"
      stroke={accent} strokeWidth="1.25" opacity="0.7"
      markerEnd="url(#sleep-arrow)"
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
      aria-label="Sleep efficiency study-to-app pipeline architecture"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="sleep-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      <text x="30" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">DATA</text>
      <text x="220" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">PREP</text>
      <text x="400" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">BENCHMARK</text>
      <text x="610" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">SELECT</text>
      <text x="790" y="26" fontFamily={MONO} fontSize="9" fill={muted} letterSpacing="1.5">SERVE</text>

      <Box x={20} y={120} w={150} h={60} title="Sleep dataset" sub="452 records · 15 features" delay={0} />
      <Box x={210} y={120} w={140} h={60} title="KNN Imputation" sub="n=2 · 80/20 split" delay={0.15} />
      <Box x={390} y={120} w={160} h={60} title="4-Model Comparison" sub="LR · DT · RF · GBR" delay={0.3} />
      <Box x={590} y={120} w={150} h={60} title="Random Forest" sub="R² 0.8569 · MSE 0.0027" highlight delay={0.45} />
      <Box x={780} y={120} w={110} h={60} title="Flask App" sub="score + tips" delay={0.6} />

      {/* Arrows */}
      <Arrow x1={170} y1={150} x2={210} y2={150} delay={0.1} />
      <Arrow x1={350} y1={150} x2={390} y2={150} delay={0.25} />
      <Arrow x1={550} y1={150} x2={590} y2={150} delay={0.4} />
      <Arrow x1={740} y1={150} x2={780} y2={150} delay={0.55} />

      {/* Data packets hopping the gaps */}
      <FlowDot path="M 170 150 L 210 150" dur={2.4} delay={0} />
      <FlowDot path="M 350 150 L 390 150" dur={2.4} delay={0.8} />
      <FlowDot path="M 550 150 L 590 150" dur={2.4} delay={1.6} />
      <FlowDot path="M 740 150 L 780 150" dur={2.4} delay={2.4} />

      <text x="20" y="270" fontFamily={MONO} fontSize="9" fill={muted}>
        Published at ICSMAI 2024 (Springer Nature) · model + scaler persisted with joblib · High / Normal / Low bands with tailored recommendations
      </text>
    </svg>
  );
}
