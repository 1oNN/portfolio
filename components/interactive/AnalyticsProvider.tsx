"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { classifyLink } from "@/lib/analytics-links";
import {
  endPage,
  externalReferrerHost,
  handleHidden,
  handlePageHide,
  handleVisible,
  measureScroll,
  refreshScrollHeight,
  startPage,
  trackClick,
} from "@/lib/analytics-client";

/**
 * The only analytics mount point on the site.
 *
 * Renders null, holds no state and has no children, so a soft navigation
 * re-renders exactly one function. Mounted as a SIBLING of AgentConsoleLauncher
 * in app/layout.tsx, never as a wrapper around {children}: wrapping would put a
 * router subscription above the whole tree and re-render every page on every
 * navigation.
 *
 * Imported directly rather than through next/dynamic. Since it renders null
 * there is no chunk worth deferring, and a dynamic import would only add a
 * request waterfall.
 */
export default function AnalyticsProvider() {
  const pathname = usePathname();
  const isFirstPage = useRef(true);

  // usePathname is what fixes the layout-level effect problem: App Router soft
  // navigation does not remount this component, so a plain mount effect would
  // fire once and never again, but the hook returns a new value on every route
  // change. It also does not trigger the client-side rendering bailout the way
  // useSearchParams does, so no segment goes dynamic and no Suspense boundary
  // is needed.
  useEffect(() => {
    // Only the first page of a session has a referrer worth recording. After
    // that it is always our own site.
    const referrer = isFirstPage.current ? externalReferrerHost() : undefined;
    isFirstPage.current = false;
    startPage(pathname, referrer);

    return () => endPage("route-change");
  }, [pathname]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleHidden();
      else handleVisible();
    };

    const onPageHide = (event: PageTransitionEvent) => handlePageHide(event.persisted);

    // A bfcache restore does not unmount this component, so usePathname does not
    // change and the effect above never re-runs. Without this handler every
    // back-button visit disappears silently, which is the single most likely way
    // for this file to be quietly wrong.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) startPage(window.location.pathname);
    };

    let rafPending = false;
    const onScroll = () => {
      // rAF-coalesced so a fling produces one measurement per frame rather than
      // one per event.
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        measureScroll();
      });
    };

    const onResize = () => refreshScrollHeight();

    const onActivate = (event: MouseEvent) => {
      // Middle-click never fires click, it fires auxclick. Without this branch
      // every "open in a background tab" is invisible.
      if (event.type === "auxclick" && event.button !== 1) return;

      const node = event.target;
      if (!(node instanceof Element)) return;

      // closest, not event.target: every RailNav anchor's only children are
      // spans, so the target of a section-nav click is never the anchor itself.
      const anchor = node.closest("a[href]");
      if (!anchor) return;

      // getAttribute rather than .href, because an SVG anchor exposes href as an
      // SVGAnimatedString rather than a string.
      const hit = classifyLink(
        anchor.getAttribute("href"),
        { origin: window.location.origin, pathname: window.location.pathname },
        anchor.hasAttribute("download")
      );
      if (!hit) return;

      // defaultPrevented is deliberately NOT checked. RailNav prevents default
      // on every in-page anchor so it can smooth-scroll, and skipping those
      // would erase all home-page section navigation from the data.
      const modified =
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.type === "auxclick";

      trackClick(
        hit.kind,
        hit.target,
        !modified && (hit.kind === "external" || hit.kind === "cv-download")
      );
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    // Passive, because a blocking scroll listener makes the compositor wait on
    // JS before painting the next frame. That is a measurable jank regression
    // and the most common way an analytics script ruins a site.
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    // Bubble phase, so this observes rather than interposes. There are no
    // stopPropagation calls anywhere in this repo, so every click reaches here.
    document.addEventListener("click", onActivate);
    document.addEventListener("auxclick", onActivate);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onActivate);
      document.removeEventListener("auxclick", onActivate);
    };
  }, []);

  return null;
}
