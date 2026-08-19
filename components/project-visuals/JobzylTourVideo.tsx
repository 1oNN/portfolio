"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * The product tour, layered over the server-rendered still in JobzylHero.
 *
 * Client-only and deliberately late: the still underneath is correct on first
 * paint and carries the alt text, so this returns null until it knows which
 * theme's recording to fetch. Rendering both and hiding one with `dark:hidden`
 * would have downloaded ~2MB to show ~1MB of it.
 *
 * Two ways this stays a still: no JavaScript, and prefers-reduced-motion. An
 * autoplaying loop is exactly what that setting is for, and the global
 * duration-zeroing rule in globals.css cannot reach a <video>.
 */
export default function JobzylTourVideo() {
  const { resolvedTheme } = useTheme();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(true);
  }, []);

  if (!allowed || !resolvedTheme) return null;

  const theme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <video
      // Remount on theme change so the browser picks the new <source> set;
      // swapping src on a live element leaves the old decoded frames up.
      key={theme}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={`/projects/jobzyl/jobzyl-tour-${theme}.png`}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover object-top"
    >
      <source src={`/projects/jobzyl/jobzyl-tour-${theme}.webm`} type="video/webm" />
      <source src={`/projects/jobzyl/jobzyl-tour-${theme}.mp4`} type="video/mp4" />
    </video>
  );
}
