import { describe, it, expect } from "vitest";
import {
  clampDwellMs,
  classifyPath,
  deviceClassFromUserAgent,
  isBotUserAgent,
  normalizeCountry,
  normalizeLinkTarget,
  normalizePath,
  normalizeReferrerHost,
  OVERFLOW_PATH,
  pathForRollup,
  validateBatch,
} from "./analytics-normalize";

// This module is the whole abuse surface of an unauthenticated public endpoint,
// so most of these are negative cases.

const SID = "5c0f9e2a-1b74-4d51-9a3e-8f6d2c1b0a77";
const BID = "2f81c0d4-aaaa-bbbb-cccc-ddddeeeeffff";

const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function pageview(over: Record<string, unknown> = {}) {
  return { t: "pageview", pid: "page-1", p: "/", ts: Date.now(), seq: 0, ...over };
}

describe("normalizePath", () => {
  it("strips query and hash so ?utm= cannot mint keys", () => {
    expect(normalizePath("/blog?utm_source=x&utm_campaign=y")).toBe("/blog");
    expect(normalizePath("/blog/post#section-3")).toBe("/blog/post");
  });

  it("falls back to root for anything that is not a path", () => {
    expect(normalizePath("https://evil.example/x")).toBe("/");
    expect(normalizePath("")).toBe("/");
    expect(normalizePath(null)).toBe("/");
    expect(normalizePath(42)).toBe("/");
  });

  it("caps length", () => {
    expect(normalizePath("/" + "a".repeat(500))).toHaveLength(128);
  });
});

describe("classifyPath", () => {
  it("recognises the static routes", () => {
    expect(classifyPath("/")).toBe("static");
    expect(classifyPath("/blog")).toBe("static");
    expect(classifyPath("/projects")).toBe("static");
  });

  it("recognises real project slugs and rejects invented ones", () => {
    expect(classifyPath("/projects/finlaw-uk")).toBe("project");
    expect(classifyPath("/projects/jobzyl")).toBe("project");
    expect(classifyPath("/projects/not-a-real-project")).toBe("unknown");
  });

  it("accepts blog slugs by shape, since posts are published without a rebuild", () => {
    expect(classifyPath("/blog/ranking-is-the-product")).toBe("blog");
    expect(classifyPath("/blog/a1")).toBe("blog");
  });

  it("rejects blog slugs that could widen the key space", () => {
    expect(classifyPath("/blog/Uppercase")).toBe("unknown");
    expect(classifyPath("/blog/../../etc/passwd")).toBe("unknown");
    expect(classifyPath("/blog/trailing-")).toBe("unknown");
    expect(classifyPath("/blog/" + "a".repeat(120))).toBe("unknown");
    expect(classifyPath("/blog/nested/deeper")).toBe("unknown");
  });

  it("collapses structurally unknown paths for rollups", () => {
    expect(pathForRollup("/wp-admin/install.php")).toBe(OVERFLOW_PATH);
    expect(pathForRollup("/projects/not-a-real-project")).toBe(OVERFLOW_PATH);
    expect(pathForRollup("/projects/finlaw-uk")).toBe("/projects/finlaw-uk");
  });

  it("lets a shape-valid blog slug through even if no such post exists", () => {
    // Deliberate. Posts are published from the admin without a rebuild, so the
    // server cannot know the real slug list without a scan on the beacon path.
    // Shape plus the route rate limit is the bound instead.
    expect(pathForRollup("/blog/a-post-that-does-not-exist")).toBe(
      "/blog/a-post-that-does-not-exist"
    );
  });
});

describe("normalizeReferrerHost", () => {
  it("reports an absent referrer as direct", () => {
    expect(normalizeReferrerHost(undefined)).toBe("direct");
    expect(normalizeReferrerHost("")).toBe("direct");
  });

  it("normalises case and drops a www prefix so one source is one key", () => {
    expect(normalizeReferrerHost("WWW.Google.com")).toBe("google.com");
  });

  it("buckets anything that is not host-shaped", () => {
    expect(normalizeReferrerHost("not a host")).toBe("other");
    expect(normalizeReferrerHost("https://google.com/path")).toBe("other");
    expect(normalizeReferrerHost("a".repeat(200))).toBe("other");
  });

  it("treats a self-referral as direct", () => {
    expect(normalizeReferrerHost("hammadahmad.co.uk", "hammadahmad.co.uk")).toBe("direct");
    expect(normalizeReferrerHost("www.hammadahmad.co.uk", "hammadahmad.co.uk")).toBe("direct");
  });
});

describe("normalizeCountry", () => {
  it("accepts a two-letter code and uppercases it", () => {
    expect(normalizeCountry("de")).toBe("DE");
    expect(normalizeCountry("GB")).toBe("GB");
  });

  it("buckets anything else, so the dimension stays bounded at ~250", () => {
    expect(normalizeCountry("GBR")).toBe("XX");
    expect(normalizeCountry("")).toBe("XX");
    expect(normalizeCountry(null)).toBe("XX");
  });
});

describe("normalizeLinkTarget", () => {
  it("caps length and strips control characters", () => {
    expect(normalizeLinkTarget("github.com/" + "a".repeat(300))).toHaveLength(128);
    expect(normalizeLinkTarget(`git${String.fromCharCode(10)}hub.com`)).toBe("github.com");
  });

  it("buckets an empty or non-string target", () => {
    expect(normalizeLinkTarget("")).toBe("other");
    expect(normalizeLinkTarget(null)).toBe("other");
  });
});

describe("isBotUserAgent", () => {
  it("drops the crawlers that would otherwise outnumber the humans", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
      "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      "facebookexternalhit/1.1",
      "curl/8.4.0",
      "python-requests/2.31.0",
      "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0.0.0",
    ]) {
      expect(isBotUserAgent(ua)).toBe(true);
    }
  });

  it("treats a missing user agent as a bot, because a browser always sends one", () => {
    expect(isBotUserAgent(null)).toBe(true);
    expect(isBotUserAgent("")).toBe(true);
  });

  it("lets real browsers through", () => {
    for (const ua of [CHROME, IPHONE, IPAD, ANDROID_PHONE, ANDROID_TABLET]) {
      expect(isBotUserAgent(ua)).toBe(false);
    }
  });
});

describe("deviceClassFromUserAgent", () => {
  it("tests tablet before mobile, because an iPad says Mobile too", () => {
    expect(deviceClassFromUserAgent(IPAD)).toBe("tablet");
    expect(deviceClassFromUserAgent(ANDROID_TABLET)).toBe("tablet");
  });

  it("classifies phones", () => {
    expect(deviceClassFromUserAgent(IPHONE)).toBe("mobile");
    expect(deviceClassFromUserAgent(ANDROID_PHONE)).toBe("mobile");
  });

  it("falls back to desktop", () => {
    expect(deviceClassFromUserAgent(CHROME)).toBe("desktop");
    expect(deviceClassFromUserAgent(null)).toBe("desktop");
  });
});

describe("clampDwellMs", () => {
  it("passes a plausible dwell through unchanged", () => {
    expect(clampDwellMs(187_432)).toEqual({ dwellMs: 187_432, clamped: false });
  });

  it("clamps a tab left open for hours to the thirty minute ceiling", () => {
    expect(clampDwellMs(8 * 60 * 60 * 1000)).toEqual({ dwellMs: 1_800_000, clamped: true });
  });

  it("clamps to what the server has actually observed", () => {
    // A session first seen twelve seconds ago cannot have four minutes of dwell.
    const result = clampDwellMs(240_000, 12_000);
    expect(result?.dwellMs).toBe(17_000); // 12s observed plus 5s of slack
    expect(result?.clamped).toBe(true);
  });

  it("floors a negative at zero", () => {
    expect(clampDwellMs(-5000)).toEqual({ dwellMs: 0, clamped: false });
  });

  it("rejects a non-number outright so the event is recorded without dwell", () => {
    expect(clampDwellMs("600000")).toBeNull();
    expect(clampDwellMs(Number.NaN)).toBeNull();
    expect(clampDwellMs(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("validateBatch", () => {
  it("accepts a well-formed batch", () => {
    const result = validateBatch({ v: 1, sid: SID, bid: BID, events: [pageview()] });
    expect(result.ok).toBe(true);
  });

  it("rejects a batch whose envelope is wrong", () => {
    expect(validateBatch(null).ok).toBe(false);
    expect(validateBatch("nope").ok).toBe(false);
    expect(validateBatch({ v: 2, sid: SID, bid: BID, events: [pageview()] }).ok).toBe(false);
    expect(validateBatch({ v: 1, sid: "short", bid: BID, events: [pageview()] }).ok).toBe(false);
    expect(validateBatch({ v: 1, sid: SID, bid: "x", events: [pageview()] }).ok).toBe(false);
    expect(validateBatch({ v: 1, sid: SID, bid: BID, events: [] }).ok).toBe(false);
    expect(validateBatch({ v: 1, sid: SID, bid: BID, events: "lots" }).ok).toBe(false);
  });

  it("rejects a session id that could carry a key separator", () => {
    expect(validateBatch({ v: 1, sid: "abc#DEF#ghi", bid: BID, events: [pageview()] }).ok).toBe(
      false
    );
  });

  it("drops a bad event without losing the good ones next to it", () => {
    const result = validateBatch({
      v: 1,
      sid: SID,
      bid: BID,
      events: [pageview(), { t: "scroll", pid: "p", p: "/", ts: Date.now(), seq: 1, d: 33 }, pageview({ seq: 2 })],
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.batch.events).toHaveLength(2);
  });

  it("fails only when nothing in the batch survives", () => {
    const result = validateBatch({
      v: 1,
      sid: SID,
      bid: BID,
      events: [{ t: "nonsense" }, { t: "scroll", pid: "p", p: "/", ts: 1, seq: 0, d: 7 }],
    });
    expect(result.ok).toBe(false);
  });

  it("truncates an oversized batch rather than rejecting it", () => {
    const events = Array.from({ length: 60 }, (_, i) => pageview({ seq: i }));
    const result = validateBatch({ v: 1, sid: SID, bid: BID, events });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.batch.events).toHaveLength(25);
  });

  it("clamps a spoofed client clock into a believable window", () => {
    const now = Date.parse("2026-08-25T12:00:00.000Z");
    const result = validateBatch(
      { v: 1, sid: SID, bid: BID, events: [pageview({ ts: 4_102_444_800_000 })] },
      now
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.batch.events[0].ts).toBe(now + 5 * 60 * 1000);
  });

  it("clamps a spoofed dwell inside a batch", () => {
    const result = validateBatch({
      v: 1,
      sid: SID,
      bid: BID,
      events: [
        { t: "exit", pid: "p", p: "/", ts: Date.now(), seq: 1, ms: 99_999_999, d: 400, r: "pagehide" },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const exit = result.batch.events[0];
      expect(exit.t).toBe("exit");
      if (exit.t === "exit") {
        expect(exit.ms).toBe(1_800_000);
        expect(exit.d).toBe(100);
      }
    }
  });

  it("rejects an exit whose reason is not a known one", () => {
    const result = validateBatch({
      v: 1,
      sid: SID,
      bid: BID,
      events: [{ t: "exit", pid: "p", p: "/", ts: Date.now(), seq: 1, ms: 100, d: 50, r: "made-up" }],
    });
    expect(result.ok).toBe(false);
  });

  it("normalises the path of every accepted event", () => {
    const result = validateBatch({
      v: 1,
      sid: SID,
      bid: BID,
      events: [pageview({ p: "/blog?utm_source=hn#top" })],
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.batch.events[0].p).toBe("/blog");
  });
});
