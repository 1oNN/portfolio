"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

// The slide chunk (and with it every project visual) is not fetched until the
// first row is hovered, so nothing here touches the home page's critical path.
const ProjectPreviewSlides = dynamic(() => import("./ProjectPreviewSlides"), { ssr: false });

/** Distance from the cursor, and the minimum gap to any viewport edge. */
const CURSOR_GAP = 24;
const EDGE_PAD = 16;

interface Target {
  id: string;
  accent: string;
}

interface PreviewApi {
  enabled: boolean;
  show: (target: Target, x: number, y: number) => void;
  move: (x: number, y: number) => void;
  hide: () => void;
}

const PreviewContext = createContext<PreviewApi | null>(null);

function clamp(value: number, min: number, max: number) {
  // max can fall below min on very small viewports; min wins so the panel is
  // never pushed off the left edge trying to respect the right one.
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

/**
 * Hover preview for the home project rows: a small card that follows the
 * pointer and cycles through that project's own case-study visuals.
 *
 * The panel is `pointer-events: none`. That is the load-bearing detail - it
 * means the card can never intercept hover from the row underneath it, so
 * moving the pointer between adjacent rows cannot cause enter/leave thrash. It
 * is why the preview can sit over the content instead of needing a gutter the
 * narrow two-column layout does not have.
 */
export function ProjectPreviewProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);

  // Capability gate, not a width guess: a touch device can report a wide
  // viewport, and a hover preview it can never trigger is dead weight there.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    setEnabled(query.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Position is written straight to the DOM rather than held in state: a
  // pointermove at 60fps would otherwise re-render on every frame.
  const flush = useCallback(() => {
    frame.current = null;
    const node = panelRef.current;
    const point = pending.current;
    if (!node || !point) return;

    const { width, height } = node.getBoundingClientRect();
    let left = point.x + CURSOR_GAP;
    // Flip to the other side of the cursor rather than let the card slide under it.
    if (left + width > window.innerWidth - EDGE_PAD) left = point.x - CURSOR_GAP - width;
    left = clamp(left, EDGE_PAD, window.innerWidth - width - EDGE_PAD);
    const top = clamp(point.y - height / 2, EDGE_PAD, window.innerHeight - height - EDGE_PAD);

    node.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
  }, []);

  const move = useCallback(
    (x: number, y: number) => {
      pending.current = { x, y };
      if (frame.current === null) frame.current = requestAnimationFrame(flush);
    },
    [flush]
  );

  const show = useCallback(
    (next: Target, x: number, y: number) => {
      pending.current = { x, y };
      setTarget(next);
    },
    []
  );

  const hide = useCallback(() => setTarget(null), []);

  // Position the panel as soon as it exists, before the first pointermove.
  useEffect(() => {
    if (target) flush();
  }, [target, flush]);

  useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const api = useMemo<PreviewApi>(() => ({ enabled, show, move, hide }), [enabled, show, move, hide]);

  return (
    <PreviewContext.Provider value={api}>
      {children}
      {enabled &&
        target &&
        // Portalled to <body> rather than rendered in place. The projects
        // section is wrapped in `.animate-reveal`, which applies a transform -
        // and a transformed ancestor becomes the containing block for
        // `position: fixed`, so an inline panel would be positioned against the
        // section instead of the viewport and land off screen.
        createPortal(
          <div
            ref={panelRef}
            // Decorative: the row already exposes the title, tagline and
            // metrics, so there is nothing here for a screen reader to gain.
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-40 w-[340px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
          >
            <ProjectPreviewSlides projectId={target.id} accent={target.accent} />
          </div>,
          document.body
        )}
    </PreviewContext.Provider>
  );
}

interface TriggerProps {
  projectId: string;
  accent: string;
  children: ReactNode;
}

/**
 * Wraps one project row. Rendered as the `<li>` so HomeProjects can stay a
 * server component - only this shell and the panel are client code.
 */
export function ProjectPreviewTrigger({ projectId, accent, children }: TriggerProps) {
  const api = useContext(PreviewContext);

  if (!api?.enabled) return <li>{children}</li>;

  const { show, move, hide } = api;

  return (
    <li
      onPointerEnter={(e) => show({ id: projectId, accent }, e.clientX, e.clientY)}
      onPointerMove={(e) => move(e.clientX, e.clientY)}
      onPointerLeave={hide}
      // Keyboard parity: house rule is that every hover state has a focus twin.
      // There is no cursor to follow here, so anchor to the row itself.
      onFocus={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        show({ id: projectId, accent }, rect.right, rect.top + rect.height / 2);
      }}
      onBlur={hide}
    >
      {children}
    </li>
  );
}
