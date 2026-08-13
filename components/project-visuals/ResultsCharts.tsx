// Results charts - the document-verified numbers each case study reports,
// drawn instead of buried in prose. All values are sourced from the MSc
// thesis, BSc thesis, and Outlyst experience records. Same animation
// contract as the other visuals: pv-* classes fire inside VisualFrame.

interface Props {
  accent: string;
  className?: string;
}

const MONO = "ui-monospace, 'JetBrains Mono', monospace";

/* ─── FinLaw-UK: evaluation scores + benchmark composition donut ────── */

const FINLAW_SCORES = [
  { label: "Source accuracy", value: 0.823 },
  { label: "Citation quality", value: 0.806 },
  { label: "RAGAS faithfulness", value: 0.76 },
  { label: "Answer relevance", value: 0.74 },
  { label: "Legal completeness", value: 0.69 },
];

const FINLAW_TASKS = [
  { label: "80 short-form", pct: 73 },
  { label: "20 document", pct: 18 },
  { label: "10 scenario", pct: 9 },
];

export function FinLawResults({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const border = "var(--border)";

  const barX = 200;
  const barScale = 290; // 1.0 score = 290px
  const rowH = 42;
  const startY = 84;

  // Donut geometry: stroke-dasharray segments on a circle, starting at 12
  // o'clock. Slices step down in lightness of the single project accent.
  const cx = 668;
  const cy = 168;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const sliceColors = [
    accent,
    `color-mix(in srgb, ${accent} 55%, var(--surface))`,
    `color-mix(in srgb, ${accent} 26%, var(--surface))`,
  ];
  let acc = 0;

  return (
    <svg
      viewBox="0 0 900 340"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="FinLaw-UK evaluation scores and benchmark composition"
      style={{ width: "100%", height: "auto" }}
    >
      <text x="40" y="34" fontFamily={MONO} fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        EVALUATION SCORES · RAGAS + LEGAL METRICS
      </text>

      {/* Gridlines 0 → 1.0 */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line
            x1={barX + t * barScale} y1={68} x2={barX + t * barScale} y2={300}
            stroke={border} strokeWidth="1" strokeDasharray="2 4" opacity="0.5"
          />
          <text x={barX + t * barScale} y={318} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={muted}>
            {t.toFixed(2)}
          </text>
        </g>
      ))}

      {FINLAW_SCORES.map((s, i) => {
        const y = startY + i * rowH;
        return (
          <g key={s.label} className="pv-hover-group">
            <text x={40} y={y + 15} fontFamily={MONO} fontSize="11" fill={text}>
              {s.label}
            </text>
            <rect
              x={barX} y={y + 2} width={s.value * barScale} height="18" rx="2"
              className="pv-grow-r"
              fill={accent} fillOpacity="0.85"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            />
            <text
              x={barX + s.value * barScale + 8} y={y + 16}
              fontFamily={MONO} fontSize="10.5" fontWeight="600" fill={accent}
              className="pv-fade"
              style={{ animationDelay: `${0.35 + i * 0.08}s` }}
            >
              {s.value.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Benchmark composition donut */}
      <text x="580" y="34" fontFamily={MONO} fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        BENCHMARK COMPOSITION
      </text>

      {FINLAW_TASKS.map((tsk, i) => {
        const start = (acc / 100) * 360 - 90;
        acc += tsk.pct;
        const dash = (tsk.pct / 100) * circ;
        return (
          <circle
            key={tsk.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={sliceColors[i]}
            strokeWidth="26"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform={`rotate(${start} ${cx} ${cy})`}
            className="pv-fade"
            style={{ animationDelay: `${0.3 + i * 0.15}s` }}
          />
        );
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--font-display), ui-sans-serif" fontSize="26" fontWeight="700" fill="var(--text-primary)">
        110
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={muted}>
        eval items
      </text>

      {/* Donut legend */}
      {FINLAW_TASKS.map((tsk, i) => (
        <g key={tsk.label} className="pv-fade" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
          <rect x={746} y={128 + i * 28} width="10" height="10" rx="2" fill={sliceColors[i]} />
          <text x={762} y={137 + i * 28} fontFamily={MONO} fontSize="10.5" fill={text}>
            {tsk.label} · {tsk.pct}%
          </text>
        </g>
      ))}
      <text x="580" y="318" fontFamily={MONO} fontSize="9" fill={muted} opacity="0.7">
        7 regulatory domains · source acc peaks 0.85
      </text>
    </svg>
  );
}

/* ─── DiabetesSense: full 11-model benchmark ────────────────────────── */

const DS_MODELS = [
  { label: "Random Forest", acc: 93.15, winner: true },
  { label: "Decision Tree", acc: 91.22 },
  { label: "KNN", acc: 82.54 },
  { label: "CatBoost", acc: 77.27 },
  { label: "XGBoost", acc: 76.76 },
  { label: "LightGBM", acc: 75.87 },
  { label: "Neural Network", acc: 75.51 },
  { label: "Gradient Boosting", acc: 75.31 },
  { label: "AdaBoost", acc: 74.96 },
  { label: "Logistic Regression", acc: 74.54 },
  { label: "Naive Bayes", acc: 71.69 },
];

export function DiabetesSenseResults({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const barX = 210;
  const barScale = 6.0; // 100% = 600px
  const rowH = 30;
  const startY = 74;

  return (
    <svg
      viewBox="0 0 900 440"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="Accuracy of all 11 benchmarked models; Random Forest leads at 93.15 percent"
      style={{ width: "100%", height: "auto" }}
    >
      <text x="40" y="34" fontFamily={MONO} fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        11-MODEL BENCHMARK · ACCURACY ON HELD-OUT 20%
      </text>

      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}>
          <line
            x1={barX + t * barScale} y1={58} x2={barX + t * barScale} y2={startY + DS_MODELS.length * rowH + 4}
            stroke={border} strokeWidth="1" strokeDasharray="2 4" opacity="0.5"
          />
          <text x={barX + t * barScale} y={startY + DS_MODELS.length * rowH + 22} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={muted}>
            {t}%
          </text>
        </g>
      ))}

      {DS_MODELS.map((m, i) => {
        const y = startY + i * rowH;
        return (
          <g key={m.label} className="pv-hover-group">
            <text x={40} y={y + 14} fontFamily={MONO} fontSize="11" fill={m.winner ? "var(--text-primary)" : text} fontWeight={m.winner ? 700 : 400}>
              {m.label}
            </text>
            <rect
              x={barX} y={y + 2} width={m.acc * barScale} height="16" rx="2"
              className="pv-grow-r"
              fill={m.winner ? accent : surface}
              fillOpacity={m.winner ? 0.9 : 1}
              stroke={m.winner ? accent : border}
              strokeWidth="1"
              style={{ animationDelay: `${0.08 + i * 0.06}s` }}
            />
            <text
              x={barX + m.acc * barScale + 8} y={y + 15}
              fontFamily={MONO} fontSize="10" fontWeight={m.winner ? 700 : 500}
              fill={m.winner ? accent : muted}
              className="pv-fade"
              style={{ animationDelay: `${0.3 + i * 0.06}s` }}
            >
              {m.acc.toFixed(2)}%
            </text>
          </g>
        );
      })}

      <text x="40" y="432" fontFamily={MONO} fontSize="9" fill={muted} opacity="0.7">
        Random Forest leads every model in the benchmark · BRFSS 2015, random over-sampled
      </text>
    </svg>
  );
}

/* ─── Sleep Efficiency: four-model R² comparison (published Table 2) ── */

const SLEEP_MODELS = [
  { label: "Random Forest", r2: 0.8569, winner: true },
  { label: "Gradient Boosting", r2: 0.8558 },
  { label: "Linear Regression", r2: 0.7981 },
  { label: "Decision Tree", r2: 0.6912 },
];

export function SleepEfficiencyResults({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const barX = 220;
  const barScale = 620; // R² 1.0 = 620px
  const rowH = 44;
  const startY = 76;

  return (
    <svg
      viewBox="0 0 900 300"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="R-squared of the four models compared; Random Forest leads at 0.8569"
      style={{ width: "100%", height: "auto" }}
    >
      <text x="40" y="34" fontFamily={MONO} fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        MODEL COMPARISON · R² ON HELD-OUT 20% (TABLE 2 OF THE PAPER)
      </text>

      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line
            x1={barX + t * barScale} y1={60} x2={barX + t * barScale} y2={startY + SLEEP_MODELS.length * rowH + 4}
            stroke={border} strokeWidth="1" strokeDasharray="2 4" opacity="0.5"
          />
          <text x={barX + t * barScale} y={startY + SLEEP_MODELS.length * rowH + 22} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={muted}>
            {t.toFixed(2)}
          </text>
        </g>
      ))}

      {SLEEP_MODELS.map((m, i) => {
        const y = startY + i * rowH;
        return (
          <g key={m.label} className="pv-hover-group">
            <text x={40} y={y + 15} fontFamily={MONO} fontSize="11" fill={m.winner ? "var(--text-primary)" : text} fontWeight={m.winner ? 700 : 400}>
              {m.label}
            </text>
            <rect
              x={barX} y={y + 2} width={m.r2 * barScale} height="18" rx="2"
              className="pv-grow-r"
              fill={m.winner ? accent : surface}
              fillOpacity={m.winner ? 0.9 : 1}
              stroke={m.winner ? accent : border}
              strokeWidth="1"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            />
            <text
              x={barX + m.r2 * barScale + 8} y={y + 16}
              fontFamily={MONO} fontSize="10.5" fontWeight={m.winner ? 700 : 500}
              fill={m.winner ? accent : muted}
              className="pv-fade"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              {m.r2.toFixed(4)}
            </text>
          </g>
        );
      })}

      <text x="40" y="290" fontFamily={MONO} fontSize="9" fill={muted} opacity="0.7">
        452 records · 80/20 split · Random Forest MSE 0.0027 · ICSMAI 2024, Springer Nature
      </text>
    </svg>
  );
}

/* ─── Voice Agent: mean call latency, before and after profiling ─────────
   Replaces a stable-concurrency comparison (~200 -> 2,100+) and three
   business-impact chips (+25% conversions, 27 qualified leads, 100+ h/wk).
   The concurrency figure was call volume misread as simultaneous load, and
   the three commercial numbers are not independently verifiable. Latency is
   the claim this case study actually evidences. Milliseconds, so the bar
   lengths are honest: 2400 -> 1100 is the real ratio. */

export function VoiceAgentResults({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const text = "var(--text-secondary)";
  const surface = "var(--surface-elevated)";
  const border = "var(--border)";

  const barX = 210;
  const barScale = 560 / 2400;

  return (
    <svg
      viewBox="0 0 900 250"
      className={`pv-interactive ${className ?? ""}`}
      role="img"
      aria-label="Mean call latency fell from 2.4 seconds to 1.1 seconds, a 54 percent reduction"
      style={{ width: "100%", height: "auto" }}
    >
      <text x="40" y="34" fontFamily={MONO} fontSize="10" fontWeight="600" fill={muted} letterSpacing="2">
        MEAN CALL LATENCY
      </text>

      {[0, 600, 1200, 1800, 2400].map((t) => (
        <g key={t}>
          <line
            x1={barX + t * barScale} y1={58} x2={barX + t * barScale} y2={186}
            stroke={border} strokeWidth="1" strokeDasharray="2 4" opacity="0.5"
          />
          <text x={barX + t * barScale} y={202} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={muted}>
            {(t / 1000).toFixed(1)}s
          </text>
        </g>
      ))}

      <g className="pv-hover-group">
        <text x={40} y={87} fontFamily="ui-sans-serif, Inter, system-ui" fontSize="13" fontWeight="600" fill={text}>
          Before
        </text>
        {/* Each bar draws for as long as the call it represents: 2.4s here,
            1.1s below. The comparison is then something you feel rather than
            read - the "before" bar is still crawling when the "after" one has
            already finished. Delays are set so both start together. */}
        <rect x={barX} y={70} width={2400 * barScale} height="26" rx="3" className="pv-grow-r" fill={surface} stroke={border} strokeWidth="1" style={{ animationDelay: "0.2s", animationDuration: "2.4s", animationTimingFunction: "linear" }} />
        <text x={barX + 2400 * barScale + 8} y={88} fontFamily={MONO} fontSize="11" fontWeight="600" fill={muted} className="pv-fade" style={{ animationDelay: "2.6s" }}>
          2.4s
        </text>
      </g>

      <g className="pv-hover-group">
        <text x={40} y={147} fontFamily="ui-sans-serif, Inter, system-ui" fontSize="13" fontWeight="600" fill={accent}>
          After
        </text>
        <rect x={barX} y={130} width={1100 * barScale} height="26" rx="3" className="pv-grow-r" fill={accent} fillOpacity="0.85" style={{ animationDelay: "0.2s", animationDuration: "1.1s", animationTimingFunction: "linear" }} />
        <text x={barX + 1100 * barScale + 8} y={148} fontFamily={MONO} fontSize="11" fontWeight="700" fill={accent} className="pv-fade" style={{ animationDelay: "1.3s" }}>
          1.1s · −54%
        </text>
      </g>
    </svg>
  );
}
