"use client";

import { useEffect, useState } from "react";
import { PROJECTS } from "@/lib/constants";

/** Total run time before the fade starts. Kept short: this sits in front of the
 *  content, and an opaque overlay can become the LCP element. */
const DURATION_MS = 1200;
const FADE_MS = 350;
const TICK_MS = Math.round(DURATION_MS / PROJECTS.length);

/**
 * Entrance intro: the `ha.` monogram over a filling bar, with project names
 * ticking underneath, once per session.
 *
 * Visibility is driven ENTIRELY by the `html[data-intro]` attribute that the
 * pre-hydration script in app/layout.tsx sets, never by React state. That is
 * the whole point: deciding it in state would paint the page first and then
 * drop an overlay on top of it, which reads as a bug rather than an intro.
 *
 * For the same reason the markup is always rendered and never conditionally
 * returned - the server and the client must agree regardless of whether this
 * visitor is seeing the intro, so CSS does the hiding (globals.css). It is a
 * handful of permanently-hidden nodes; a hydration mismatch would be worse.
 *
 * This component only advances the ticker and then clears the attribute.
 */
export default function IntroOverlay() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // The script already decided whether to play, including the reduced-motion
    // and repeat-visit checks. If the attribute is absent there is nothing to do.
    if (document.documentElement.dataset.intro !== "play") return;

    const ticker = setInterval(() => {
      setIndex((prev) => Math.min(prev + 1, PROJECTS.length - 1));
    }, TICK_MS);

    const finish = setTimeout(() => {
      clearInterval(ticker);
      // Swapping the attribute rather than removing it lets CSS run the fade.
      document.documentElement.dataset.intro = "done";
    }, DURATION_MS);

    const cleared = setTimeout(() => {
      delete document.documentElement.dataset.intro;
    }, DURATION_MS + FADE_MS);

    return () => {
      clearInterval(ticker);
      clearTimeout(finish);
      clearTimeout(cleared);
      // Never leave the page scroll-locked if this unmounts mid-animation.
      delete document.documentElement.dataset.intro;
    };
  }, []);

  return (
    <div className="intro-overlay" aria-hidden="true">
      <div className="intro-inner">
        <span className="intro-monogram">
          ha<span className="intro-dot">.</span>
        </span>

        <div className="intro-track">
          <div className="intro-fill" />
        </div>

        <p className="intro-ticker">
          <span className="intro-label">loading</span>
          <span className="intro-name">{PROJECTS[index]?.title ?? ""}</span>
        </p>
      </div>
    </div>
  );
}
