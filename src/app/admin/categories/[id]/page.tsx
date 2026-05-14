"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CategoryForm from "@/components/CategoryForm";
import { getCategoryById } from "@/lib/admin-categories";
import type { Category } from "@/lib/types";

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const [cat, setCat] = useState<Category | null | "loading">("loading");

  useEffect(() => {
    if (!params?.id) return;
    getCategoryById(params.id).then(setCat);
  }, [params?.id]);

  if (cat === "loading") return <div className="text-slate-500">Loading…</div>;
  if (!cat) return <div className="text-slate-500">Category not found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Edit Category</h1>
      <p className="text-slate-500 mb-6">Update <span className="font-semibold">{cat.name}</span>.</p>
      <CategoryForm initial={cat} />
    </div>
  );
}
