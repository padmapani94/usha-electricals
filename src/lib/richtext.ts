// Minimal formatting syntax for product descriptions: **bold**, *italic*, __underline__,
// a blank line starts a new paragraph, a single line break becomes <br/>.
// Kept intentionally tiny (no markdown/HTML dependency) since it's driven by a toolbar,
// not typed by hand, and we fully control what tags come out the other end.

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+?)__/g, "<u>$1</u>")
    .replace(/\*([^*]+?)\*/g, "<em>$1</em>");
}

export function richTextToHtml(raw: string): string {
  const escaped = escapeHtml(raw ?? "").trim();
  if (!escaped) return "";
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${formatInline(paragraph).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export function richTextToPlainText(raw: string): string {
  return (raw ?? "")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/__([^_]+?)__/g, "$1")
    .replace(/\*([^*]+?)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
