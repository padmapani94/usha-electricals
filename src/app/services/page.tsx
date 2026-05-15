import Link from "next/link";
import { CheckCircle2, Phone, MessageCircle, ArrowRight, Wrench } from "lucide-react";
import Reveal from "@/components/Reveal";
import { services } from "@/lib/seed-data";

export const metadata = {
  title: "Our Services | Usha Electricals Engineering Works",
  description: "Metering cubicles, CT/PT repair, epoxy CT/PT fixing, testing, electrical licensing and APFC panels — Nagpur's trusted electrical contractor since 2016.",
};

const WA_NUMBER = "919356913565";

export default function ServicesPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-navy via-navy-700 to-navy-900 text-white overflow-hidden">
        <div aria-hidden className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-orange/25 blur-3xl animate-float-y" />
        <div aria-hidden className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-yellow/15 blur-3xl animate-float-y-slow" />
        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-full px-3 py-1 text-xs font-semibold mb-4">
              <Wrench size={14} /> Govt. Contractor Services
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl">
              Specialist electrical services for industries, utilities &amp; large facilities
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-navy-100 text-base sm:text-lg mt-4 max-w-2xl">
              Licensed by the Industries &amp; Energy Department (M.L. No. 34090). MSEDCL-compliant work since 2016. Free consultancy &amp; design with every project.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`https://wa.me/${WA_NUMBER}?text=Hello%20Usha%20Electricals%2C%20I%27d%20like%20to%20enquire%20about%20your%20services.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold rounded-md px-4 py-2.5 transition">
                <MessageCircle size={18} /> Quick Enquiry on WhatsApp
              </a>
              <a href="tel:9356913565" className="btn-outline border-white text-white hover:bg-white/10">
                <Phone size={16} className="mr-1" /> Call 93569 13565
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* QUICK INDEX */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">Jump to service</div>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} className="text-sm bg-white border border-slate-200 hover:border-brand-orange hover:text-brand-orange text-slate-700 rounded-full px-3 py-1.5 transition">
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES LIST */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-20">
        {services.map((s, i) => {
          const reverse = i % 2 === 1;
          return (
            <article
              key={s.slug}
              id={s.slug}
              className="grid md:grid-cols-2 gap-8 md:gap-12 items-center scroll-mt-24"
            >
              <Reveal className={reverse ? "md:order-2" : ""}>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 shadow-md group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur text-navy text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                    {String(i + 1).padStart(2, "0")} · Service
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100} className={reverse ? "md:order-1" : ""}>
                <h2 className="text-2xl md:text-3xl font-bold text-navy">{s.title}</h2>
                <p className="text-slate-600 mt-3 leading-relaxed">{s.longDescription}</p>
                <ul className="mt-5 space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={18} className="text-brand-orange shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hello Usha Electricals, I'd like to enquire about your "${s.title}" service.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5b] text-white text-sm font-semibold rounded-md px-3 py-2 transition"
                  >
                    <MessageCircle size={14} /> Enquire on WhatsApp
                  </a>
                  <Link
                    href={`/contact?subject=${encodeURIComponent(s.title)}`}
                    className="btn-outline text-sm"
                  >
                    Request a quote <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </Reveal>
            </article>
          );
        })}
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-brand-orange relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float-y-slow" />
        <div aria-hidden className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-navy/20 blur-3xl animate-float-y" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Need a service not listed here?</h2>
            <p className="text-white/90 mt-1">We take on custom electrical projects across Maharashtra. Tell us what you need.</p>
          </Reveal>
          <Reveal delay={150}>
            <div className="flex gap-3">
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="btn bg-white text-brand-orange hover:bg-slate-100 hover:scale-105 transition">
                <MessageCircle size={16} className="mr-1" /> WhatsApp Us
              </a>
              <Link href="/contact" className="btn bg-navy text-white hover:bg-navy-700 hover:scale-105 transition">Send Enquiry</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
