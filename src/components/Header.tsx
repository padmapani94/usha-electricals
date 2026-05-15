"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, User, X, Zap } from "lucide-react";
import { useCart } from "@/store/cart";
import { getCurrentUser, canEdit, logout } from "@/lib/auth";

export default function Header() {
  const count = useCart((s) => s.count());
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const nav = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="bg-navy text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap justify-between gap-x-4">
          <span>📞 93569 13565</span>
          <span className="hidden sm:inline">✉ ushaelectrical99@gmail.com · GSTIN 27BRGPD5535F1ZY</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="bg-navy rounded-md p-1.5 sm:p-2 shrink-0"><Zap className="text-brand-orange" size={18} /></div>
          <div className="leading-tight min-w-0">
            <div className="font-bold text-navy text-sm sm:text-lg truncate">Usha Electricals</div>
            <div className="text-[9px] sm:text-xs text-slate-500 -mt-0.5 truncate">Engineering Works · Govt. Contractor</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-slate-700 hover:text-brand-orange">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2 text-navy hover:text-brand-orange transition-colors">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span key={count} className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold animate-fade-up shadow ring-2 ring-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/account" className="btn-outline text-xs"><User size={14} /> {user.name?.split(" ")[0] ?? "Account"}</Link>
              {canEdit(user) && <Link href="/admin" className="btn-secondary text-xs">Admin</Link>}
              <button className="text-xs text-slate-500 hover:text-navy" onClick={async () => { await logout(); setUser(null); }}>Sign out</button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:inline-flex btn-primary text-xs">Sign in</Link>
          )}
          <button className="md:hidden p-2 text-navy" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 space-y-2">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block py-2 text-slate-700" onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/account" className="block py-2 text-slate-700" onClick={() => setOpen(false)}>My Account</Link>
              {canEdit(user) && <Link href="/admin" className="block py-2 text-navy font-semibold" onClick={() => setOpen(false)}>Admin Panel</Link>}
              <button className="block py-2 text-slate-500" onClick={async () => { await logout(); setUser(null); setOpen(false); }}>Sign out</button>
            </>
          ) : (
            <Link href="/login" className="block py-2 text-brand-orange font-semibold" onClick={() => setOpen(false)}>Sign in / Register</Link>
          )}
        </div>
      )}
    </header>
  );
}
