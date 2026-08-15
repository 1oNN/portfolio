export interface MarkdownHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function parseMarkdown(md: string): string {
  return parseMarkdownDoc(md).html;
}

/**
 * Full parse: returns the sanitized HTML plus the document-ordered h2/h3
 * outline (with the same slug ids embedded in the HTML) for building a
 * table of contents.
 */
export function parseMarkdownDoc(md: string): { html: string; headings: MarkdownHeading[] } {
  const codeBlocks: string[] = [];
  const inlineCodes: string[] = [];
  const inlineRaw: string[] = [];
  const headings: MarkdownHeading[] = [];
  const usedIds = new Set<string>();

  // Extract code blocks before any escaping. Capture the fence language token
  // and, when it's a valid identifier, emit a `language-<lang>` class; otherwise
  // fall back to exactly the previous output. Escaping is unchanged.
  let html = md.replace(/```([\w+-]*)\n?([\s\S]*?)```/g, (_match, lang: string, code: string) => {
    const idx = codeBlocks.length;
    const cls = /^[a-z0-9+-]{1,20}$/.test(lang) ? ` class="language-${lang}"` : "";
    codeBlocks.push(`<pre><code${cls}>${escapeHtml(code.trimEnd())}</code></pre>`);
    return `\x00CODE_BLOCK_${idx}\x00`;
  });

  // Extract inline code
  html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    inlineRaw.push(code);
    return `\x00INLINE_${idx}\x00`;
  });

  // Escape all remaining HTML so author-typed tags can't inject
  html = escapeHtml(html);

  // Plain text of a heading for the outline: entities back to characters,
  // inline-code placeholders back to their raw text.
  const headingText = (raw: string): string =>
    unescapeHtml(raw)
      .replace(/\x00INLINE_(\d+)\x00/g, (_m, i: string) => inlineRaw[Number(i)] ?? "")
      .trim();

  // Slug ids contain only [a-z0-9-], so they're safe to embed unquoted-risk-free.
  const slugify = (text: string): string => {
    const base =
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "section";
    let id = base;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    usedIds.add(id);
    return id;
  };

  // Headers in one pass so the collected outline stays in document order. A
  // single `#` is demoted to h2: the page already renders the post title as the
  // h1, and the old separate pass gave it no slug id and left it out of the
  // outline, so it was both a duplicate h1 and unlinkable.
  html = html.replace(/^(#{1,3}) (.+)$/gm, (_m, hashes: string, t: string) => {
    const level = (hashes.length === 3 ? 3 : 2) as 2 | 3;
    const text = headingText(t);
    const id = slugify(text);
    headings.push({ id, text, level });
    return `<h${level} id="${id}">${t}</h${level}>`;
  });

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links - only allow http/https/mailto hrefs
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, text: string, href: string) => {
      const safe = /^(https?:\/\/|mailto:)/.test(href) ? href : "#";
      return `<a href="${safe}" rel="noopener noreferrer" target="_blank">${text}</a>`;
    }
  );

  // Unordered lists
  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^- /, "").trim()}</li>`)
      .join("");
    // Trailing newline matters: the match ate the block's own line break, so
    // without it only one \n separates this from the next paragraph, the
    // \n\n+ split below keeps them in one chunk, and the block-level check
    // then returns the whole chunk unwrapped - losing the <p> on that text.
    return `<ul>${items}</ul>\n`;
  });

  // Blockquotes - the ">" marker survives escapeHtml() as "&gt;"
  html = html.replace(/((?:^&gt; .+\n?)+)/gm, (block) => {
    const text = block
      .trim()
      .split("\n")
      .map((line) => line.replace(/^&gt; /, "").trim())
      .join(" ");
    // Same trailing-newline reason as the list above.
    return `<blockquote>${text}</blockquote>\n`;
  });

  // Paragraphs
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|div)/i.test(trimmed)) return trimmed;
      if (/^\x00CODE_BLOCK_\d+\x00$/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  // Restore code blocks and inline code. The replacement MUST be a function:
  // as a plain string, `$&`, `$'`, "$`" and `$$` are substitution patterns, so
  // a fence containing any of them (shell `$$`, LaTeX, ANSI-C quoting) got the
  // placeholder spliced into the rendered code instead of the literal text.
  codeBlocks.forEach((block, i) => {
    html = html.replace(`\x00CODE_BLOCK_${i}\x00`, () => block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`\x00INLINE_${i}\x00`, () => code);
  });

  return { html, headings };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}
