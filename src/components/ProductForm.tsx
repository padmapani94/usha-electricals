"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categories as seedCategories } from "@/lib/seed-data";
import { createProduct, updateProduct } from "@/lib/admin-products";
import { listCategories } from "@/lib/admin-categories";
import { listProductsClient } from "@/lib/products-admin";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import type { Category, Product } from "@/lib/types";
import { ShieldCheck, PencilRuler, Hash } from "lucide-react";
import TagsInput from "@/components/TagsInput";
import ImageUploader from "@/components/ImageUploader";

export default function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    getCurrentUser().then((u) => setAdmin(isAdmin(u)));
    listCategories().then(setCategories);
    listProductsClient({ limit: 500, includeUnpublished: true }).then((list) => {
      const unique = Array.from(new Set(list.map((p) => p.brand?.trim()).filter(Boolean))) as string[];
      setBrands(unique.sort());
    });
  }, []);

  const [form, setForm] = useState<Product>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? seedCategories[0].slug,
    brand: initial?.brand ?? "",
    price: initial?.price ?? 0,
    mrp: initial?.mrp ?? undefined,
    stock: initial?.stock ?? 0,
    images: initial?.images ?? [],
    specs: typeof initial?.specs === "string" ? initial.specs : initial?.specs ? JSON.stringify(initial.specs, null, 2) : "{}",
    featured: initial?.featured ?? false,
    published: initial?.published !== false,
    tags: initial?.tags ?? [],
  } as Product);

  const [images, setImages] = useState<string[]>(initial?.images ?? []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      if (images.length === 0) throw new Error("Please add at least one product image.");
      let specsObj: Record<string, string> = {};
      try { specsObj = JSON.parse(typeof form.specs === "string" ? form.specs : "{}"); } catch { throw new Error("Specs must be valid JSON"); }
      const payload = { ...form, images, specs: specsObj };
      if (initial?.$id) await updateProduct(initial.$id, payload);
      else await createProduct(payload);
      router.push("/admin/products");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Save failed"); setBusy(false);
    }
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const adminOnly = admin === true;
  const editorMode = admin === false;

  return (
    <form onSubmit={submit} className="space-y-5 max-w-3xl">
      {editorMode && (
        <div className="card p-3 bg-blue-50 border-blue-200 text-blue-800 text-xs flex items-center gap-2">
          <PencilRuler size={14} /> You are signed in as an <strong>editor</strong>. You have full product-listing rights. Only the technical specs JSON and the homepage-feature toggle are admin-only.
        </div>
      )}
      {adminOnly && (
        <div className="card p-3 bg-orange-50 border-brand-orange/30 text-brand-orange text-xs flex items-center gap-2">
          <ShieldCheck size={14} /> Admin mode — full edit access.
        </div>
      )}

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
        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Brand</label>
          <input
            className="input"
            list="brand-options"
            value={form.brand ?? ""}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="Select existing or type a new brand"
            autoComplete="off"
          />
          <datalist id="brand-options">
            {brands.map((b) => <option key={b} value={b} />)}
          </datalist>
        </div>
        <div>
          <label className="label">Price (₹) *</label>
          <input className="input" type="number" min={0} required value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label">MRP (₹)</label>
          <input className="input" type="number" min={0} value={form.mrp ?? ""}
            onChange={(e) => setForm({ ...form, mrp: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="label">Stock *</label>
          <input className="input" type="number" min={0} required value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        </div>
      </div>

      {/* Toggles — separate row so they don't share a grid column */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} disabled={editorMode} />
          Feature on homepage
          {editorMode && <span className="text-[10px] text-slate-400">(admin only)</span>}
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.published !== false} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
          Published (visible on site)
        </label>
      </div>

      <div>
        <label className="label">Description *</label>
        <textarea className="input" rows={4} required value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div>
        <label className="label">Product Images *</label>
        <ImageUploader value={images} onChange={setImages} />
        <p className="text-xs text-slate-500 mt-1">First image is shown as the main thumbnail. Drag to reorder using the arrows on hover.</p>
      </div>

      <div>
        <label className="label flex items-center gap-1"><Hash size={14} /> SEO Keyword Tags</label>
        <TagsInput
          value={form.tags ?? []}
          onChange={(tags) => setForm({ ...form, tags })}
          placeholder="e.g. ups, online-ups, schneider, server backup — press Enter"
        />
        <p className="text-xs text-slate-500 mt-1">
          These keywords boost on-site search and are emitted as <code>&lt;meta name="keywords"&gt;</code> on the product page. Press <kbd className="px-1 bg-slate-100 rounded text-[10px]">Enter</kbd> or <kbd className="px-1 bg-slate-100 rounded text-[10px]">,</kbd> after each tag.
        </p>
      </div>

      <div>
        <label className="label">Specs (JSON object)</label>
        <textarea className="input font-mono text-xs disabled:bg-slate-100" rows={6} disabled={editorMode}
          value={typeof form.specs === "string" ? form.specs : JSON.stringify(form.specs, null, 2)}
          onChange={(e) => setForm({ ...form, specs: e.target.value })} />
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="flex gap-3">
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Create product"}</button>
        <button type="button" className="btn-outline" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
