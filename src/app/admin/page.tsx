"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listAllOrders } from "@/lib/orders";
import { listProductsClient as listProducts } from "@/lib/products-admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [products, orders] = await Promise.all([listProducts({ limit: 500 }), listAllOrders().catch(() => [])]);
        setStats({
          products: products.length,
          orders: orders.length,
          revenue: orders.reduce((s, o) => s + (o.total ?? 0), 0),
          pending: orders.filter((o) => o.status === "pending").length,
        });
      } catch {}
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-6">Overview of your store.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Products" value={stats.products.toString()} href="/admin/products" />
        <Stat label="Total Enquiries" value={stats.orders.toString()} href="/admin/orders" />
        <Stat label="Pending Enquiries" value={stats.pending.toString()} href="/admin/orders" />
        <Stat label="Estimated Value" value={`₹${stats.revenue.toLocaleString("en-IN")}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link href="/admin/products/new" className="card p-6 hover:border-brand-orange">
          <h3 className="font-semibold text-navy">Add a new product</h3>
          <p className="text-sm text-slate-500 mt-1">Add new items to the catalog with images, specs &amp; price.</p>
        </Link>
        <Link href="/admin/orders" className="card p-6 hover:border-brand-orange">
          <h3 className="font-semibold text-navy">Manage enquiries</h3>
          <p className="text-sm text-slate-500 mt-1">Update status: pending → confirmed → shipped → delivered.</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-3xl font-bold text-navy mt-1">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
