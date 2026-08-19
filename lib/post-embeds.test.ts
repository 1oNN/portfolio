import { describe, it, expect } from "vitest";
import { parseMarkdown } from "./markdown";
import { splitPostEmbeds } from "./post-embeds";

// The splitter runs on parser output, so these tests go through the parser
// rather than hand-written HTML: the contract that matters is that a marker
// survives sanitizing as a literal paragraph and comes back out as an embed.

describe("splitPostEmbeds", () => {
  it("returns one html segment when there is no marker", () => {
    const segments = splitPostEmbeds(parseMarkdown("Just prose."));
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({ kind: "html", html: "<p>Just prose.</p>" });
  });

  it("splits prose around a marker written on its own line", () => {
    const html = parseMarkdown(["Before.", "", "[[embed:dedupe-key]]", "", "After."].join("\n"));
    const segments = splitPostEmbeds(html);
    expect(segments.map((s) => s.kind)).toEqual(["html", "embed", "html"]);
    expect(segments[1]).toEqual({ kind: "embed", id: "dedupe-key" });
    expect(segments[0].kind === "html" && segments[0].html).toContain("Before.");
    expect(segments[2].kind === "html" && segments[2].html).toContain("After.");
  });

  it("keeps the marker paragraph out of the rendered html", () => {
    const segments = splitPostEmbeds(parseMarkdown("A\n\n[[embed:facet-counts]]\n\nB"));
    for (const segment of segments) {
      if (segment.kind === "html") expect(segment.html).not.toContain("[[embed:");
    }
  });

  it("handles several markers and a leading one", () => {
    const html = parseMarkdown(["[[embed:a1]]", "", "Middle.", "", "[[embed:b2]]"].join("\n"));
    const segments = splitPostEmbeds(html);
    expect(segments.map((s) => s.kind)).toEqual(["embed", "html", "embed"]);
  });

  it("leaves an inline marker alone so only deliberate blocks become embeds", () => {
    const segments = splitPostEmbeds(parseMarkdown("Write [[embed:x]] to embed it."));
    expect(segments).toHaveLength(1);
    expect(segments[0].kind === "html" && segments[0].html).toContain("[[embed:x]]");
  });

  it("does not treat an uppercase or path-like id as a marker", () => {
    const segments = splitPostEmbeds(parseMarkdown("[[embed:../../secret]]"));
    expect(segments.every((s) => s.kind === "html")).toBe(true);
  });
});
