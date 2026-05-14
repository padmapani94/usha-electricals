"use client";
import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useToasts } from "@/store/toasts";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const toast = useToasts((s) => s.push);
  const router = useRouter();

  const handleAdd = (gotoCart: boolean) => {
    add({
      productId: product.$id ?? product.slug,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0],
      quantity: qty,
    });
    if (gotoCart) router.push("/cart");
    else toast({ message: `Added ${qty} × "${product.name}" to cart` });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center border border-slate-300 rounded-md">
        <button className="p-2 hover:bg-slate-50" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="decrease">
          <Minus size={14} />
        </button>
        <span className="w-10 text-center text-sm font-semibold">{qty}</span>
        <button className="p-2 hover:bg-slate-50" onClick={() => setQty(qty + 1)} aria-label="increase">
          <Plus size={14} />
        </button>
      </div>
      <button className="btn-primary" disabled={product.stock <= 0} onClick={() => handleAdd(false)}>
        <ShoppingCart size={16} className="mr-1" /> Add to Cart
      </button>
      <button className="btn-secondary" disabled={product.stock <= 0} onClick={() => handleAdd(true)}>
        Buy Now
      </button>
    </div>
  );
}
