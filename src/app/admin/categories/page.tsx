"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, FolderTree } from "lucide-react";
import { listCategories, deleteCategory } from "@/lib/admin-categories";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setCategories(await listCategories());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (c: Category) => {
    if (!c.$id) { alert("Cannot delete a seed category. Push categories to Appwrite first via the seed script."); return; }
    if (!confirm(`Delete category "${c.name}"? Products in this category will not be deleted but will lose their category link.`)) return;
    try { await deleteCategory(c.$id); await load(); }
    catch (e: any) { alert(e?.message ?? "Delete failed"); }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-5 md:mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy flex items-center gap-2"><FolderTree size={20} /> Categories ({categories.length})</h1>
          <p className="text-slate-500 text-sm mt-0.5">Organise products into browsable groups on the storefront.</p>
        </div>
        <Link href="/admin/categories/new" className="btn-primary text-sm"><Plus size={16} className="mr-1" /> Add Category</Link>
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
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Slug</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.$id ?? c.slug} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-semibold text-navy">{c.name}</td>
                    <td className="p-3 text-slate-500 font-mono text-xs">{c.slug}</td>
                    <td className="p-3 text-slate-600 max-w-md truncate">{c.description}</td>
                    <td className="p-3 text-right">
                      {c.$id ? (
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/categories/${c.$id}`} className="p-2 text-navy hover:bg-slate-100 rounded"><Pencil size={14} /></Link>
                          <button onClick={() => remove(c)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
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
            {categories.map((c) => (
              <div key={c.$id ?? c.slug} className="card p-4">
                <div className="font-semibold text-navy">{c.name}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.slug}</div>
                {c.description && <p className="text-xs text-slate-600 mt-2">{c.description}</p>}
                {c.$id ? (
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Link href={`/admin/categories/${c.$id}`} className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold bg-navy text-white rounded py-2"><Pencil size={12} /> Edit</Link>
                    <button onClick={() => remove(c)} className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded text-xs inline-flex items-center gap-1"><Trash2 size={12} /> Delete</button>
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
