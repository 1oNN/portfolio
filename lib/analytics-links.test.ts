import { describe, it, expect } from "vitest";
import { classifyLink } from "./analytics-links";

// The classifier is the only thing standing between a delegated click listener
// and whatever an author put in a markdown link, so the negative cases matter
// as much as the positive ones.

const HERE = { origin: "https://hammadahmad.co.uk", pathname: "/blog/a-post" };

const TAB = String.fromCharCode(9);
const NEWLINE = String.fromCharCode(10);

function classify(href: string | null | undefined, isDownload = false) {
  return classifyLink(href, HERE, isDownload);
}

describe("classifyLink", () => {
  describe("rejects", () => {
    it("returns null for missing or empty hrefs", () => {
      expect(classify(null)).toBeNull();
      expect(classify(undefined)).toBeNull();
      expect(classify("")).toBeNull();
      expect(classify("   ")).toBeNull();
    });

    it("returns null for script-bearing schemes", () => {
      expect(classify("javascript:void(0)")).toBeNull();
      expect(classify("JavaScript:alert(1)")).toBeNull();
      expect(classify("data:text/html,<script>x</script>")).toBeNull();
      expect(classify("vbscript:msgbox")).toBeNull();
      expect(classify("blob:https://x/1234")).toBeNull();
    });

    it("still rejects a scheme broken up by control characters", () => {
      // The browser ignores these and runs the script anyway, so the denylist
      // has to see the same string the browser resolves.
      expect(classify(`java${TAB}script:alert(1)`)).toBeNull();
      expect(classify(`java${NEWLINE}script:alert(1)`)).toBeNull();
    });

    it("returns null rather than a garbage target for an unparseable href", () => {
      expect(classify("http://[")).toBeNull();
    });
  });

  describe("anchors", () => {
    it("treats a bare fragment as an anchor", () => {
      expect(classify("#contact")).toEqual({ kind: "anchor", target: "#contact" });
    });

    it("treats a fragment on the current path as an anchor", () => {
      expect(classify("/blog/a-post#section-2")).toEqual({
        kind: "anchor",
        target: "#section-2",
      });
    });

    it("treats a fragment on a different path as ordinary internal navigation", () => {
      expect(classify("/projects#top")).toEqual({ kind: "internal", target: "/projects" });
    });
  });

  describe("mailto", () => {
    it("records the address without the scheme", () => {
      expect(classify("mailto:hammadahmad.ml@gmail.com")).toEqual({
        kind: "mailto",
        target: "hammadahmad.ml@gmail.com",
      });
    });
  });

  describe("external", () => {
    it("keeps host and path, and drops query and hash", () => {
      expect(classify("https://github.com/1oNN/portfolio?tab=readme#install")).toEqual({
        kind: "external",
        target: "github.com/1oNN/portfolio",
      });
    });

    it("reduces a bare host to the host alone", () => {
      expect(classify("https://linkedin.com/")).toEqual({
        kind: "external",
        target: "linkedin.com",
      });
    });

    it("drops a trailing slash so one destination is one key", () => {
      expect(classify("https://doi.org/10.1234/x/")).toEqual({
        kind: "external",
        target: "doi.org/10.1234/x",
      });
    });

    it("resolves a protocol-relative href against the current origin", () => {
      expect(classify("//evil.example/path")).toEqual({
        kind: "external",
        target: "evil.example/path",
      });
    });

    it("records only the scheme for tel:, never the number", () => {
      const hit = classify("tel:+441234567890");
      expect(hit).toEqual({ kind: "external", target: "tel" });
      expect(hit?.target).not.toContain("441234567890");
    });
  });

  describe("cv downloads", () => {
    it("classifies anything under /cv/ as a download", () => {
      expect(classify("/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf")).toEqual({
        kind: "cv-download",
        target: "/cv/Hammad_Ahmad_CV_AI_ML_Engineer.pdf",
      });
    });

    it("honours the download attribute outside /cv/", () => {
      expect(classify("/files/thing.pdf", true)).toEqual({
        kind: "cv-download",
        target: "/files/thing.pdf",
      });
    });

    it("leaves the same path alone without the download attribute", () => {
      expect(classify("/files/thing.pdf")).toEqual({
        kind: "internal",
        target: "/files/thing.pdf",
      });
    });
  });

  describe("internal", () => {
    it("keeps the path and drops the query", () => {
      expect(classify("/blog?type=case-study")).toEqual({ kind: "internal", target: "/blog" });
    });

    it("resolves a relative href against the current page", () => {
      expect(classify("/projects/finlaw-uk")).toEqual({
        kind: "internal",
        target: "/projects/finlaw-uk",
      });
    });
  });

  it("caps an absurd target so one link cannot mint an oversized key", () => {
    const hit = classify("/" + "a".repeat(400));
    expect(hit?.kind).toBe("internal");
    expect(hit?.target.length).toBe(128);
  });
});
