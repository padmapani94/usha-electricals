"use client";
import { useEffect, useState } from "react";
import { databases, appwriteConfig, Query } from "@/lib/appwrite";
import type { CartItem, Order } from "@/lib/types";
import { Inbox, MessageCircle, Mail, Trash2, Phone } from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.ordersCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(200)],
      );
      setEnquiries(res.documents as unknown as Order[]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this enquiry from the log?")) return;
    try {
      await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.ordersCollectionId, id);
      await load();
    } catch (e: any) { alert(e?.message ?? "Delete failed"); }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2"><Inbox size={22} /> Enquiries ({enquiries.length})</h1>
          <p className="text-slate-500 text-sm">Read-only log of every WhatsApp / Email enquiry sent from the site.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : enquiries.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <Inbox className="mx-auto text-slate-300" size={40} />
          <p className="mt-3">No enquiries received yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((o) => {
            let items: CartItem[] = []; let addr: { fullName?: string; phone?: string; notes?: string } | null = null;
            try { items = JSON.parse(o.items); } catch {}
            try { addr = JSON.parse(o.shippingAddress); } catch {}
            const via = (o.paymentMethod ?? "whatsapp") as "whatsapp" | "email";
            return (
              <div key={o.$id} className="card p-5">
                <div className="flex flex-wrap justify-between gap-3 pb-3 border-b">
                  <div>
                    <div className="text-xs text-slate-500">
                      {o.$createdAt && new Date(o.$createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      {" · "}
                      <span className={`inline-flex items-center gap-1 ${via === "whatsapp" ? "text-green-600" : "text-blue-600"} font-semibold`}>
                        {via === "whatsapp" ? <MessageCircle size={11} /> : <Mail size={11} />}
                        {via}
                      </span>
                    </div>
                    {addr?.fullName && (
                      <div className="text-sm mt-1">
                        <span className="font-semibold text-navy">{addr.fullName}</span>
                        {addr.phone && (
                          <a href={`tel:${addr.phone}`} className="ml-3 text-brand-orange hover:underline inline-flex items-center gap-1">
                            <Phone size={11} /> {addr.phone}
                          </a>
                        )}
                      </div>
                    )}
                    {addr?.notes && <div className="text-xs text-slate-500 mt-1 italic">"{addr.notes}"</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-orange text-lg">₹{o.total.toLocaleString("en-IN")}</div>
                    <button
                      onClick={() => remove(o.$id)}
                      className="text-xs text-slate-400 hover:text-red-500 mt-1 inline-flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
                <div className="text-sm pt-3">
                  <div className="font-semibold text-navy mb-1">Products enquired about</div>
                  {items.map((i) => (
                    <div key={i.productId} className="flex justify-between text-xs py-0.5">
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
