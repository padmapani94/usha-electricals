"use client";
import Link from "next/link";
import { Eye, MessageCircle, ShoppingCart, Ruler } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useToasts } from "@/store/toasts";
import { buildEnquiryMessage, whatsappLink } from "@/lib/enquiry";
import { parseVariants } from "@/lib/variants";

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const toast = useToasts((s) => s.push);
  const hasVariants = parseVariants(product).length > 0;
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAdd = () => {
    add({
      productId: product.$id ?? product.slug,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0],
      quantity: 1,
    });
    toast({ message: `Added "${product.name}" to cart` });
  };

  const handleQuickWhatsApp = () => {
    const item = {
      productId: product.$id ?? product.slug,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0],
      quantity: 1,
    };
    const message = buildEnquiryMessage([item], product.price);
    window.open(whatsappLink(message), "_blank");
  };

  return (
    <div className="card overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block aspect-square bg-slate-100 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images?.[0] ?? "/placeholder.png"}
          alt={product.imageAlt?.trim() || product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-brand-orange text-white text-xs px-2 py-1 rounded font-semibold shadow-sm">{discount}% OFF</span>
        )}
        {product.featured && (
          <span className="absolute top-2 right-2 bg-navy text-white text-[10px] px-2 py-1 rounded font-semibold tracking-wider">FEATURED</span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 bg-black/50 text-white text-sm flex items-center justify-center font-semibold">Out of Stock</span>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 to-transparent p-3 flex justify-end">
          <span className="bg-white/95 text-navy text-xs font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1">
            <Eye size={12} /> View details
          </span>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        {product.brand && <div className="text-xs text-slate-500 uppercase tracking-wide">{product.brand}</div>}
        <Link href={`/products/${product.slug}`} className="font-semibold text-navy mt-1 hover:text-brand-orange line-clamp-2">
          {product.name}
        </Link>
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              {hasVariants && <span className="text-[10px] text-slate-400 uppercase tracking-wide block">From</span>}
              <span className="text-lg font-bold text-navy">₹{product.price.toLocaleString("en-IN")}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-xs text-slate-400 line-through ml-2">₹{product.mrp.toLocaleString("en-IN")}</span>
              )}
            </div>
            {!hasVariants && (
              <button
                disabled={product.stock <= 0}
                className="btn-primary text-xs disabled:opacity-40 group/btn"
                onClick={handleAdd}
              >
                <ShoppingCart size={14} className="mr-1 group-hover/btn:rotate-[-8deg] transition" /> Add
              </button>
            )}
          </div>
          {hasVariants ? (
            <Link
              href={`/products/${product.slug}`}
              className="w-full inline-flex items-center justify-center gap-1.5 btn-outline text-xs font-semibold rounded px-2 py-1.5 transition"
            >
              <Ruler size={12} /> Select Size &amp; View Options
            </Link>
          ) : (
            <button
              disabled={product.stock <= 0}
              onClick={handleQuickWhatsApp}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5b] disabled:opacity-40 text-white text-xs font-semibold rounded px-2 py-1.5 transition"
            >
              <MessageCircle size={12} /> Quick Enquiry on WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
