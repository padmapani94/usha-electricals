"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, isAdmin, isEditor, logout, roleOf, type Role } from "@/lib/auth";
import { Package, ShoppingBag, LayoutDashboard, ArrowLeft, FolderTree, ShieldCheck, PencilRuler, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<Role | "loading">("loading");

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) { router.replace("/login?next=/admin"); return; }
      setRole(roleOf(u));
    });
  }, [router]);

  if (role === "loading") return <div className="p-10 text-slate-500">Checking access…</div>;
  if (role === "none") return (
    <div className="max-w-md mx-auto p-10 text-center">
      <h1 className="text-2xl font-bold text-navy">Access Denied</h1>
      <p className="text-slate-500 mt-2">Your account is not authorised for the admin panel.</p>
      <Link href="/" className="btn-primary mt-4 inline-flex">Go home</Link>
    </div>
  );

  // Editors are forbidden from /admin (dashboard) and /admin/orders
  const editorBlocked = role === "editor" && (pathname === "/admin" || pathname.startsWith("/admin/orders"));
  if (editorBlocked) {
    return (
      <div className="max-w-md mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold text-navy">Editor access only</h1>
        <p className="text-slate-500 mt-2">This page is restricted to administrators. As an editor, you can manage products and categories.</p>
        <Link href="/admin/products" className="btn-primary mt-4 inline-flex">Go to Products</Link>
      </div>
    );
  }

  const adminNav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/orders", label: "Enquiries", icon: ShoppingBag },
  ];
  const editorNav = [
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
  ];
  const nav = role === "admin" ? adminNav : editorNav;

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 md:py-8">
      {/* Mobile top bar */}
      <div className="md:hidden mb-5">
        <Link href="/" className="text-xs text-slate-500 hover:text-navy inline-flex items-center gap-1 mb-3"><ArrowLeft size={12} /> Back to site</Link>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-bold text-navy">Admin</h2>
          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1 ${role === "admin" ? "bg-brand-orange/15 text-brand-orange" : "bg-blue-100 text-blue-700"}`}>
            {role === "admin" ? <ShieldCheck size={10} /> : <PencilRuler size={10} />}
            {role.toUpperCase()}
          </span>
        </div>
        <nav className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 snap-x">
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href}
                className={`shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition ${active ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                <n.icon size={14} /> {n.label}
              </Link>
            );
          })}
          <button onClick={async () => { await logout(); router.replace("/"); }}
            className="shrink-0 snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition">
            <LogOut size={14} /> Sign out
          </button>
        </nav>
      </div>

      <div className="md:grid md:grid-cols-[220px_1fr] md:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block space-y-1">
          <Link href="/" className="text-xs text-slate-500 hover:text-navy mb-4 inline-flex items-center gap-1"><ArrowLeft size={12} /> Back to site</Link>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-navy">Admin</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1 ${role === "admin" ? "bg-brand-orange/15 text-brand-orange" : "bg-blue-100 text-blue-700"}`}>
              {role === "admin" ? <ShieldCheck size={10} /> : <PencilRuler size={10} />}
              {role.toUpperCase()}
            </span>
          </div>
          {nav.map((n) => {
            const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${active ? "bg-navy text-white" : "hover:bg-slate-100 text-slate-700"}`}>
                <n.icon size={16} /> {n.label}
              </Link>
            );
          })}
          <button onClick={async () => { await logout(); router.replace("/"); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition text-slate-500 hover:bg-red-50 hover:text-red-600 mt-4 border-t border-slate-200 pt-4">
            <LogOut size={16} /> Sign out
          </button>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
