// Minimal formatting syntax for product descriptions: **bold**, *italic*, __underline__,
// a line starting with "- " is a bullet list item, a blank line starts a new paragraph,
// a single line break becomes <br/>.
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

const BULLET_RE = /^[-•]\s+(.*)$/;

function blockToHtml(block: string): string {
  const lines = block.split("\n");
  const chunks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const bulletMatch = lines[i].match(BULLET_RE);
    if (bulletMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(BULLET_RE);
        if (!m) break;
        items.push(`<li>${formatInline(m[1])}</li>`);
        i++;
      }
      chunks.push(`<ul>${items.join("")}</ul>`);
    } else {
      const textLines: string[] = [];
      while (i < lines.length && !BULLET_RE.test(lines[i])) {
        textLines.push(lines[i]);
        i++;
      }
      chunks.push(`<p>${textLines.map(formatInline).join("<br/>")}</p>`);
    }
  }
  return chunks.join("");
}

export function richTextToHtml(raw: string): string {
  const escaped = escapeHtml(raw ?? "").trim();
  if (!escaped) return "";
  return escaped.split(/\n{2,}/).map(blockToHtml).join("");
}

export function richTextToPlainText(raw: string): string {
  return (raw ?? "")
    .replace(/^[-•]\s+/gm, "")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/__([^_]+?)__/g, "$1")
    .replace(/\*([^*]+?)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
