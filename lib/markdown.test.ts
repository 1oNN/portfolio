import { describe, it, expect } from "vitest";
import { parseMarkdown, parseMarkdownDoc } from "./markdown";

// This parser is the only thing between DB-stored post bodies and
// dangerouslySetInnerHTML, so the escaping cases below are the load-bearing
// ones. The rest cover the formatting contract the blog templates rely on.

describe("escaping", () => {
  it("escapes author-typed script tags", () => {
    const html = parseMarkdown("Hello <script>alert(1)</script> world");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes inline event handlers so they cannot become attributes", () => {
    const html = parseMarkdown(`<img src=x onerror="alert(1)">`);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("escapes quotes and ampersands", () => {
    const html = parseMarkdown(`Tom & Jerry said "hi" and 'bye'`);
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;");
    expect(html).toContain("&#x27;");
  });

  it("escapes HTML inside code fences", () => {
    const html = parseMarkdown("```\n<script>alert(1)</script>\n```");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("links", () => {
  it("allows http, https and mailto", () => {
    expect(parseMarkdown("[a](https://example.com)")).toContain('href="https://example.com"');
    expect(parseMarkdown("[a](http://example.com)")).toContain('href="http://example.com"');
    expect(parseMarkdown("[a](mailto:x@example.com)")).toContain('href="mailto:x@example.com"');
  });

  it("neutralises javascript: hrefs", () => {
    const html = parseMarkdown("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="#"');
  });

  it("neutralises data: hrefs", () => {
    const html = parseMarkdown("[click](data:text/html;base64,PHNjcmlwdD4=)");
    expect(html).not.toContain("data:text/html");
    expect(html).toContain('href="#"');
  });

  it("neutralises protocol-relative and relative hrefs", () => {
    expect(parseMarkdown("[a](//evil.example)")).toContain('href="#"');
    expect(parseMarkdown("[a](/internal)")).toContain('href="#"');
  });

  it("marks outbound links noopener", () => {
    expect(parseMarkdown("[a](https://example.com)")).toContain('rel="noopener noreferrer"');
  });
});

// Regression: the placeholder restore used a string replacement, so `$&`, "$`",
// `$'` and `$$` in code were treated as substitution patterns and spliced the
// placeholder into the output.
describe("dollar patterns in code (regression)", () => {
  const cases: [string, string][] = [
    ["$$", "shell PID / LaTeX"],
    ["$&", "whole-match pattern"],
    ["$'", "after-match pattern"],
    ["$`", "before-match pattern"],
  ];

  const escaped = (t: string) => t.replace(/&/g, "&amp;").replace(/'/g, "&#x27;");

  for (const [token, label] of cases) {
    it(`preserves ${token} in a fenced block (${label})`, () => {
      const html = parseMarkdown("```\necho " + token + "\n```");
      expect(html).not.toContain("CODE_BLOCK");
      expect(html).toContain(escaped(token));
    });

    // A literal backtick cannot appear inside single-backtick inline code: the
    // span just ends there. That is correct markdown, so it is not a case here.
    if (token === "$`") continue;

    it(`preserves ${token} in inline code (${label})`, () => {
      const html = parseMarkdown("use `" + token + "` here");
      expect(html).not.toContain("INLINE_");
      expect(html).toContain(escaped(token));
    });
  }

  it("keeps multiple fences with dollar patterns independent", () => {
    const html = parseMarkdown("```\nfirst $$\n```\n\ntext\n\n```\nsecond $&\n```");
    expect(html).not.toContain("CODE_BLOCK");
    expect(html).toContain("first $$");
    expect(html).toContain("second $&amp;");
  });
});

describe("code fences", () => {
  it("emits a language class for a valid language token", () => {
    expect(parseMarkdown("```ts\nconst a = 1;\n```")).toContain('class="language-ts"');
  });

  it("omits the class when there is no language token", () => {
    const html = parseMarkdown("```\nplain\n```");
    expect(html).toContain("<pre><code>");
    expect(html).not.toContain("language-");
  });

  it("ignores a language token that is not a plain identifier", () => {
    // Uppercase fails the identifier test, so no class is emitted at all.
    const html = parseMarkdown("```TypeScript\nplain\n```");
    expect(html).toContain("<pre><code>");
    expect(html).not.toContain("language-");
  });

  it("cannot break out of the class attribute via the fence info string", () => {
    const html = parseMarkdown('```a"onload="x\nplain\n```');
    // The info string stops at the quote, so the class is just `language-a` and
    // the remainder is escaped body text rather than a second attribute.
    expect(html).toContain('<code class="language-a">');
    expect(html).not.toContain('onload="x"');
    expect(html).toContain("&quot;onload=&quot;x");
  });
});

describe("headings and outline", () => {
  it("demotes a single hash to h2 so the post title stays the only h1", () => {
    const { html } = parseMarkdownDoc("# Title");
    expect(html).toContain("<h2");
    expect(html).not.toContain("<h1");
  });

  it("maps ## to h2 and ### to h3", () => {
    const { headings } = parseMarkdownDoc("## Two\n\n### Three");
    expect(headings.map((h) => h.level)).toEqual([2, 3]);
  });

  it("returns headings in document order with slug ids matching the html", () => {
    const { html, headings } = parseMarkdownDoc("## First One\n\n## Second Two");
    expect(headings.map((h) => h.id)).toEqual(["first-one", "second-two"]);
    expect(html).toContain('id="first-one"');
    expect(html).toContain('id="second-two"');
  });

  it("disambiguates duplicate heading slugs", () => {
    const { headings } = parseMarkdownDoc("## Setup\n\n## Setup\n\n## Setup");
    expect(headings.map((h) => h.id)).toEqual(["setup", "setup-2", "setup-3"]);
  });

  it("falls back to a stable id when a heading has no slug characters", () => {
    const { headings } = parseMarkdownDoc("## ???");
    expect(headings[0]?.id).toBe("section");
  });

  it("reports heading text without entities or code placeholders", () => {
    const { headings } = parseMarkdownDoc("## Using `npm` & co");
    expect(headings[0]?.text).toBe("Using npm & co");
  });
});

describe("block formatting", () => {
  it("renders bold and italic", () => {
    expect(parseMarkdown("**bold**")).toContain("<strong>bold</strong>");
    expect(parseMarkdown("*italic*")).toContain("<em>italic</em>");
  });

  it("renders unordered lists", () => {
    const html = parseMarkdown("- one\n- two");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>two</li>");
  });

  it("renders blockquotes", () => {
    expect(parseMarkdown("> quoted line")).toContain("<blockquote>quoted line</blockquote>");
  });

  it("wraps loose text in paragraphs", () => {
    expect(parseMarkdown("first para\n\nsecond para")).toContain("<p>first para</p>");
  });

  it("does not wrap block-level elements in paragraphs", () => {
    expect(parseMarkdown("## Heading")).not.toContain("<p><h2");
  });

  // The block replacements consume their own trailing newline, so without an
  // explicit one the following paragraph got absorbed into the same chunk and
  // emitted bare. Post bodies put prose straight after a pull quote.
  it("wraps a paragraph that follows a blockquote", () => {
    const html = parseMarkdown("> pull quote\n\nFollowing prose.");
    expect(html).toContain("<blockquote>pull quote</blockquote>");
    expect(html).toContain("<p>Following prose.</p>");
  });

  it("wraps a paragraph that follows a list", () => {
    const html = parseMarkdown("- one\n- two\n\nFollowing prose.");
    expect(html).toContain("<li>two</li>");
    expect(html).toContain("<p>Following prose.</p>");
  });

  it("still wraps a paragraph that precedes a blockquote", () => {
    const html = parseMarkdown("Leading prose.\n\n> pull quote");
    expect(html).toContain("<p>Leading prose.</p>");
    expect(html).toContain("<blockquote>pull quote</blockquote>");
  });
});

describe("edge cases", () => {
  it("handles an empty document", () => {
    expect(() => parseMarkdownDoc("")).not.toThrow();
    expect(parseMarkdownDoc("").headings).toEqual([]);
  });

  it("handles an unterminated code fence without throwing", () => {
    expect(() => parseMarkdown("```\nunclosed")).not.toThrow();
  });

  it("leaves a bare backtick alone", () => {
    expect(() => parseMarkdown("a ` b")).not.toThrow();
  });
});
