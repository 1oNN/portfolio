import { canShowPercentDelta } from "./analytics-select";

/**
 * Presentation helpers for the analytics dashboard.
 *
 * Pure, so the copy rules that keep the panel honest at low volume are
 * testable rather than scattered through JSX.
 */

/** "4m 12s", "48s", "1h 05m". Never "0m 0s". */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "-";
  const total = Math.round(ms / 1000);
  if (total < 60) return `${total}s`;

  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes < 60) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${(minutes % 60).toString().padStart(2, "0")}m`;
}

/** Elapsed time inside a session trail, as a clock offset: "0:00", "6:48", "1:04:12". */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const seconds = (total % 60).toString().padStart(2, "0");
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}:${seconds}`;
  return `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, "0")}:${seconds}`;
}

/**
 * Singular copy, and "nobody" where it reads better than "0 visitors".
 * A dashboard that says "1 visitor(s)" looks unfinished.
 */
export function pluralise(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function formatPercent(fraction: number): string {
  if (!Number.isFinite(fraction)) return "-";
  const percent = Math.round(fraction * 100);
  // Suppress a zero rather than printing "0%", which reads as a measurement
  // when it is usually an absence.
  return percent === 0 ? "-" : `${percent}%`;
}

/**
 * A delta, as an absolute count unless both sides are big enough for a
 * percentage to mean anything. Percentage change on small integers is the
 * commonest way a small-site dashboard lies to its owner.
 */
export function formatDelta(current: number, previous: number, noun: string): string {
  const difference = current - previous;
  if (difference === 0) return "no change";

  if (canShowPercentDelta(previous, current)) {
    const percent = Math.round((difference / previous) * 100);
    return `${percent > 0 ? "+" : ""}${percent}% vs prev`;
  }

  const sign = difference > 0 ? "+" : "";
  return `${sign}${pluralise(Math.abs(difference), noun)}`;
}

/** Short, stable handle for a session. Same-day only, which the UI says out loud. */
export function shortSessionId(sessionId: string): string {
  return `#${sessionId.replace(/-/g, "").slice(0, 4)}`;
}

const COUNTRY_NAMES =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function countryName(code: string): string {
  if (code === "XX") return "Unknown";
  try {
    return COUNTRY_NAMES?.of(code) ?? code;
  } catch {
    return code;
  }
}

export function referrerLabel(host: string): string {
  if (host === "direct") return "Direct / none";
  if (host === "other") return "Unrecognised";
  return host;
}

export function linkKindLabel(kind: string): string {
  switch (kind) {
    case "cv-download":
      return "CV download";
    case "mailto":
      return "Email";
    case "external":
      return "Outbound";
    case "internal":
      return "Internal";
    case "anchor":
      return "In-page";
    default:
      return kind;
  }
}

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const DATE_ONLY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDateTime(iso: string): string {
  const at = Date.parse(iso);
  return Number.isFinite(at) ? DATE_TIME.format(at) : iso;
}

export function formatDay(date: string): string {
  const at = Date.parse(`${date}T00:00:00.000Z`);
  return Number.isFinite(at) ? DATE_ONLY.format(at) : date;
}

export function formatRange(from: string, to: string): string {
  return `${formatDay(from)} - ${formatDay(to)}`;
}

/** Trims a path for a narrow table cell without hiding which page it is. */
export function shortPath(path: string, max = 34): string {
  if (path.length <= max) return path;
  return `${path.slice(0, max - 1)}...`;
}
