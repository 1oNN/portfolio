"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkle: boolean;
  twinkleOffset: number;
  twinkleSpeed: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let rafId: number;
    let frame = 0;

    function makeStars(w: number, h: number): Star[] {
      return Array.from({ length: 130 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.4 + 0.4,
        baseOpacity: Math.random() * 0.55 + 0.15,
        twinkle: Math.random() < 0.22,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.018 + 0.006,
      }));
    }

    let stars = makeStars(width, height);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      stars = makeStars(width, height);
    };
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      for (const s of stars) {
        const opacity = s.twinkle
          ? s.baseOpacity * (0.45 + 0.55 * Math.sin(frame * s.twinkleSpeed + s.twinkleOffset))
          : s.baseOpacity;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="opacity-0 dark:opacity-75 transition-opacity duration-500"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
