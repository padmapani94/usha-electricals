"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { listProductsClient } from "@/lib/products-admin";
import { deleteProduct, updateProduct } from "@/lib/admin-products";
import { useToasts } from "@/store/toasts";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState("");
  const toast = useToasts((s) => s.push);

  const load = async () => {
    setLoading(true);
    const list = await listProductsClient({ limit: 500, includeUnpublished: true });
    setAllProducts(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const brands = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.brand?.trim()).filter(Boolean) as string[])).sort(),
    [allProducts],
  );
  const products = useMemo(
    () => (brandFilter ? allProducts.filter((p) => p.brand === brandFilter) : allProducts),
    [allProducts, brandFilter],
  );

  const remove = async (p: Product) => {
    if (!p.$id) { alert("Cannot delete a seed product. Run the seed script first."); return; }
    if (!confirm(`Delete "${p.name}"? This is permanent.`)) return;
    try { await deleteProduct(p.$id); await load(); toast({ message: `Deleted "${p.name}"`, kind: "success" }); }
    catch (e: any) { alert(e?.message ?? "Delete failed"); }
  };

  const togglePublished = async (p: Product) => {
    if (!p.$id) { alert("Cannot toggle a seed product. Run the seed script first."); return; }
    const next = p.published === false;
    try {
      await updateProduct(p.$id, { published: next });
      await load();
      toast({ message: `${next ? "Listed" : "Unlisted"} "${p.name}"`, kind: "info" });
    } catch (e: any) { alert(e?.message ?? "Update failed"); }
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-3 mb-5 md:mb-6 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-navy">
          Products ({products.length}{brandFilter ? ` of ${allProducts.length}` : ""})
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {brands.length > 0 && (
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="input w-auto text-sm py-1.5"
            >
              <option value="">All brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          <Link href="/admin/products/new" className="btn-primary text-sm"><Plus size={16} className="mr-1" /> Add Product</Link>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">Stock</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.$id ?? p.slug} className={`border-t hover:bg-slate-50 ${p.published === false ? "opacity-60" : ""}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-semibold text-navy">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{p.category}</td>
                    <td className="p-3 text-right font-semibold">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right">{p.stock}</td>
                    <td className="p-3 text-center">
                      {p.published === false ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-200 text-slate-700 font-semibold"><EyeOff size={12} /> Unlisted</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-semibold"><Eye size={12} /> Live</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {p.$id ? (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => togglePublished(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title={p.published === false ? "List on website" : "Unlist from website"}>
                            {p.published === false ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <Link href={`/admin/products/${p.$id}`} className="p-2 text-navy hover:bg-slate-100 rounded" title="Edit"><Pencil size={14} /></Link>
                          <button onClick={() => remove(p)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">seed only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <div key={p.$id ?? p.slug} className={`card p-3 ${p.published === false ? "opacity-60" : ""}`}>
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy text-sm leading-tight line-clamp-2">{p.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{p.brand} · {p.category}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                      <span className="font-bold text-navy">₹{p.price.toLocaleString("en-IN")}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">Stock: {p.stock}</span>
                      {p.published === false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold"><EyeOff size={10} /> Unlisted</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold"><Eye size={10} /> Live</span>
                      )}
                    </div>
                  </div>
                </div>
                {p.$id ? (
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Link href={`/admin/products/${p.$id}`} className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold bg-navy text-white rounded py-2"><Pencil size={12} /> Edit</Link>
                    <button onClick={() => togglePublished(p)} className="px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded text-xs inline-flex items-center gap-1">
                      {p.published === false ? <><Eye size={12} /> List</> : <><EyeOff size={12} /> Unlist</>}
                    </button>
                    <button onClick={() => remove(p)} className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded text-xs inline-flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t text-[11px] text-slate-400 text-center">seed only — non-editable</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
