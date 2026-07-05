export function parseMarkdown(md: string): string {
  const codeBlocks: string[] = [];
  const inlineCodes: string[] = [];

  // Extract code blocks before any escaping
  let html = md.replace(/```[\w]*\n?([\s\S]*?)```/g, (_match, code: string) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`);
    return `\x00CODE_BLOCK_${idx}\x00`;
  });

  // Extract inline code
  html = html.replace(/`([^`]+)`/g, (_match, code: string) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `\x00INLINE_${idx}\x00`;
  });

  // Escape all remaining HTML so author-typed tags can't inject
  html = escapeHtml(html);

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links — only allow http/https/mailto hrefs
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
    return `<ul>${items}</ul>`;
  });

  // Blockquotes — the ">" marker survives escapeHtml() as "&gt;"
  html = html.replace(/((?:^&gt; .+\n?)+)/gm, (block) => {
    const text = block
      .trim()
      .split("\n")
      .map((line) => line.replace(/^&gt; /, "").trim())
      .join(" ");
    return `<blockquote>${text}</blockquote>`;
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

  // Restore code blocks and inline code
  codeBlocks.forEach((block, i) => {
    html = html.replace(`\x00CODE_BLOCK_${i}\x00`, block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`\x00INLINE_${i}\x00`, code);
  });

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
