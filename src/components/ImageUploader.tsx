"use client";
import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload, X, ImagePlus, Loader2, Link as LinkIcon } from "lucide-react";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export default function ImageUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);

  const configured = !!(CLOUD && PRESET);

  const uploadOne = async (file: File): Promise<string | null> => {
    if (file.size > MAX_BYTES) {
      setError(`"${file.name}" is larger than 5 MB.`);
      return null;
    }
    if (!file.type.startsWith("image/")) {
      setError(`"${file.name}" is not an image.`);
      return null;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", PRESET!);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setError(`Upload failed: ${res.status} ${txt.slice(0, 120)}`);
      return null;
    }
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!configured) {
      setError("Cloudinary not configured. Paste an image URL instead.");
      return;
    }
    setError("");
    const list = Array.from(files);
    setUploading((u) => u + list.length);
    const uploaded: string[] = [];
    for (const f of list) {
      const url = await uploadOne(f);
      if (url) uploaded.push(url);
      setUploading((u) => Math.max(0, u - 1));
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };

  const addUrl = () => {
    const u = pasteUrl.trim();
    if (!u) return;
    if (value.includes(u)) { setPasteUrl(""); return; }
    onChange([...value, u]);
    setPasteUrl("");
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          dragOver
            ? "border-brand-orange bg-orange-50"
            : "border-slate-300 hover:border-brand-orange hover:bg-orange-50/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          className="hidden"
          onChange={onPick}
        />
        {uploading > 0 ? (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <Loader2 className="animate-spin text-brand-orange" size={28} />
            <span className="text-sm font-medium">Uploading {uploading} image{uploading > 1 && "s"}…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <div className="bg-brand-orange/10 text-brand-orange rounded-full p-3"><Upload size={20} /></div>
            <div className="text-sm">
              <span className="font-semibold text-navy">Click to upload</span> or drag images here
            </div>
            <div className="text-xs text-slate-400">JPG, PNG, WEBP · up to 5 MB each · multiple allowed</div>
          </div>
        )}
      </div>

      {!configured && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          Cloudinary credentials missing — set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code>. Drag-drop uploads are disabled; you can still paste URLs below.
        </div>
      )}
      {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded border border-slate-200 overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-brand-orange text-white text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Main</span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); remove(url); }}
                    className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
                    title="Remove"
                  ><X size={14} /></button>
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); move(i, -1); }}
                      className="bg-white text-navy text-xs px-2 py-0.5 rounded hover:bg-slate-100"
                      title="Move left"
                    >←</button>
                  )}
                  {i < value.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); move(i, 1); }}
                      className="bg-white text-navy text-xs px-2 py-0.5 rounded hover:bg-slate-100"
                      title="Move right"
                    >→</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-slate-200 pt-3">
        {!showUrl ? (
          <button type="button" onClick={() => setShowUrl(true)} className="text-xs text-slate-500 hover:text-brand-orange inline-flex items-center gap-1">
            <LinkIcon size={12} /> Or paste an image URL
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="url"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input text-sm flex-1"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            />
            <button type="button" onClick={addUrl} className="btn-outline text-xs"><ImagePlus size={14} className="mr-1" /> Add</button>
          </div>
        )}
      </div>
    </div>
  );
}
