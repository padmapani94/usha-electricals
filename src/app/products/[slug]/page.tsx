import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, listProducts } from "@/lib/products";
import VariantPicker from "./VariantPicker";
import { categories } from "@/lib/seed-data";
import { richTextToHtml, richTextToPlainText } from "@/lib/richtext";

// Cached for up to an hour (not force-dynamic) -- admin saves trigger instant
// on-demand revalidation via /api/revalidate, so this is a read-volume safety
// net for crawler/repeat traffic, not a source of visible staleness.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  const tags = product.tags ?? [];
  const metaTitle = product.metaTitle?.trim() || `${product.name} | Usha Electricals`;
  const metaDescription = product.metaDescription?.trim() || richTextToPlainText(product.description).slice(0, 160);
  return {
    title: { absolute: metaTitle },
    description: metaDescription,
    keywords: [
      ...tags,
      product.brand,
      product.category,
      "Usha Electricals", "Nagpur",
    ].filter(Boolean) as string[],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: product.images?.length ? [product.images[0]] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = (await listProducts({ category: product.category, limit: 5 })).filter((p) => p.slug !== product.slug).slice(0, 4);
  const categoryName = categories.find((c) => c.slug === product.category)?.name ?? product.category;

  let specs: Record<string, string> = {};
  if (product.specs) {
    if (typeof product.specs === "string") {
      try { specs = JSON.parse(product.specs); } catch { specs = {}; }
    } else specs = product.specs;
  }

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <nav className="text-xs text-slate-500 mb-4 space-x-1">
        <Link href="/" className="hover:text-brand-orange">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-orange">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-brand-orange">{categoryName}</Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
        <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.images?.[0] ?? "/placeholder.png"} alt={product.imageAlt?.trim() || product.name} className="w-full h-full object-cover" />
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-brand-orange text-white text-sm px-3 py-1 rounded font-semibold">{discount}% OFF</span>
          )}
        </div>

        <div>
          {product.brand && <div className="text-sm text-slate-500 uppercase tracking-wider">{product.brand}</div>}
          <h1 className="text-2xl md:text-3xl font-bold text-navy mt-1">{product.name}</h1>

          <VariantPicker product={product} />

          <div
            className="text-slate-700 mt-5 leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-navy [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol:last-child]:mb-0 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: richTextToHtml(product.description) }}
          />

          {Object.keys(specs).length > 0 && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="font-semibold text-navy mb-3">Specifications</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-slate-800 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {product.tags.map((t) => (
                <span key={t} className="text-xs text-slate-500 bg-slate-100 hover:bg-brand-orange/10 hover:text-brand-orange px-2 py-0.5 rounded transition cursor-default">#{t}</span>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 rounded-lg bg-navy-50 text-sm text-navy-700">
            <strong>Need bulk pricing or installation?</strong> Call <a href="tel:9356913565" className="text-brand-orange font-semibold">93569 13565</a> or <Link href="/contact" className="underline">send an enquiry</Link>.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-navy mb-5">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="card overflow-hidden">
                <div className="aspect-square bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images?.[0]} alt={p.imageAlt?.trim() || p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-navy line-clamp-2">{p.name}</div>
                  <div className="text-brand-orange font-bold mt-1">₹{p.price.toLocaleString("en-IN")}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
