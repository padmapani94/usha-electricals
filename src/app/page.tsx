import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Zap, Award, Phone, Wrench, Building2,
  Battery, Sun, Network, Gauge, Lightbulb, Cpu, BatteryCharging,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import { getFeatured, listProducts } from "@/lib/products";
import { brands, categories, clients, services } from "@/lib/seed-data";

export const revalidate = 30;

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  "ups-systems": <BatteryCharging size={22} />,
  "inverters-batteries": <Battery size={22} />,
  "stabilizers-transformers": <Zap size={22} />,
  "electrical-panels": <Cpu size={22} />,
  "solar-systems": <Sun size={22} />,
  "networking": <Network size={22} />,
  "meters-monitoring": <Gauge size={22} />,
  "lighting-wiring": <Lightbulb size={22} />,
};

export default async function HomePage() {
  const featured = await getFeatured();
  const all = await listProducts({ limit: 4 });
  const showcase = featured.length ? featured : all;

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-navy via-navy-700 to-navy-900 text-white overflow-hidden">
        {/* animated orbs */}
        <div aria-hidden className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-orange/25 blur-3xl animate-float-y" />
        <div aria-hidden className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-brand-yellow/15 blur-3xl animate-float-y-slow" />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-blue-400/15 blur-3xl animate-float-y" />
        {/* grid */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]" />

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-24 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange rounded-full px-3 py-1 text-xs font-semibold mb-4">
                <Award size={14} /> Govt. Contractor · Since 2016
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Powering <span className="bg-gradient-to-r from-brand-orange to-brand-yellow bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">Industries</span>,<br />
                Energizing <span className="text-brand-yellow">Lives</span>.
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-4 sm:mt-5 text-navy-100 text-base sm:text-lg max-w-xl">
                From APFC panels to home inverters — Usha Electricals delivers high-quality, affordable electrical &amp; automation solutions across Maharashtra.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products" className="btn-primary group">
                  Shop Now <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/contact" className="btn-outline border-white text-white hover:bg-white/10">
                  <Phone size={16} className="mr-1" /> Get a Quote
                </Link>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <Stat label="Years" value={9} suffix="+" />
                <Stat label="Govt. Projects" value={50} suffix="+" />
                <Stat label="Brands" value={20} suffix="+" />
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="relative hidden md:block">
            <div className="aspect-square bg-gradient-to-br from-brand-orange/20 to-brand-yellow/10 rounded-3xl border border-white/10 p-6 backdrop-blur-md relative">
              <div aria-hidden className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-brand-orange/30 to-transparent blur-xl opacity-60" />
              <div className="relative grid grid-cols-2 gap-4 h-full">
                <FeatureTile
                  icon={<Zap />}
                  label="UPS Systems"
                  delay={0}
                  image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
                />
                <FeatureTile
                  icon={<Wrench />}
                  label="Panels & Automation"
                  delay={150}
                  image="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80"
                />
                <FeatureTile
                  icon={<Building2 />}
                  label="Industrial Projects"
                  delay={300}
                  image="https://images.pexels.com/photos/35042792/pexels-photo-35042792.jpeg?auto=compress&cs=tinysrgb&w=600"
                />
                <FeatureTile
                  icon={<ShieldCheck />}
                  label="MSEDCL Approved"
                  delay={450}
                  image="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* USP STRIP */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { icon: <ShieldCheck className="text-brand-orange" />, title: "Licensed Contractor", sub: "M.L. No. 34090" },
            { icon: <Award className="text-brand-orange" />, title: "Trusted Brands", sub: "APC, Schneider, ABB & more" },
            { icon: <Wrench className="text-brand-orange" />, title: "On-site Service", sub: "Repair, AMC, installation" },
            { icon: <Zap className="text-brand-orange" />, title: "Best Rates", sub: "Discount over MRP" },
          ].map((u, i) => (
            <Reveal key={u.title} delay={i * 80}>
              <div className="flex items-center gap-3 group">
                <div className="bg-white rounded-md p-2 border border-slate-200 group-hover:border-brand-orange group-hover:scale-110 transition">{u.icon}</div>
                <div>
                  <div className="font-semibold text-navy">{u.title}</div>
                  <div className="text-xs text-slate-500">{u.sub}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <Reveal>
          <Heading eyebrow="Shop by category" title="Everything Electrical, Under One Roof" />
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <Link
                href={`/products?category=${c.slug}`}
                className="card p-5 block hover:border-brand-orange hover:bg-gradient-to-br hover:from-orange-50/60 hover:to-white hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="bg-navy-50 rounded-md w-11 h-11 flex items-center justify-center mb-3 text-navy group-hover:bg-brand-orange group-hover:text-white group-hover:rotate-[-6deg] transition">
                  {CATEGORY_ICON[c.slug] ?? <Zap size={20} />}
                </div>
                <h3 className="font-semibold text-navy group-hover:text-brand-orange transition">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                <div className="text-xs text-brand-orange mt-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition font-semibold">
                  Browse →
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <Reveal><Heading eyebrow="Hot picks" title="Featured Products" /></Reveal>
            <Reveal delay={100}>
              <Link href="/products" className="text-sm font-medium text-brand-orange hover:underline group">
                View all <span className="inline-block group-hover:translate-x-1 transition">→</span>
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
            {showcase.slice(0, 8).map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <Reveal><Heading eyebrow="What we do" title="Our Services" /></Reveal>
          <Reveal delay={100}>
            <Link href="/services" className="text-sm font-medium text-brand-orange hover:underline group">
              View all services <span className="inline-block group-hover:translate-x-1 transition">→</span>
            </Link>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <Link href={`/services#${s.slug}`} className="card p-6 group hover:-translate-y-1 hover:shadow-xl hover:border-brand-orange transition-all duration-300 relative overflow-hidden block">
                <div aria-hidden className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-brand-orange/5 group-hover:bg-brand-orange/15 transition" />
                <div className="relative bg-brand-orange/10 text-brand-orange rounded-md w-11 h-11 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-brand-orange group-hover:text-white transition">
                  <Wrench size={20} />
                </div>
                <h3 className="font-semibold text-navy group-hover:text-brand-orange transition">{s.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{s.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BRANDS MARQUEE */}
      <section className="bg-navy py-12 overflow-hidden relative">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy via-transparent to-navy z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <Heading invert eyebrow="Authorised dealers" title="Brands We Carry" />
        </div>
        <div className="marquee">
          {[...brands, ...brands].map((b, i) => (
            <div key={i} className="text-white/80 font-bold text-xl whitespace-nowrap hover:text-brand-orange transition">{b}</div>
          ))}
        </div>
      </section>

      {/* CLIENTS */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <Reveal><Heading eyebrow="Esteemed customers" title="Trusted By India's Leaders" /></Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-8">
          {clients.map((c, i) => (
            <Reveal key={c} delay={i * 30}>
              <div className="card p-4 text-center text-sm font-semibold text-navy bg-white hover:bg-navy hover:text-white hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                {c}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-orange relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float-y-slow" />
        <div aria-hidden className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-navy/20 blur-3xl animate-float-y" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Need a custom electrical solution?</h2>
            <p className="text-white/90 mt-1">Free electrical consultancy &amp; design for safety measures.</p>
          </Reveal>
          <Reveal delay={150}>
            <div className="flex gap-3">
              <a href="tel:9356913565" className="btn bg-white text-brand-orange hover:bg-slate-100 hover:scale-105 transition">
                <Phone size={16} className="mr-1" /> Call 93569 13565
              </a>
              <Link href="/contact" className="btn bg-navy text-white hover:bg-navy-700 hover:scale-105 transition">Send Enquiry</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-bold text-brand-orange">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-[10px] sm:text-xs text-navy-100 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function FeatureTile({ icon, label, delay = 0, image }: { icon: React.ReactNode; label: string; delay?: number; image?: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10 hover:border-brand-orange/40 hover:-translate-y-1 transition-all duration-300 animate-fade-up group cursor-pointer"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/60 to-navy/30 group-hover:from-navy/80 group-hover:via-navy/40 transition" />
      <div className="relative h-full p-5 flex flex-col justify-between min-h-[140px]">
        <div className="text-brand-orange bg-white/10 backdrop-blur w-9 h-9 rounded-md flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition">
          {icon}
        </div>
        <div className="text-white font-semibold drop-shadow">{label}</div>
      </div>
    </div>
  );
}

function Heading({ eyebrow, title, invert }: { eyebrow: string; title: string; invert?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-orange flex items-center gap-2">
        <span className="w-6 h-px bg-brand-orange" /> {eyebrow}
      </div>
      <h2 className={`text-2xl md:text-3xl font-bold mt-2 ${invert ? "text-white" : "text-navy"}`}>{title}</h2>
    </div>
  );
}
