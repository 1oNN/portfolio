/**
 * parseMarkdown — convert a subset of Markdown to HTML.
 * Designed for admin-authored content only (no user input).
 */
export function parseMarkdown(md: string): string {
  let html = md;

  // ── Code blocks (``` ... ```) — must come before inline code ──
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_match, code: string) => {
    const escaped = escapeHtml(code.trimEnd());
    return `<pre><code>${escaped}</code></pre>`;
  });

  // ── Inline code (`code`) ──
  html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
    return `<code>${escapeHtml(code)}</code>`;
  });

  // ── Headers ──
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // ── Bold / italic ──
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // ── Links ──
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // ── Unordered list items ──
  // Wrap consecutive `- ...` lines in a <ul>
  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^- /, "").trim()}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // ── Paragraphs — split on double newlines, wrap non-block elements ──
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap already-block-level HTML
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|div)/i.test(trimmed)) {
        return trimmed;
      }
      // Collapse single newlines within paragraph
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
