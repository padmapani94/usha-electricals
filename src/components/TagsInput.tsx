"use client";
import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

export default function TagsInput({
  value,
  onChange,
  placeholder = "Type a keyword and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const cleaned = raw.trim().replace(/^#/, "").toLowerCase();
    if (!cleaned) return;
    if (value.includes(cleaned)) { setDraft(""); return; }
    onChange([...value, cleaned]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  return (
    <div className="input flex flex-wrap items-center gap-2 min-h-[42px] p-2">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold px-2 py-1 rounded">
          {t}
          <button type="button" onClick={() => remove(t)} className="hover:text-red-500" aria-label={`Remove ${t}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[140px] outline-none bg-transparent text-sm"
      />
    </div>
  );
}
