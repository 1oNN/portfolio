"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  speed?: number; // ms per character
  startDelay?: number;
  onComplete?: () => void;
}

interface UseTypewriterReturn {
  displayed: string;
  done: boolean;
  reset: () => void;
}

export function useTypewriter(
  text: string,
  { speed = 18, startDelay = 0, onComplete }: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Rewinds the animation whenever the source text changes. The timer this
    // effect drives IS the external system; clearing the buffer is step one of
    // restarting it, not derived state that could be computed during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    if (!text) {
      setDone(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayed(text);
      setDone(true);
      onCompleteRef.current?.();
      return;
    }

    let rafId: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (indexRef.current >= text.length) {
        setDone(true);
        onCompleteRef.current?.();
        return;
      }
      setDisplayed(text.slice(0, indexRef.current + 1));
      indexRef.current++;
      rafId = setTimeout(tick, speed);
    };

    const startTimer = setTimeout(tick, startDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(rafId);
    };
  }, [text, speed, startDelay]);

  const reset = () => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;
  };

  return { displayed, done, reset };
}
