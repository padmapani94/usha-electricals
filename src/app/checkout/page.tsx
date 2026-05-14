"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { getCurrentUser } from "@/lib/auth";
import { createOrder } from "@/lib/orders";
import type { ShippingAddress } from "@/lib/types";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<"cod" | "bank-transfer">("cod");

  const [addr, setAddr] = useState<ShippingAddress>({
    fullName: "", phone: "", email: "",
    line1: "", line2: "", city: "", state: "Maharashtra", pincode: "", notes: "",
  });

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) router.replace("/login?next=/checkout");
      else { setUser(u); setAddr((a) => ({ ...a, fullName: u.name ?? "", email: u.email ?? "" })); }
    });
  }, [router]);

  if (items.length === 0 && !submitting) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Your cart is empty</h1>
        <Link href="/products" className="btn-primary mt-4 inline-flex">Browse products</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) { router.push("/login?next=/checkout"); return; }
    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.$id,
        items,
        total,
        shippingAddress: addr,
        paymentMethod: payment,
      });
      clear();
      router.replace(`/account/orders?placed=${order.$id ?? "ok"}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to place order. Please try again or call us at 93569 13565.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-navy mb-5 md:mb-6">Checkout</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <div className="space-y-6">
          <section className="card p-6">
            <h3 className="font-semibold text-navy mb-4">Shipping Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" required value={addr.fullName} onChange={(v) => setAddr({ ...addr, fullName: v })} />
              <Field label="Phone" required value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v })} />
              <Field label="Email" required value={addr.email} onChange={(v) => setAddr({ ...addr, email: v })} type="email" />
              <Field label="Pincode" required value={addr.pincode} onChange={(v) => setAddr({ ...addr, pincode: v })} />
              <div className="md:col-span-2">
                <Field label="Address Line 1" required value={addr.line1} onChange={(v) => setAddr({ ...addr, line1: v })} />
              </div>
              <div className="md:col-span-2">
                <Field label="Address Line 2 (optional)" value={addr.line2 ?? ""} onChange={(v) => setAddr({ ...addr, line2: v })} />
              </div>
              <Field label="City" required value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
              <Field label="State" required value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} />
              <div className="md:col-span-2">
                <label className="label">Order Notes (optional)</label>
                <textarea className="input" rows={3} value={addr.notes ?? ""} onChange={(e) => setAddr({ ...addr, notes: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h3 className="font-semibold text-navy mb-4">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                <div>
                  <div className="font-semibold text-navy">Cash / Pay on Delivery</div>
                  <div className="text-xs text-slate-500">Pay at the time of delivery or installation.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                <input type="radio" checked={payment === "bank-transfer"} onChange={() => setPayment("bank-transfer")} />
                <div>
                  <div className="font-semibold text-navy">Bank Transfer / UPI</div>
                  <div className="text-xs text-slate-500">We'll share account details on order confirmation.</div>
                </div>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-3">Online payment gateway coming soon.</p>
          </section>
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-24 order-first lg:order-last">
          <h3 className="font-semibold text-navy mb-4">Your Order</h3>
          <div className="space-y-3 text-sm max-h-64 overflow-auto">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between gap-2">
                <span className="text-slate-700 line-clamp-2">{i.name} × {i.quantity}</span>
                <span className="font-semibold shrink-0">₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-slate-500"><span>Shipping</span><span>To be advised</span></div>
            <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span className="text-navy">₹{total.toLocaleString("en-IN")}</span></div>
          </div>
          {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-4">
            {submitting ? "Placing order…" : "Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-brand-orange">*</span>}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="input" />
    </div>
  );
}
