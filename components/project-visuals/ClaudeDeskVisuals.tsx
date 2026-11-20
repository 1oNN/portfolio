import Image from "next/image";
import { PvBox, PvArrow, PvFlowDot } from "./primitives";

// Claude Desk - the two screenshots are the public repo's own (docs/img on
// 1oNN/claude_desk), shot on a bench copy with stand-in sessions and accounts.
// The app has one dark theme, so there is no light/dark pair to keep in step.
// The terminal in the overview shows an older test run (41); the copy carries
// the current count, so reshoot from the repo when the gap starts to matter.

interface Props {
  accent: string;
  className?: string;
}

const OVERVIEW_ALT =
  "Claude Desk with three projects in the sidebar, each session row marked working, needs you, finished or idle beside the last thing it was asked, and three terminal panes open on one project";

const USAGE_ALT =
  "Claude Desk's Usage page: three accounts, each with its five-hour and weekly limit as a bar and a reset time, and the live sessions on that account with their model and context use";

function Shot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 960px, 100vw" className="object-cover object-left-top" />
    </div>
  );
}

export function ClaudeDeskHero({ className }: Props) {
  return <Shot src="/projects/claude-desk/claude-desk-overview.png" alt={OVERVIEW_ALT} className={className} />;
}

export function ClaudeDeskUsage({ className }: Props) {
  return <Shot src="/projects/claude-desk/claude-desk-usage.png" alt={USAGE_ALT} className={className} />;
}

export function ClaudeDeskArchitecture({ accent, className }: Props) {
  const muted = "var(--text-muted)";
  const mono = "ui-monospace, 'JetBrains Mono', monospace";

  return (
    <svg
      viewBox="0 0 900 340"
      className={className}
      role="img"
      aria-label="Claude Desk architecture: an Electron main process starts one Claude Code process per session through node-pty, then reads state back from the files Claude Code writes itself"
    >
      <defs>
        <marker id="desk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={accent} />
        </marker>
      </defs>

      {/* Row A: what Desk starts */}
      <PvBox accent={accent} x={20} y={30} w={140} h={52} title="Renderer" sub="xterm.js panes" delay={0} />
      <PvBox accent={accent} x={200} y={30} w={120} h={52} title="Preload" sub="contextBridge" delay={0.1} />
      <PvBox accent={accent} x={360} y={30} w={160} h={52} title="Main process" sub="Electron" highlight delay={0.2} />
      <PvBox accent={accent} x={560} y={30} w={120} h={52} title="node-pty" sub="one per session" delay={0.3} />
      <PvBox accent={accent} x={720} y={30} w={160} h={52} title="claude.exe" sub="own config folder" delay={0.4} />

      <PvArrow accent={accent} markerId="desk-arrow" x1={160} y1={56} x2={200} y2={56} delay={0.15} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={320} y1={56} x2={360} y2={56} delay={0.25} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={520} y1={56} x2={560} y2={56} delay={0.35} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={680} y1={56} x2={720} y2={56} delay={0.45} />

      {/* Rows B and C: what Claude Code writes, and what Desk reads back */}
      <PvBox accent={accent} x={720} y={140} w={120} h={52} title="Session registry" sub="sessions/<pid>.json" delay={0.55} />
      <PvBox accent={accent} x={720} y={250} w={160} h={52} title="Status line script" sub="limits, cost, context" delay={0.65} />
      <PvBox accent={accent} x={440} y={140} w={150} h={52} title="Registry poll" sub="every 2s, all accounts" delay={0.75} />
      <PvBox accent={accent} x={250} y={250} w={150} h={52} title="Usage reader" sub="newest per account" delay={0.85} />

      <PvArrow accent={accent} markerId="desk-arrow" x1={780} y1={82} x2={780} y2={140} delay={0.6} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={860} y1={82} x2={860} y2={250} delay={0.7} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={720} y1={166} x2={590} y2={166} delay={0.8} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={720} y1={276} x2={400} y2={276} delay={0.9} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={500} y1={140} x2={500} y2={82} dashed delay={1} />
      <PvArrow accent={accent} markerId="desk-arrow" x1={380} y1={250} x2={380} y2={82} dashed delay={1.05} />

      <PvFlowDot accent={accent} path="M 520 56 L 720 56" dur={2.6} delay={0} />
      <PvFlowDot accent={accent} path="M 780 82 L 780 140" dur={2.6} delay={0.7} />
      <PvFlowDot accent={accent} path="M 720 166 L 590 166" dur={2.6} delay={1.3} />
      <PvFlowDot accent={accent} path="M 720 276 L 400 276" dur={2.6} delay={1.9} />

      <text x="20" y="150" fontFamily={mono} fontSize="9" fill={muted} className="pv-fade" style={{ animationDelay: "1.1s" }}>
        Solid: Desk starts it, or
      </text>
      <text x="20" y="164" fontFamily={mono} fontSize="9" fill={muted} className="pv-fade" style={{ animationDelay: "1.1s" }}>
        Claude Code writes it.
      </text>
      <text x="20" y="184" fontFamily={mono} fontSize="9" fill={muted} className="pv-fade" style={{ animationDelay: "1.1s" }}>
        Dashed: Desk reads it back.
      </text>

      <text x="20" y="328" fontFamily={mono} fontSize="9" fill={muted}>
        State comes from files Claude Code already writes. Desk makes no model call to get it.
      </text>
    </svg>
  );
}
