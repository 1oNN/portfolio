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
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    if (!text) {
      setDone(true);
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
