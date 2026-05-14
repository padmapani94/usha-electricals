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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2"><FolderTree size={22} /> Categories ({categories.length})</h1>
          <p className="text-slate-500 text-sm">Organise products into browsable groups on the storefront.</p>
        </div>
        <Link href="/admin/categories/new" className="btn-primary"><Plus size={16} className="mr-1" /> Add Category</Link>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : (
        <div className="card overflow-x-auto">
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
      )}
    </div>
  );
}
