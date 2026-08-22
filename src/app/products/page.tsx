import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { listProducts } from "@/lib/products";
import { categories } from "@/lib/seed-data";
import { Search } from "lucide-react";

// Not force-dynamic: the underlying listProducts() fetch is cached (see
// src/lib/products.ts) and revalidated on-demand by admin saves via
// /api/revalidate, which cuts Appwrite read volume far more than this page
// re-rendering per request for a ?category=/?q= filter costs.

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const products = await listProducts({ category: searchParams.category, search: searchParams.q });
  const activeCat = searchParams.category;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-navy">All Products</h1>
        <p className="text-slate-600 mt-1 text-sm">{products.length} item{products.length !== 1 && "s"} available</p>
      </div>

      {/* Mobile filter bar */}
      <div className="md:hidden mb-5 space-y-3">
        <form action="/products" className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search products…"
            className="input pl-9"
          />
          {activeCat && <input type="hidden" name="category" value={activeCat} />}
        </form>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 snap-x">
          <Link
            href="/products"
            className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-sm font-medium transition ${!activeCat ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className={`shrink-0 snap-start px-3 py-1.5 rounded-full text-sm font-medium transition ${activeCat === c.slug ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-6 lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block space-y-2">
          <h3 className="font-semibold text-navy mb-2">Categories</h3>
          <Link
            href="/products"
            className={`block px-3 py-2 rounded text-sm ${!activeCat ? "bg-navy text-white" : "hover:bg-slate-100 text-slate-700"}`}
          >
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className={`block px-3 py-2 rounded text-sm ${activeCat === c.slug ? "bg-navy text-white" : "hover:bg-slate-100 text-slate-700"}`}
            >
              {c.name}
            </Link>
          ))}

          <form action="/products" className="pt-4 border-t border-slate-200 mt-4">
            <label className="label">Search</label>
            <input type="text" name="q" defaultValue={searchParams.q ?? ""} placeholder="Search products" className="input" />
            {activeCat && <input type="hidden" name="category" value={activeCat} />}
            <button className="btn-primary w-full mt-2 text-sm">Search</button>
          </form>
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="text-center py-20 text-slate-500">No products match your filter.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
