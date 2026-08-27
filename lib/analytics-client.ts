import {
  ANALYTICS_ENDPOINT,
  ANALYTICS_SCHEMA_VERSION,
  MAX_EVENTS_PER_BATCH,
  SCROLL_MILESTONES,
  type AgentOpenSource,
  type AnalyticsBatch,
  type AnalyticsEvent,
  type ExitReason,
  type LinkKind,
} from "./analytics-events";

/**
 * Browser-side capture: session identity, the event queue, transport, and the
 * page lifecycle state machine.
 *
 * Nothing here writes to cookies, localStorage, sessionStorage or IndexedDB.
 * That is a hard constraint, not a style preference: anything stored on the
 * device engages UK PECR Reg 6 and would require a consent banner, which this
 * design exists to avoid. The session id lives in a module variable and dies
 * with the tab.
 */

/** A full reader produces about nine events per page, so one mid-page flush. */
const FLUSH_AT = 8;
const FLUSH_DELAY_MS = 5_000;

/** A runaway listener must not grow memory without bound. */
const MAX_QUEUE = 50;

/** Back-off after a refusal, so a rate-limited client does not hot-loop. */
const SUPPRESS_MS = 5 * 60_000;

/** Below this the page is barely taller than the viewport, so milestones are noise. */
const SCROLLABLE_RATIO = 1.2;

// ─── Identity ─────────────────────────────────────────────────────

/**
 * randomUUID is undefined on a non-secure origin, which is the normal case when
 * testing from another device on the LAN over plain http.
 */
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

let sessionId: string | null = null;
let seqCounter = 0;

export function getSessionId(): string {
  if (!sessionId) sessionId = newId();
  return sessionId;
}

function nextSeq(): number {
  return seqCounter++;
}

// ─── Page timer ───────────────────────────────────────────────────

export type PageState = "active" | "hidden" | "ended";

export interface PageReport {
  ms: number;
  depth: number;
}

export interface PageTimer {
  begin(pageId: string, path: string, visible: boolean): void;
  pause(): void;
  resume(): void;
  end(): void;
  state(): PageState | null;
  pageId(): string | null;
  path(): string | null;
  /** Records a depth reading and returns any milestones newly crossed. */
  observeDepth(depth: number, scrollable: boolean): number[];
  /** The dwell to report, or null when nothing new has accumulated since the last one. */
  takeReport(): PageReport | null;
  /** One seq is reused for every exit report of a page, so resends overwrite one row. */
  exitSeq(allocate: () => number): number;
}

/**
 * The clock is injected rather than read inline so the tab-away, tab-back,
 * leave sequence can be tested with a fake clock and no DOM. This is the
 * subtlest piece of the capture layer and binding it to performance.now() at
 * the call site would make it untestable.
 */
export function createPageTimer(now: () => number): PageTimer {
  let ctx: {
    pageId: string;
    path: string;
    state: PageState;
    resumedAt: number;
    activeMs: number;
    reportedSec: number;
    maxDepth: number;
    milestones: Set<number>;
    exitSeq: number | null;
  } | null = null;

  function accumulated(): number {
    if (!ctx) return 0;
    return ctx.state === "active" ? ctx.activeMs + (now() - ctx.resumedAt) : ctx.activeMs;
  }

  function pause(): void {
    // Guarded because visibilitychange and pagehide can both fire, in either
    // order depending on the browser, and a second pause would double count.
    if (!ctx || ctx.state !== "active") return;
    ctx.activeMs += now() - ctx.resumedAt;
    ctx.state = "hidden";
  }

  return {
    begin(pageId, path, visible) {
      ctx = {
        pageId,
        path,
        state: visible ? "active" : "hidden",
        resumedAt: now(),
        activeMs: 0,
        reportedSec: -1,
        maxDepth: 0,
        milestones: new Set(),
        exitSeq: null,
      };
    },
    pause,
    resume() {
      if (!ctx || ctx.state !== "hidden") return;
      ctx.resumedAt = now();
      ctx.state = "active";
      // Deliberately no pageview and no new page id. Tabbing back to a page you
      // already opened is not a new visit.
    },
    end() {
      if (!ctx || ctx.state === "ended") return;
      pause();
      ctx.state = "ended";
    },
    state: () => ctx?.state ?? null,
    pageId: () => ctx?.pageId ?? null,
    path: () => ctx?.path ?? null,
    observeDepth(depth, scrollable) {
      if (!ctx || ctx.state === "ended") return [];
      if (depth > ctx.maxDepth) ctx.maxDepth = Math.min(100, depth);
      if (!scrollable) return [];

      const crossed: number[] = [];
      for (const milestone of SCROLL_MILESTONES) {
        if (depth >= milestone && !ctx.milestones.has(milestone)) {
          ctx.milestones.add(milestone);
          crossed.push(milestone);
        }
      }
      // Every newly crossed milestone fires, not just the highest. A jump to the
      // footer via a table-of-contents link would otherwise leave the 25, 50 and
      // 75 counters below the 100 counter, which is a funnel that runs backwards.
      return crossed;
    },
    takeReport() {
      if (!ctx) return null;
      const ms = Math.round(accumulated());
      const sec = Math.round(ms / 1000);
      // Suppresses an exit that carries nothing new, so flicking between tabs
      // five times without reading sends one exit rather than five.
      if (sec === ctx.reportedSec) return null;
      ctx.reportedSec = sec;
      return { ms, depth: ctx.maxDepth };
    },
    exitSeq(allocate) {
      if (!ctx) return allocate();
      if (ctx.exitSeq === null) ctx.exitSeq = allocate();
      return ctx.exitSeq;
    },
  };
}

// ─── Queue and transport ──────────────────────────────────────────

let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let suppressUntil = 0;

/**
 * Dev sends are dropped because reactStrictMode double-invokes every effect,
 * which would mint phantom pageviews and exits in the real counters. Set
 * NEXT_PUBLIC_ANALYTICS_DEBUG=1 to send from a dev build against a scratch table.
 */
function enabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ANALYTICS_DEBUG !== "1") {
    return false;
  }
  // Honoured because not needing a consent banner is the entire point of this
  // design, and ignoring an explicit opt-out would undercut that.
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl === true || nav.doNotTrack === "1") return false;
  return Date.now() >= suppressUntil;
}

export function enqueue(event: AnalyticsEvent): void {
  if (!enabled()) return;
  if (queue.length >= MAX_QUEUE) queue.shift();
  queue.push(event);

  if (queue.length >= FLUSH_AT) {
    flush("fetch");
    return;
  }
  // A one-shot timer rather than an interval, so an idle page costs no wakeups.
  if (!flushTimer) flushTimer = setTimeout(() => flush("fetch"), FLUSH_DELAY_MS);
}

export function flush(mode: "fetch" | "beacon"): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;

  // Swapped out before the send, so anything enqueued while a request is in
  // flight is neither lost nor sent twice.
  const pending = queue;
  queue = [];

  for (let i = 0; i < pending.length; i += MAX_EVENTS_PER_BATCH) {
    const chunk = pending.slice(i, i + MAX_EVENTS_PER_BATCH);
    const body: AnalyticsBatch = {
      v: ANALYTICS_SCHEMA_VERSION,
      sid: getSessionId(),
      // Per flush, so the server can recognise and refuse a replayed batch's
      // counter increments while still accepting its idempotent event rows.
      bid: newId(),
      events: chunk,
    };
    if (!send(body, mode)) queue = chunk.concat(queue);
  }
}

function send(body: AnalyticsBatch, mode: "fetch" | "beacon"): boolean {
  const json = JSON.stringify(body);

  if (mode === "beacon" && typeof navigator.sendBeacon === "function") {
    // sendBeacon cannot set headers, so the Blob's type IS the Content-Type.
    // application/json would trigger a preflight cross-origin, which is one
    // more reason this endpoint stays same-origin. Returns false when the
    // browser's own beacon queue is full.
    return navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([json], { type: "application/json" }));
  }

  // keepalive so an in-flight batch survives the navigation that triggered it.
  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json,
    keepalive: true,
  })
    .then((res) => {
      if (res.status === 429 || res.status >= 500) suppressUntil = Date.now() + SUPPRESS_MS;
    })
    .catch(() => {});
  return true;
}

// ─── Page lifecycle ───────────────────────────────────────────────

const timer = createPageTimer(() =>
  typeof performance !== "undefined" ? performance.now() : Date.now()
);

let scrollHeightCache = 0;

export function refreshScrollHeight(): void {
  scrollHeightCache = document.documentElement.scrollHeight;
}

function scrollable(): boolean {
  return scrollHeightCache > window.innerHeight * SCROLLABLE_RATIO;
}

export function startPage(path: string, referrer?: string): void {
  if (timer.state() && timer.state() !== "ended") endPage("route-change");

  const pageId = newId().slice(0, 16);
  timer.begin(pageId, path, document.visibilityState === "visible");

  enqueue({ t: "pageview", pid: pageId, p: path, ts: Date.now(), seq: nextSeq(), ref: referrer });

  refreshScrollHeight();
  measureScroll();
}

export function endPage(reason: ExitReason): void {
  const pageId = timer.pageId();
  const path = timer.path();
  if (!pageId || !path || timer.state() === "ended") return;

  timer.end();
  reportExit(reason);
}

function reportExit(reason: ExitReason): void {
  const pageId = timer.pageId();
  const path = timer.path();
  if (!pageId || !path) return;

  const report = timer.takeReport();
  if (!report) return;

  enqueue({
    t: "exit",
    pid: pageId,
    p: path,
    ts: Date.now(),
    // One seq for every exit report of this page, so a resend rewrites the same
    // row with the final duration instead of appending a second one.
    seq: timer.exitSeq(nextSeq),
    ms: report.ms,
    d: report.depth,
    r: reason,
  });
}

export function handleHidden(): void {
  timer.pause();
  reportExit("hidden");
  flush("beacon");
}

export function handleVisible(): void {
  timer.resume();
}

export function handlePageHide(persisted: boolean): void {
  endPage(persisted ? "bfcache" : "pagehide");
  flush("beacon");
}

export function measureScroll(): void {
  const pageId = timer.pageId();
  const path = timer.path();
  if (!pageId || !path || scrollHeightCache <= 0) return;

  const depth = Math.min(
    100,
    Math.round(((window.scrollY + window.innerHeight) / scrollHeightCache) * 100)
  );

  for (const milestone of timer.observeDepth(depth, scrollable())) {
    enqueue({
      t: "scroll",
      pid: pageId,
      p: path,
      ts: Date.now(),
      seq: nextSeq(),
      d: milestone as (typeof SCROLL_MILESTONES)[number],
    });
  }
}

export function trackClick(kind: LinkKind, target: string, flushNow: boolean): void {
  const pageId = timer.pageId();
  const path = timer.path();
  if (!pageId || !path) return;

  enqueue({ t: "click", pid: pageId, p: path, ts: Date.now(), seq: nextSeq(), k: kind, h: target });

  // An unmodified click to somewhere else may tear this page down before the
  // timer fires, so push what we have out now. A modified click opens a new tab
  // and leaves this page alive, so it can wait.
  if (flushNow) flush("beacon");
}

export function trackAgentOpen(source: AgentOpenSource): void {
  const pageId = timer.pageId();
  const path = timer.path();
  if (!pageId || !path) return;

  enqueue({ t: "agent_open", pid: pageId, p: path, ts: Date.now(), seq: nextSeq(), src: source });
}

/**
 * Same-origin referrers say nothing: by the second page it is always our own
 * site. Only the host is kept, never the full URL, since someone else's query
 * string can carry anything.
 */
export function externalReferrerHost(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return undefined;
    return url.hostname;
  } catch {
    return undefined;
  }
}

/** Test seam. Not used by application code. */
export function __resetAnalyticsClient(): void {
  sessionId = null;
  seqCounter = 0;
  queue = [];
  suppressUntil = 0;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}
