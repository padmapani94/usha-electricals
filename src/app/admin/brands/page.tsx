"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Tag, X, Percent, IndianRupee, Plus } from "lucide-react";
import { listProductsClient } from "@/lib/products-admin";
import { bulkAdjustPriceByBrand, bulkApplyDiscountByBrand, bulkClearDiscountByBrand } from "@/lib/admin-products";
import { useToasts } from "@/store/toasts";
import type { Product } from "@/lib/types";

type BrandSummary = {
  brand: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  discountedCount: number;
};

export default function AdminBrandsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceModalBrand, setPriceModalBrand] = useState<string | null>(null);
  const [discountModalBrand, setDiscountModalBrand] = useState<string | null>(null);
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const toast = useToasts((s) => s.push);

  const load = async () => {
    setLoading(true);
    const list = await listProductsClient({ limit: 500, includeUnpublished: true });
    setProducts(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const brands = useMemo<BrandSummary[]>(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const b = p.brand?.trim();
      if (!b) continue;
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(p);
    }
    return Array.from(map.entries())
      .map(([brand, items]) => ({
        brand,
        count: items.length,
        minPrice: Math.min(...items.map((p) => p.price)),
        maxPrice: Math.max(...items.map((p) => p.price)),
        discountedCount: items.filter((p) => p.mrp && p.mrp > p.price).length,
      }))
      .filter((b) => b.brand.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [products, search]);

  const unbrandedCount = products.filter((p) => !p.brand?.trim()).length;

  const clearDiscount = async (brand: string) => {
    const { updated } = await bulkClearDiscountByBrand(brand);
    await load();
    toast({ message: `Cleared discount on ${updated} ${brand} product(s)`, kind: "info" });
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-3 mb-5 md:mb-6 flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold text-navy">Brands ({brands.length})</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input max-w-[220px] text-sm"
          />
          <button onClick={() => setAddBrandOpen(true)} className="btn-primary text-sm whitespace-nowrap">
            <Plus size={16} className="mr-1" /> Add Brand
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : brands.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">No brands found. Add a brand name on your products first.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3">Brand</th>
                  <th className="text-right p-3">Products</th>
                  <th className="text-right p-3">Price Range</th>
                  <th className="text-center p-3">Discounted</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.brand} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-semibold text-navy">{b.brand}</td>
                    <td className="p-3 text-right">{b.count}</td>
                    <td className="p-3 text-right text-slate-600">
                      {b.minPrice === b.maxPrice
                        ? `₹${b.minPrice.toLocaleString("en-IN")}`
                        : `₹${b.minPrice.toLocaleString("en-IN")} – ₹${b.maxPrice.toLocaleString("en-IN")}`}
                    </td>
                    <td className="p-3 text-center">
                      {b.discountedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-brand-orange/10 text-brand-orange font-semibold">
                          {b.discountedCount} of {b.count}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setPriceModalBrand(b.brand)} className="p-2 text-navy hover:bg-slate-100 rounded" title="Adjust price">
                          <TrendingUp size={14} />
                        </button>
                        <button onClick={() => setDiscountModalBrand(b.brand)} className="p-2 text-brand-orange hover:bg-orange-50 rounded" title="Apply discount">
                          <Tag size={14} />
                        </button>
                        {b.discountedCount > 0 && (
                          <button onClick={() => clearDiscount(b.brand)} className="p-2 text-slate-500 hover:bg-slate-100 rounded" title="Clear discount">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {brands.map((b) => (
              <div key={b.brand} className="card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-navy">{b.brand}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {b.count} product{b.count !== 1 ? "s" : ""} ·{" "}
                      {b.minPrice === b.maxPrice
                        ? `₹${b.minPrice.toLocaleString("en-IN")}`
                        : `₹${b.minPrice.toLocaleString("en-IN")}–₹${b.maxPrice.toLocaleString("en-IN")}`}
                    </div>
                  </div>
                  {b.discountedCount > 0 && (
                    <span className="text-[10px] px-2 py-1 rounded bg-brand-orange/10 text-brand-orange font-semibold shrink-0">
                      {b.discountedCount} discounted
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t flex gap-2">
                  <button onClick={() => setPriceModalBrand(b.brand)} className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold bg-navy text-white rounded py-2">
                    <TrendingUp size={12} /> Adjust Price
                  </button>
                  <button onClick={() => setDiscountModalBrand(b.brand)} className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold bg-brand-orange text-white rounded py-2">
                    <Tag size={12} /> Discount
                  </button>
                  {b.discountedCount > 0 && (
                    <button onClick={() => clearDiscount(b.brand)} className="px-3 py-2 text-slate-500 bg-slate-100 rounded text-xs" title="Clear discount">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {unbrandedCount > 0 && (
            <p className="text-xs text-slate-400 mt-4">{unbrandedCount} product(s) have no brand set and are excluded from this list.</p>
          )}
        </>
      )}

      {priceModalBrand && (
        <PriceAdjustModal
          brand={priceModalBrand}
          count={brands.find((b) => b.brand === priceModalBrand)?.count ?? 0}
          onClose={() => setPriceModalBrand(null)}
          onApplied={async (msg) => { await load(); toast({ message: msg, kind: "success" }); setPriceModalBrand(null); }}
        />
      )}
      {discountModalBrand && (
        <DiscountModal
          brand={discountModalBrand}
          count={brands.find((b) => b.brand === discountModalBrand)?.count ?? 0}
          onClose={() => setDiscountModalBrand(null)}
          onApplied={async (msg) => { await load(); toast({ message: msg, kind: "success" }); setDiscountModalBrand(null); }}
        />
      )}
      {addBrandOpen && (
        <AddBrandModal
          existingBrands={brands.map((b) => b.brand)}
          onClose={() => setAddBrandOpen(false)}
        />
      )}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddBrandModal({ existingBrands, onClose }: { existingBrands: string[]; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const alreadyExists = existingBrands.some((b) => b.toLowerCase() === name.trim().toLowerCase());

  const proceed = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    router.push(`/admin/products/new?brand=${encodeURIComponent(trimmed)}`);
  };

  return (
    <ModalShell title="Add Brand" onClose={onClose}>
      <p className="text-xs text-slate-500 mb-4">
        Brands aren&apos;t stored on their own — a brand shows up here as soon as a product uses it.
        Type the new brand name below and you&apos;ll be taken to Add Product with it pre-filled.
      </p>
      <label className="text-xs text-slate-500">Brand name</label>
      <input
        type="text"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && proceed()}
        placeholder="e.g. Siemens"
        className="input mt-1 mb-1"
      />
      {alreadyExists && (
        <p className="text-xs text-brand-orange mb-3">A brand named &quot;{name.trim()}&quot; already exists.</p>
      )}
      <button disabled={!name.trim()} onClick={proceed} className="btn-primary w-full justify-center disabled:opacity-50 mt-3">
        Continue to Add Product
      </button>
    </ModalShell>
  );
}

function PriceAdjustModal({ brand, count, onClose, onApplied }: { brand: string; count: number; onClose: () => void; onApplied: (msg: string) => void }) {
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [mode, setMode] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const num = Number(value);
    if (!num || num <= 0) { alert("Enter a value greater than 0"); return; }
    setBusy(true);
    try {
      const { updated } = await bulkAdjustPriceByBrand(brand, direction, mode, num);
      onApplied(`${direction === "increase" ? "Increased" : "Decreased"} price by ${num}${mode === "percent" ? "%" : " ₹"} on ${updated} ${brand} product(s)`);
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title={`Adjust Price — ${brand}`} onClose={onClose}>
      <p className="text-xs text-slate-500 mb-4">Applies to all {count} product{count !== 1 ? "s" : ""} of this brand.</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => setDirection("increase")} className={`flex items-center justify-center gap-1 py-2 rounded text-sm font-medium border ${direction === "increase" ? "bg-green-50 border-green-500 text-green-700" : "border-slate-200 text-slate-600"}`}>
          <TrendingUp size={14} /> Increase
        </button>
        <button onClick={() => setDirection("decrease")} className={`flex items-center justify-center gap-1 py-2 rounded text-sm font-medium border ${direction === "decrease" ? "bg-red-50 border-red-500 text-red-700" : "border-slate-200 text-slate-600"}`}>
          <TrendingDown size={14} /> Decrease
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => setMode("percent")} className={`flex items-center justify-center gap-1 py-2 rounded text-sm font-medium border ${mode === "percent" ? "bg-navy-50 border-navy text-navy" : "border-slate-200 text-slate-600"}`}>
          <Percent size={14} /> Percent
        </button>
        <button onClick={() => setMode("fixed")} className={`flex items-center justify-center gap-1 py-2 rounded text-sm font-medium border ${mode === "fixed" ? "bg-navy-50 border-navy text-navy" : "border-slate-200 text-slate-600"}`}>
          <IndianRupee size={14} /> Fixed ₹
        </button>
      </div>
      <label className="text-xs text-slate-500">Value</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input mt-1 mb-4"
      />
      <button disabled={busy} onClick={apply} className="btn-primary w-full justify-center disabled:opacity-50">
        {busy ? "Applying…" : `Apply to ${count} product(s)`}
      </button>
    </ModalShell>
  );
}

function DiscountModal({ brand, count, onClose, onApplied }: { brand: string; count: number; onClose: () => void; onApplied: (msg: string) => void }) {
  const [value, setValue] = useState("10");
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const num = Number(value);
    if (!num || num <= 0 || num >= 100) { alert("Enter a discount between 1 and 99"); return; }
    setBusy(true);
    try {
      const { updated } = await bulkApplyDiscountByBrand(brand, num);
      onApplied(`Applied ${num}% discount to ${updated} ${brand} product(s)`);
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title={`Apply Discount — ${brand}`} onClose={onClose}>
      <p className="text-xs text-slate-500 mb-4">
        Sets the current price as MRP and discounts all {count} product{count !== 1 ? "s" : ""} of this brand by the given %.
      </p>
      <label className="text-xs text-slate-500">Discount %</label>
      <input
        type="number"
        min={1}
        max={99}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input mt-1 mb-4"
      />
      <button disabled={busy} onClick={apply} className="btn-primary w-full justify-center disabled:opacity-50">
        {busy ? "Applying…" : `Apply ${value}% discount`}
      </button>
    </ModalShell>
  );
}
