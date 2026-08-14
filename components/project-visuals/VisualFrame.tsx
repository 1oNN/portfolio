"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Client shell for project visuals: sets data-inview once when the visual
 * first enters the viewport so the CSS draw-in/pop keyframes run (.pv-*
 * classes in globals.css). Without JavaScript the attribute never appears
 * and the SVGs render fully visible - animation is pure enhancement.
 */
export default function VisualFrame({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Capability fallback: with no observer to subscribe to, reveal immediately
      // rather than leave the visual permanently un-animated.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-inview={inView ? "" : undefined} className={className} style={style}>
      {children}
    </div>
  );
}
