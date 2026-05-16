"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useToasts } from "@/store/toasts";
import { buildEnquiryMessage, whatsappLink, mailtoLink } from "@/lib/enquiry";
import { MessageCircle, Mail, Phone, Info } from "lucide-react";

export default function EnquiryPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const toast = useToasts((s) => s.push);
  const [busy, setBusy] = useState<"whatsapp" | "email" | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", notes: "" });

  if (items.length === 0 && !busy) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Your cart is empty</h1>
        <Link href="/products" className="btn-primary mt-4 inline-flex">Browse products</Link>
      </div>
    );
  }

  const logEnquiry = async (method: "whatsapp" | "email") => {
    try {
      await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId, name: i.name, slug: i.slug, price: i.price, quantity: i.quantity, image: i.image,
          })),
          total,
          fullName: form.fullName,
          phone: form.phone,
          notes: form.notes,
          method,
        }),
      });
    } catch {}
  };

  const send = async (method: "whatsapp" | "email") => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast({ message: "Please add your name and phone number", kind: "error" });
      return;
    }
    setBusy(method);
    const message = buildEnquiryMessage(items, total, { fullName: form.fullName, phone: form.phone, notes: form.notes } as any);
    const url = method === "whatsapp" ? whatsappLink(message) : mailtoLink(message);
    await logEnquiry(method);
    window.open(url, "_blank");
    toast({ message: method === "whatsapp" ? "WhatsApp opened with your enquiry" : "Email draft ready", kind: "success" });
    setBusy(null);
    clear();
    router.replace("/?enquiry=" + method);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">Send Enquiry</h1>
      <p className="text-slate-600 text-sm mb-6 max-w-2xl">
        We don't process payments online. Send your enquiry via WhatsApp or Email and our team will get back to you within 24 hours with final pricing, availability and delivery options.
      </p>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <div className="space-y-6">
          <section className="card p-6">
            <h3 className="font-semibold text-navy mb-1">Your details</h3>
            <p className="text-xs text-slate-500 mb-4">Just name and phone. Delivery address and the rest gets sorted on the call.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" required value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
              <Field label="Phone" required type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <div className="md:col-span-2">
                <label className="label">Additional notes (optional)</label>
                <textarea className="input" rows={3} value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. installation needed, specific brand preference, delivery location, bulk quantity, etc." />
              </div>
            </div>
          </section>

          <section className="card p-6 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-blue-900">
                <strong>How this works</strong>
                <ol className="list-decimal list-inside mt-1 space-y-0.5 text-blue-800">
                  <li>Click "Send via WhatsApp" or "Send via Email" below</li>
                  <li>Your cart contents and details are pre-filled in the message</li>
                  <li>Just hit send — we reply within 24 hours with final pricing</li>
                  <li>Pay via UPI, bank transfer or cash on delivery once confirmed</li>
                </ol>
              </div>
            </div>
          </section>
        </div>

        <aside className="card p-6 h-fit lg:sticky lg:top-24 order-first lg:order-last">
          <h3 className="font-semibold text-navy mb-4">Cart Summary</h3>
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
            <div className="flex justify-between font-bold text-base pt-2"><span>Estimated Total</span><span className="text-navy">₹{total.toLocaleString("en-IN")}</span></div>
            <div className="text-xs text-slate-500 pt-1">Final price confirmed via WhatsApp / Email.</div>
          </div>

          <button
            onClick={() => send("whatsapp")}
            disabled={busy !== null}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold rounded-md px-4 py-2.5 transition disabled:opacity-60"
          >
            <MessageCircle size={18} /> {busy === "whatsapp" ? "Opening WhatsApp…" : "Send via WhatsApp"}
          </button>
          <button
            onClick={() => send("email")}
            disabled={busy !== null}
            className="btn-secondary w-full mt-2"
          >
            <Mail size={16} className="mr-2" /> {busy === "email" ? "Opening Email…" : "Send via Email"}
          </button>
          <div className="text-xs text-slate-500 mt-4 pt-3 border-t flex items-center gap-2">
            <Phone size={12} /> Or call us directly: <a href="tel:9356913565" className="text-brand-orange font-semibold hover:underline">93569 13565</a>
          </div>
        </aside>
      </div>
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
