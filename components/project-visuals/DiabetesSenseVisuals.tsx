// TODO: replace with real screenshot when available
// DiabetesSense — SHAP feature attribution chart hero + ensemble pipeline architecture.

interface Props {
  accent: string;
  className?: string;
}

export function DiabetesSenseHero({ accent, className }: Props) {
  // SHAP feature attribution for a synthetic patient. Bars right of zero increase risk;
  // bars left decrease it. Values are illustrative — labelled as such in the caption.
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const features = [
    { name: "Glucose", shap: 0.34 },
    { name: "BMI", shap: 0.21 },
    { name: "Age", shap: 0.14 },
    { name: "Pregnancies", shap: 0.08 },
    { name: "Insulin", shap: -0.04 },
    { name: "BloodPressure", shap: -0.09 },
    { name: "Pedigree", shap: -0.12 },
    { name: "SkinThickness", shap: -0.18 },
  ];

  // Center axis at x=400. Scale: 0.4 SHAP = 280px.
  const center = 400;
  const scale = 280 / 0.4;
  const rowHeight = 36;
  const startY = 100;

  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      role="img"
      aria-label="SHAP feature attribution chart for diabetes risk prediction"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Header */}
      <text x="40" y="48" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        SHAP · FEATURE ATTRIBUTION
      </text>
      <text x="40" y="68" fontFamily="ui-sans-serif, Inter, system-ui" fontSize="14" fontWeight="600" fill={text}>
        Per-prediction explanation · synthetic case
      </text>

      {/* Vertical center axis */}
      <line x1={center} y1={88} x2={center} y2={400} stroke={border} strokeWidth="1.5" />

      {/* Axis labels */}
      <text x={center - 80} y={86} fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} textAnchor="middle">
        ← lowers risk
      </text>
      <text x={center + 80} y={86} fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} textAnchor="middle">
        increases risk →
      </text>

      {/* Bars */}
      {features.map((f, i) => {
        const y = startY + i * rowHeight;
        const w = Math.abs(f.shap) * scale;
        const x = f.shap >= 0 ? center : center - w;
        const isPositive = f.shap >= 0;
        return (
          <g key={f.name}>
            {/* feature label */}
            <text
              x={center - 290}
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
              y={y + 6}
              width={w}
              height="20"
              rx="2"
              ry="2"
              fill={isPositive ? accent : surface}
              fillOpacity={isPositive ? 0.85 : 1}
              stroke={isPositive ? accent : border}
              strokeWidth="1"
            />
            {/* value label */}
            <text
              x={isPositive ? x + w + 8 : x - 8}
              y={y + 21}
              textAnchor={isPositive ? "start" : "end"}
              fontFamily="ui-monospace, 'JetBrains Mono', monospace"
              fontSize="10"
              fontWeight="600"
              fill={isPositive ? accent : muted}
            >
              {f.shap >= 0 ? `+${f.shap.toFixed(2)}` : f.shap.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Footer caption */}
      <text x="40" y="450" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} opacity="0.7">
        TreeExplainer · exact Shapley values · sub-second per prediction
      </text>
      <text x="40" y="470" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} opacity="0.5">
        — values illustrative; production explainer uses live patient features
      </text>
    </svg>
  );
}

export function DiabetesSenseArchitecture({ accent, className }: Props) {
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
        fill={highlight ? `${accent}20` : surface}
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
      viewBox="0 0 900 360"
      className={className}
      role="img"
      aria-label="DiabetesSense ensemble + SHAP architecture"
      style={{ width: "100%", height: "auto" }}
    >
      <defs>
        <marker id="dsense-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill={accent} opacity="0.7" />
        </marker>
      </defs>

      <text x="40" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">DATA</text>
      <text x="220" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">PARALLEL MODELS</text>
      <text x="500" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">ENSEMBLE + EXPLAINER</text>
      <text x="760" y="24" fontFamily="ui-monospace, 'JetBrains Mono', monospace" fontSize="9" fill={muted} letterSpacing="1.5">SERVE</text>

      <Box x={20} y={150} w={150} h={60} title="Clinical Features" sub="stratified k-fold split" />

      <Box x={210} y={70} w={140} h={50} title="Random Forest" sub="variance reducer" />
      <Box x={210} y={230} w={140} h={50} title="Gradient Boosting" sub="boundary refinement" />

      <Box x={400} y={150} w={130} h={60} title="Soft Vote" sub="ensemble" />
      <Box x={570} y={150} w={150} h={60} title="SHAP TreeExplainer" sub="exact Shapley values" highlight />

      <Box x={760} y={70} w={120} h={50} title="Flask API" sub="REST endpoint" />
      <Box x={760} y={230} w={120} h={50} title="React.js UI" sub="risk + chart" />

      {/* Arrows */}
      <line x1={170} y1={170} x2={210} y2={95} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#dsense-arrow)" />
      <line x1={170} y1={195} x2={210} y2={255} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#dsense-arrow)" />
      <line x1={350} y1={95} x2={400} y2={170} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#dsense-arrow)" />
      <line x1={350} y1={255} x2={400} y2={195} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#dsense-arrow)" />
      <line x1={530} y1={180} x2={570} y2={180} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#dsense-arrow)" />
      <line x1={720} y1={170} x2={760} y2={95} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#dsense-arrow)" />
      <line x1={720} y1={195} x2={760} y2={255} stroke={accent} strokeWidth="1.25" opacity="0.7" markerEnd="url(#dsense-arrow)" />
    </svg>
  );
}
