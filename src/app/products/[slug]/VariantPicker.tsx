"use client";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { parseVariants } from "@/lib/variants";
import AddToCartButton from "./AddToCartButton";

export default function VariantPicker({ product }: { product: Product }) {
  const variants = useMemo(() => parseVariants(product), [product]);
  const firstInStock = variants.findIndex((v) => v.stock > 0);
  const [selected, setSelected] = useState(firstInStock >= 0 ? firstInStock : 0);

  if (variants.length === 0) {
    return (
      <>
        <PriceBlock price={product.price} mrp={product.mrp} stock={product.stock} />
        <div className="mt-6">
          <AddToCartButton product={product} />
        </div>
      </>
    );
  }

  const v = variants[selected];
  const effectiveProduct: Product = {
    ...product,
    $id: `${product.$id ?? product.slug}::${v.size}`,
    name: `${product.name} — ${v.size}`,
    price: v.price,
    mrp: v.mrp,
    stock: v.stock,
  };

  return (
    <>
      <div className="mt-4">
        <div className="text-sm font-semibold text-navy mb-2">
          Size: <span className="font-normal text-slate-600">{v.size}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {variants.map((opt, i) => (
            <button
              key={`${opt.size}-${i}`}
              type="button"
              onClick={() => setSelected(i)}
              disabled={opt.stock <= 0}
              className={`px-3 py-2 rounded-md border text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed text-left ${
                i === selected
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-slate-300 text-slate-700 hover:border-navy"
              }`}
            >
              <span className="block">{opt.size}</span>
              {opt.stock <= 0 && <span className="block text-[10px] text-red-500">Out of stock</span>}
            </button>
          ))}
        </div>
      </div>

      <PriceBlock price={v.price} mrp={v.mrp} stock={v.stock} />

      <div className="mt-6">
        <AddToCartButton product={effectiveProduct} />
      </div>
    </>
  );
}

function PriceBlock({ price, mrp, stock }: { price: number; mrp?: number; stock: number }) {
  return (
    <>
      <div className="flex items-baseline gap-3 mt-4">
        <span className="text-3xl font-bold text-navy">₹{price.toLocaleString("en-IN")}</span>
        {mrp && mrp > price && (
          <span className="text-slate-400 line-through">₹{mrp.toLocaleString("en-IN")}</span>
        )}
      </div>
      <div className="text-xs text-slate-500 mt-1">Exclusive of GST · GST invoice provided on request</div>
      <div className="mt-5 flex items-center gap-2 text-sm">
        {stock > 0 ? (
          <span className="text-green-600 font-semibold">● In Stock ({stock})</span>
        ) : (
          <span className="text-red-500 font-semibold">● Out of Stock</span>
        )}
      </div>
    </>
  );
}
