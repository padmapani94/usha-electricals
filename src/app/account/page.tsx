"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, canEdit, logout } from "@/lib/auth";
import { Package, ShoppingBag, LogOut, Shield } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) router.replace("/login?next=/account");
      else setUser(u);
    });
  }, [router]);

  if (!user) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-500">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">My Account</h1>
      <p className="text-slate-500 mb-8">Welcome back, <span className="font-semibold text-navy">{user.name}</span>.</p>

      <div className="grid md:grid-cols-2 gap-5">
        <Link href="/account/orders" className="card p-6 hover:border-brand-orange transition">
          <Package className="text-brand-orange mb-3" />
          <h3 className="font-bold text-navy">My Orders</h3>
          <p className="text-sm text-slate-500 mt-1">View order history and track shipments.</p>
        </Link>
        <Link href="/products" className="card p-6 hover:border-brand-orange transition">
          <ShoppingBag className="text-brand-orange mb-3" />
          <h3 className="font-bold text-navy">Continue Shopping</h3>
          <p className="text-sm text-slate-500 mt-1">Browse our latest electrical products.</p>
        </Link>
        {canEdit(user) && (
          <Link href="/admin" className="card p-6 hover:border-brand-orange transition">
            <Shield className="text-brand-orange mb-3" />
            <h3 className="font-bold text-navy">Admin Panel</h3>
            <p className="text-sm text-slate-500 mt-1">Manage products and orders.</p>
          </Link>
        )}
        <button
          onClick={async () => { await logout(); router.replace("/"); }}
          className="card p-6 hover:border-red-300 text-left"
        >
          <LogOut className="text-red-500 mb-3" />
          <h3 className="font-bold text-navy">Sign Out</h3>
          <p className="text-sm text-slate-500 mt-1">End your session on this device.</p>
        </button>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-bold text-navy mb-3">Profile</h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-slate-500">Name</dt><dd>{user.name}</dd>
          <dt className="text-slate-500">Email</dt><dd>{user.email}</dd>
          <dt className="text-slate-500">User ID</dt><dd className="font-mono text-xs">{user.$id}</dd>
        </dl>
      </div>
    </div>
  );
}
