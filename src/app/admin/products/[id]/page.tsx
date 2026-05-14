"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getProductById } from "@/lib/admin-products";
import type { Product } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null | "loading">("loading");

  useEffect(() => {
    if (!params?.id) return;
    getProductById(params.id).then(setProduct);
  }, [params?.id]);

  if (product === "loading") return <div className="text-slate-500">Loading…</div>;
  if (!product) return <div className="text-slate-500">Product not found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Edit Product</h1>
      <p className="text-slate-500 mb-6">Update details for <span className="font-semibold">{product.name}</span>.</p>
      <ProductForm initial={product} />
    </div>
  );
}
