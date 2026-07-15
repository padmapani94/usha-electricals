"use client";
import { useRef } from "react";
import { Bold, Italic, Underline, Pilcrow, List, ListOrdered } from "lucide-react";
import { richTextToHtml } from "@/lib/richtext";

const toolbarBtn = "p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-navy transition";

export default function RichTextEditor({
  value,
  onChange,
  rows = 6,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (marker: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const selected = value.slice(selectionStart, selectionEnd);
    const next = `${value.slice(0, selectionStart)}${marker}${selected}${marker}${value.slice(selectionEnd)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + marker.length, selectionStart + marker.length + selected.length);
    });
  };

  const newParagraph = () => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart } = el;
    const next = `${value.slice(0, selectionStart)}\n\n${value.slice(selectionStart)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + 2, selectionStart + 2);
    });
  };

  // Shared by all three list buttons: prefixes each non-blank selected line with
  // makePrefix(n), where n only advances for lines that actually get a prefix (so
  // blank lines in the middle of a selection don't throw off the numbering).
  const applyListPrefix = (makePrefix: (n: number) => string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const selected = value.slice(selectionStart, selectionEnd);
    const strip = (line: string) => line.replace(/^([-•]|\d+\.|[a-zA-Z]\.)\s+/, "");
    let n = 0;
    const insertText = selected
      ? selected.split("\n").map((line) => (line.trim() ? `${makePrefix(n++)}${strip(line)}` : line)).join("\n")
      : makePrefix(0);
    const next = `${value.slice(0, selectionStart)}${insertText}${value.slice(selectionEnd)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = selectionStart + insertText.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const addBullets = () => applyListPrefix(() => "- ");
  const addNumbered = () => applyListPrefix((n) => `${n + 1}. `);
  const addAlpha = () => applyListPrefix((n) => `${String.fromCharCode(97 + (n % 26))}. `);

  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <button type="button" onClick={() => wrap("**")} className={toolbarBtn} title="Bold"><Bold size={14} /></button>
        <button type="button" onClick={() => wrap("*")} className={toolbarBtn} title="Italic"><Italic size={14} /></button>
        <button type="button" onClick={() => wrap("__")} className={toolbarBtn} title="Underline"><Underline size={14} /></button>
        <button type="button" onClick={addBullets} className={toolbarBtn} title="Bullet list"><List size={14} /></button>
        <button type="button" onClick={addNumbered} className={toolbarBtn} title="Numbered list (1, 2, 3…)"><ListOrdered size={14} /></button>
        <button type="button" onClick={addAlpha} className={`${toolbarBtn} w-[26px] flex items-center justify-center`} title="Alphabetical list (a, b, c…)">
          <span className="text-[10px] font-bold leading-none">a-z</span>
        </button>
        <button type="button" onClick={newParagraph} className={toolbarBtn} title="New paragraph"><Pilcrow size={14} /></button>
      </div>
      <textarea
        ref={ref}
        className="input"
        rows={rows}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-slate-500 mt-1">
        Select text and click <strong>B</strong> / <em>I</em> / <u>U</u> to format, or a list button to turn selected lines into a bulleted, numbered, or a-b-c list. Press the ¶ button (or Enter twice) to start a new paragraph.
      </p>
      {value.trim() && (
        <div className="mt-2 border border-slate-200 rounded-md p-3 bg-slate-50">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">Preview</div>
          <div
            className="text-sm text-slate-700 leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5"
            dangerouslySetInnerHTML={{ __html: richTextToHtml(value) }}
          />
        </div>
      )}
    </div>
  );
}
