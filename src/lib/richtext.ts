// Minimal formatting syntax for product descriptions: **bold**, *italic*, __underline__,
// a blank line starts a new paragraph, a single line break becomes <br/>. Lines can also
// be list items: "- " for bullets, "1. " for numbered, "a. " for alphabetical.
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

type ListKind = "bullet" | "numbered" | "alpha";

const LIST_PATTERNS: Array<{ kind: ListKind; re: RegExp }> = [
  { kind: "bullet", re: /^[-•]\s+(.*)$/ },
  { kind: "numbered", re: /^\d+\.\s+(.*)$/ },
  { kind: "alpha", re: /^[a-zA-Z]\.\s+(.*)$/ },
];

function matchList(line: string): { kind: ListKind; content: string } | null {
  for (const { kind, re } of LIST_PATTERNS) {
    const m = line.match(re);
    if (m) return { kind, content: m[1] };
  }
  return null;
}

function openTag(kind: ListKind): string {
  if (kind === "bullet") return "<ul>";
  if (kind === "alpha") return '<ol style="list-style-type:lower-alpha">';
  return "<ol>";
}
function closeTag(kind: ListKind): string {
  return kind === "bullet" ? "</ul>" : "</ol>";
}

function blockToHtml(block: string): string {
  const lines = block.split("\n");
  const chunks: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const first = matchList(lines[i]);
    if (first) {
      const items: string[] = [];
      while (i < lines.length) {
        const m = matchList(lines[i]);
        if (!m || m.kind !== first.kind) break;
        items.push(`<li>${formatInline(m.content)}</li>`);
        i++;
      }
      chunks.push(`${openTag(first.kind)}${items.join("")}${closeTag(first.kind)}`);
    } else {
      const textLines: string[] = [];
      while (i < lines.length && !matchList(lines[i])) {
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
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^[a-zA-Z]\.\s+/gm, "")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/__([^_]+?)__/g, "$1")
    .replace(/\*([^*]+?)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
