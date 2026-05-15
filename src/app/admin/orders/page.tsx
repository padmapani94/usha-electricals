"use client";
import { useEffect, useState } from "react";
import { listAllOrders, updateOrderStatus } from "@/lib/orders";
import type { CartItem, Order, ShippingAddress } from "@/lib/types";

const STATUSES: Order["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  const load = async () => {
    setLoading(true);
    try { setOrders(await listAllOrders()); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const change = async (id: string, status: Order["status"]) => {
    try { await updateOrderStatus(id, status); await load(); }
    catch (e: any) { alert(e?.message ?? "Update failed"); }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-navy">Enquiries ({orders.length})</h1>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">No enquiries.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            let items: CartItem[] = []; let addr: ShippingAddress | null = null;
            try { items = JSON.parse(o.items); } catch {}
            try { addr = JSON.parse(o.shippingAddress); } catch {}
            return (
              <div key={o.$id} className="card p-5">
                <div className="flex flex-wrap justify-between gap-3 pb-3 border-b">
                  <div>
                    <div className="text-xs text-slate-500">Order ID · {o.$createdAt && new Date(o.$createdAt).toLocaleString("en-IN")}</div>
                    <div className="font-mono text-xs">{o.$id}</div>
                    {addr && <div className="text-sm mt-1"><span className="font-semibold">{addr.fullName}</span> · {addr.phone} · {addr.email}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-orange text-lg">₹{o.total.toLocaleString("en-IN")}</div>
                    <select
                      className="input mt-1 w-auto text-xs"
                      value={o.status}
                      onChange={(e) => o.$id && change(o.$id, e.target.value as Order["status"])}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="text-sm pt-3 grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-navy mb-1">Items</div>
                    {items.map((i) => (
                      <div key={i.productId} className="flex justify-between text-xs py-0.5">
                        <span>{i.name} × {i.quantity}</span>
                        <span>₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                  {addr && (
                    <div>
                      <div className="font-semibold text-navy mb-1">Shipping</div>
                      <div className="text-xs text-slate-600">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                        {addr.city}, {addr.state} - {addr.pincode}<br />
                        {addr.notes && <span className="text-slate-500 italic">Note: {addr.notes}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
