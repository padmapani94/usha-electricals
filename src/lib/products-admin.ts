"use client";
import type { Product } from "./types";
import { products as seedProducts } from "./seed-data";
import { databases, appwriteConfig, isAppwriteConfigured, Query } from "./appwrite";

const MAX_FETCH_ALL = 5000;
const PAGE_SIZE = 100;

function filterList(source: Product[], opts: { category?: string; search?: string; includeUnpublished?: boolean }): Product[] {
  let list = [...source];
  if (opts.category) list = list.filter((p) => p.category === opts.category);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q));
  }
  if (!opts.includeUnpublished) list = list.filter((p) => p.published !== false);
  return list;
}

// Live Appwrite read failed (paused project, exceeded read quota, etc). Prefer the
// last-known-good catalog snapshot -- served from Vercel Blob, costs zero Appwrite
// reads -- over the tiny hardcoded seed file, so the admin panel keeps showing the
// real catalog (read-only, as of the last successful keepalive) instead of ~22
// launch products.
async function fallbackClientProducts(opts: { category?: string; search?: string; includeUnpublished?: boolean }): Promise<Product[]> {
  try {
    const res = await fetch("/api/catalog-snapshot");
    const data = await res.json();
    if (Array.isArray(data.products) && data.products.length > 0) return filterList(data.products, opts);
  } catch {
    // fall through to seed
  }
  return filterList(seedProducts, opts);
}

// Client-side product list (used by admin pages where the user is authed)
export async function listProductsClient(opts: { category?: string; search?: string; limit?: number; includeUnpublished?: boolean } = {}): Promise<Product[]> {
  if (!isAppwriteConfigured) return fallbackClientProducts(opts);

  try {
    const baseQueries: any[] = [];
    if (opts.category) baseQueries.push(Query.equal("category", opts.category));
    if (opts.search) baseQueries.push(Query.search("name", opts.search));

    let documents: any[];
    if (opts.limit) {
      const res = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        [...baseQueries, Query.limit(opts.limit)],
      );
      documents = res.documents;
    } else {
      // No limit given -> fetch the FULL matching set via cursor pagination.
      documents = [];
      let cursor: string | undefined;
      while (documents.length < MAX_FETCH_ALL) {
        const queries = [...baseQueries, Query.limit(PAGE_SIZE)];
        if (cursor) queries.push(Query.cursorAfter(cursor));
        const res = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.productsCollectionId, queries);
        documents.push(...res.documents);
        if (res.documents.length < PAGE_SIZE) break;
        cursor = res.documents[res.documents.length - 1].$id;
      }
    }

    let list = documents as unknown as Product[];
    if (!opts.includeUnpublished) list = list.filter((p) => p.published !== false);
    return list;
  } catch (err) {
    console.error("[listProductsClient] failed, falling back to catalog snapshot:", err);
    return fallbackClientProducts(opts);
  }
}

// Brand-name suggestions (e.g. the Add/Edit Product datalist) never need live-fresh
// data -- a brand showing up a couple hours late in the dropdown is a non-issue,
// unlike price/stock. Always read from the snapshot instead of doing a full,
// uncached, paginated live fetch of the entire catalog just to extract .brand.
export async function listBrandNames(): Promise<string[]> {
  const products = await fallbackClientProducts({ includeUnpublished: true });
  return Array.from(new Set(products.map((p) => p.brand?.trim()).filter(Boolean))) as string[];
}

// Same idea as listBrandNames(): a dashboard stat card doesn't need live-fresh data,
// so read the snapshot instead of doing a full live catalog fetch just for a count.
export async function fallbackProductCount(): Promise<number> {
  const products = await fallbackClientProducts({ includeUnpublished: true });
  return products.length;
}
