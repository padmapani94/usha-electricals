"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listMyOrders } from "@/lib/orders";
import type { CartItem, Order, ShippingAddress } from "@/lib/types";

function OrdersInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const placed = sp.get("placed");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u) { router.replace("/login?next=/account/orders"); return; }
      try {
        const list = await listMyOrders(u.$id);
        setOrders(list);
      } catch {}
      setLoading(false);
    })();
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-navy mb-2">My Orders</h1>
      <p className="text-slate-500 mb-6">All your orders &amp; their current status.</p>

      {placed && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-6">
          <strong>Order placed successfully!</strong> Our team will reach out to you on the registered phone within 24 hours.
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-500">You haven't placed any orders yet.</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            let items: CartItem[] = []; let addr: ShippingAddress | null = null;
            try { items = JSON.parse(o.items); } catch {}
            try { addr = JSON.parse(o.shippingAddress); } catch {}
            return (
              <div key={o.$id} className="card p-5">
                <div className="flex flex-wrap justify-between gap-2 pb-3 border-b">
                  <div>
                    <div className="text-xs text-slate-500">Order ID</div>
                    <div className="font-mono text-sm">{o.$id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Date</div>
                    <div className="text-sm">{o.$createdAt ? new Date(o.$createdAt).toLocaleString("en-IN") : "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="font-bold text-brand-orange">₹{o.total.toLocaleString("en-IN")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Status</div>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      o.status === "delivered" ? "bg-green-100 text-green-700" :
                      o.status === "shipped" ? "bg-blue-100 text-blue-700" :
                      o.status === "cancelled" ? "bg-red-100 text-red-700" :
                      o.status === "confirmed" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>{o.status.toUpperCase()}</span>
                  </div>
                </div>
                <div className="pt-3 text-sm space-y-1">
                  {items.map((i) => (
                    <div key={i.productId} className="flex justify-between">
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                {addr && (
                  <div className="text-xs text-slate-500 mt-3 pt-3 border-t">
                    Shipping to: <span className="text-slate-700">{addr.fullName}, {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return <Suspense fallback={null}><OrdersInner /></Suspense>;
}
