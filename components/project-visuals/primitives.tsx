// Shared SVG primitives for the architecture diagrams.
//
// Each *Architecture component used to declare its own Box/Arrow/FlowDot inside
// its render body. They were byte-identical apart from the arrow marker id, and
// declaring them during render trips react-hooks/static-components: React sees a
// new component type every render and remounts the subtree instead of diffing it.
// Hoisted here once, so the accent is threaded through as a prop.

const MONO = "ui-monospace, 'JetBrains Mono', monospace";

const MUTED = "var(--text-muted)";
const TEXT = "var(--text-secondary)";
const SURFACE = "var(--surface-elevated)";
const BORDER = "var(--border)";

export interface PvBoxProps {
  accent: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  highlight?: boolean;
  delay?: number;
}

export function PvBox({ accent, x, y, w, h, title, sub, highlight, delay }: PvBoxProps) {
  return (
    <g className="pv-pop pv-hover-group" style={{ animationDelay: `${delay ?? 0}s` }}>
      <rect
        x={x} y={y} width={w} height={h} rx="6" ry="6"
        className="pv-node"
        fill={highlight ? `color-mix(in srgb, ${accent} 13%, transparent)` : SURFACE}
        stroke={highlight ? accent : BORDER}
        strokeWidth="1.25"
      />
      <text
        x={x + w / 2}
        y={y + (sub ? h / 2 - 4 : h / 2 + 4)}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="11"
        fontWeight="600"
        fill={highlight ? accent : TEXT}
      >
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={MUTED}>
          {sub}
        </text>
      )}
    </g>
  );
}

export interface PvArrowProps {
  accent: string;
  /** id of the <marker> defined in the parent svg's <defs>. */
  markerId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Dashed arrows fade in; solid ones draw along their length. */
  dashed?: boolean;
  delay?: number;
}

export function PvArrow({ accent, markerId, x1, y1, x2, y2, dashed, delay }: PvArrowProps) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      pathLength={dashed ? undefined : 1}
      className={dashed ? "pv-fade" : "pv-draw"}
      stroke={accent} strokeWidth="1.25" opacity="0.7"
      strokeDasharray={dashed ? "3 3" : undefined}
      markerEnd={`url(#${markerId})`}
      style={{ animationDelay: `${delay ?? 0}s` }}
    />
  );
}

export interface PvFlowDotProps {
  accent: string;
  path: string;
  dur: number;
  delay: number;
}

export function PvFlowDot({ accent, path, dur, delay }: PvFlowDotProps) {
  return (
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
}
