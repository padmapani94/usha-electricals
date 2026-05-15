"use client";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={56} className="mx-auto text-slate-300" />
        <h1 className="text-2xl font-bold text-navy mt-4">Your cart is empty</h1>
        <p className="text-slate-500 mt-1">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 pb-28 lg:pb-10">
      <h1 className="text-2xl md:text-3xl font-bold text-navy mb-5 md:mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.productId} className="card p-4 flex gap-4">
              <div className="w-24 h-24 bg-slate-100 rounded shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${it.slug}`} className="font-semibold text-navy hover:text-brand-orange line-clamp-2">{it.name}</Link>
                <div className="text-sm text-slate-500 mt-1">₹{it.price.toLocaleString("en-IN")} each</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-md">
                    <button className="p-1.5 hover:bg-slate-50" onClick={() => setQty(it.productId, it.quantity - 1)}><Minus size={12} /></button>
                    <span className="w-9 text-center text-sm font-semibold">{it.quantity}</span>
                    <button className="p-1.5 hover:bg-slate-50" onClick={() => setQty(it.productId, it.quantity + 1)}><Plus size={12} /></button>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 p-1.5" onClick={() => remove(it.productId)} aria-label="remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-navy">₹{(it.price * it.quantity).toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit lg:sticky lg:top-24 hidden lg:block">
          <h3 className="font-semibold text-navy mb-4">Cart Summary</h3>
          <div className="flex justify-between text-sm py-2 border-b">
            <span>Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b">
            <span>Shipping</span><span className="text-slate-500">Confirmed via enquiry</span>
          </div>
          <div className="flex justify-between font-bold text-lg py-3">
            <span>Estimated Total</span><span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <button className="btn-primary w-full" onClick={() => router.push("/checkout")}>Send Enquiry →</button>
          <p className="text-xs text-slate-500 text-center mt-2">No online payment. Quote &amp; payment via WhatsApp/Email.</p>
          <Link href="/products" className="block text-center text-sm text-brand-orange mt-3 hover:underline">Continue shopping</Link>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase text-slate-500">Total</div>
          <div className="font-bold text-navy text-lg leading-tight">₹{total.toLocaleString("en-IN")}</div>
        </div>
        <button className="btn-primary flex-1 max-w-[240px]" onClick={() => router.push("/checkout")}>
          Send Enquiry →
        </button>
      </div>
    </div>
  );
}
