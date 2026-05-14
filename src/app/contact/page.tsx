"use client";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Contact Us</h1>
          <p className="text-navy-100 mt-2">For quotes, AMC enquiries or technical support — reach out anytime.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10 md:py-12 grid md:grid-cols-2 gap-8 md:gap-10">
        <div>
          <h2 className="text-xl font-bold text-navy mb-4">Get in touch</h2>
          <ul className="space-y-4 text-sm">
            <Info icon={<MapPin />} title="Office Address">
              Main Road Khaparkheda-Dahegaon, Jay Bhole Nagar, Khaparkheda, Nagpur, Maharashtra
            </Info>
            <Info icon={<Phone />} title="Phone">
              <a href="tel:9356913565" className="block hover:text-brand-orange">93569 13565</a>
            </Info>
            <Info icon={<Mail />} title="Email">
              <a href="mailto:ushaelectrical99@gmail.com" className="hover:text-brand-orange">ushaelectrical99@gmail.com</a>
            </Info>
            <Info icon={<Clock />} title="Working Hours">
              Mon – Sat: 9:00 AM – 7:00 PM<br />Sunday: On-call only
            </Info>
          </ul>

          <div className="mt-6 card p-4 bg-slate-50">
            <div className="text-xs uppercase tracking-wider text-brand-orange font-semibold">Credentials</div>
            <div className="text-sm text-navy mt-1 font-semibold">M.L. No. 34090 · GSTIN 27BRGPD5535F1ZY</div>
            <div className="text-xs text-slate-600 mt-1">Licensed by Industries &amp; Energy Department, Government of Maharashtra</div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-navy mb-4">Send an enquiry</h2>
          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">
              Thanks! We've received your enquiry and will reach out within 24 hours.
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Name *</label><input className="input" required /></div>
                <div><label className="label">Phone *</label><input className="input" required type="tel" /></div>
              </div>
              <div><label className="label">Email</label><input className="input" type="email" /></div>
              <div><label className="label">Subject</label>
                <select className="input">
                  <option>Product Enquiry</option>
                  <option>Bulk / Quotation</option>
                  <option>Installation / AMC</option>
                  <option>Service / Repair</option>
                  <option>Other</option>
                </select>
              </div>
              <div><label className="label">Message *</label><textarea required rows={5} className="input" /></div>
              <button className="btn-primary w-full">Send Enquiry</button>
              <p className="text-xs text-slate-500 mt-2">
                We respect your privacy. Your details will only be used to respond to your enquiry.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Info({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="bg-brand-orange/10 text-brand-orange rounded-md w-9 h-9 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <div className="font-semibold text-navy">{title}</div>
        <div className="text-slate-600 mt-0.5">{children}</div>
      </div>
    </li>
  );
}
