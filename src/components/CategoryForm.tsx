"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/lib/admin-categories";
import type { Category } from "@/lib/types";

export default function CategoryForm({ initial }: { initial?: Category }) {
  const router = useRouter();
  const [form, setForm] = useState<Category>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    image: initial?.image ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      if (initial?.$id) await updateCategory(initial.$id, form);
      else await createCategory(form);
      router.push("/admin/categories");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Save failed"); setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-2xl">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="label">Name *</label>
          <input className="input" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} />
        </div>
        <div>
          <label className="label">Slug *</label>
          <input className="input" required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <label className="label">Image URL (optional)</label>
        <input className="input" value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
      </div>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <div className="flex gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Create category"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
