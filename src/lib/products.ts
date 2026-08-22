// Server-only product fetcher: uses Appwrite REST with API key.
// Cached via Next.js's Data Cache (tag "products", 1h TTL) instead of cache:no-store --
// admin saves trigger instant on-demand revalidation via /api/revalidate, so this cache
// window is just a safety net for reads that don't go through the admin save flow
// (crawlers, repeat visitors, etc.), not a source of visible staleness.
// Admin client pages should import from ./products-admin instead.
import type { Product } from "./types";
import { products as seedProducts } from "./seed-data";
import { loadCatalogSnapshot } from "./catalog-snapshot";

const REVALIDATE_SECONDS = 3600;

const hasAppwrite = () =>
  !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== "your_project_id" &&
  !!process.env.APPWRITE_API_KEY;

async function appwriteRest<T>(path: string, params: Record<string, any> = {}): Promise<T> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const apiKey = process.env.APPWRITE_API_KEY!;
  const url = new URL(`${endpoint}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach((val) => url.searchParams.append(`${k}[]`, String(val)));
    else if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
    },
    next: { revalidate: REVALIDATE_SECONDS, tags: ["products"] },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Appwrite ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

function filterProductList(
  source: Product[],
  opts: { category?: string; search?: string; includeUnpublished?: boolean; limit?: number },
): Product[] {
  let list = [...source];
  if (opts.category) list = list.filter((p) => p.category === opts.category);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (!opts.includeUnpublished) list = list.filter((p) => p.published !== false);
  if (opts.limit) list = list.slice(0, opts.limit);
  return list;
}

// Appwrite unreachable (paused/down) or not configured -- prefer the last-known-good
// full-catalog snapshot (saved by the keepalive cron) over the tiny hardcoded seed
// file, so the real catalog keeps showing instead of reverting to the ~22 launch
// products. Falls back to seed-data.ts only if no snapshot has ever been saved.
async function fallbackProducts(opts: { category?: string; search?: string; includeUnpublished?: boolean; limit?: number }): Promise<Product[]> {
  const snapshot = await loadCatalogSnapshot();
  return filterProductList(snapshot ?? seedProducts, opts);
}

// Safety ceiling for the "fetch everything" path -- not a realistic catalog size,
// just a guard against a runaway pagination loop.
const MAX_FETCH_ALL = 5000;
const PAGE_SIZE = 100;

export async function listProducts(opts: { category?: string; search?: string; limit?: number; includeUnpublished?: boolean } = {}): Promise<Product[]> {
  if (!hasAppwrite()) return fallbackProducts(opts);

  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const colId = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;
    const baseQueries: string[] = [];
    if (opts.category) baseQueries.push(JSON.stringify({ method: "equal", attribute: "category", values: [opts.category] }));
    if (opts.search) baseQueries.push(JSON.stringify({ method: "search", attribute: "name", values: [opts.search] }));

    let documents: any[];
    if (opts.limit) {
      // Caller wants a specific bounded page (e.g. homepage teaser, related products).
      const queries = [...baseQueries, JSON.stringify({ method: "limit", values: [opts.limit] })];
      const data = await appwriteRest<{ documents: any[]; total: number }>(
        `/databases/${dbId}/collections/${colId}/documents`,
        { queries },
      );
      documents = data.documents;
    } else {
      // No limit given -> the caller wants the FULL matching set. Page through it via
      // cursor pagination instead of an arbitrary single-request cap.
      documents = [];
      let cursor: string | null = null;
      while (documents.length < MAX_FETCH_ALL) {
        const queries = [...baseQueries, JSON.stringify({ method: "limit", values: [PAGE_SIZE] })];
        if (cursor) queries.push(JSON.stringify({ method: "cursorAfter", values: [cursor] }));
        const data = await appwriteRest<{ documents: any[]; total: number }>(
          `/databases/${dbId}/collections/${colId}/documents`,
          { queries },
        );
        documents.push(...data.documents);
        if (data.documents.length < PAGE_SIZE) break;
        cursor = data.documents[data.documents.length - 1].$id;
      }
    }

    let list = documents as unknown as Product[];
    if (!opts.includeUnpublished) list = list.filter((p) => p.published !== false);
    return list;
  } catch (err) {
    console.error("[listProducts] Server fetch failed, falling back to catalog snapshot:", err);
    return fallbackProducts(opts);
  }
}

export async function getFeatured(): Promise<Product[]> {
  if (!hasAppwrite()) {
    const list = await fallbackProducts({});
    return list.filter((p) => p.featured);
  }
  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const colId = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;
    const queries: string[] = [
      JSON.stringify({ method: "equal", attribute: "featured", values: [true] }),
      JSON.stringify({ method: "limit", values: [8] }),
    ];
    const data = await appwriteRest<{ documents: any[]; total: number }>(
      `/databases/${dbId}/collections/${colId}/documents`,
      { queries },
    );
    return (data.documents as unknown as Product[]).filter((p) => p.published !== false);
  } catch (err) {
    console.error("[getFeatured] Server fetch failed, falling back to catalog snapshot:", err);
    const list = await fallbackProducts({});
    return list.filter((p) => p.featured);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasAppwrite()) {
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const colId = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;
    const queries: string[] = [
      JSON.stringify({ method: "equal", attribute: "slug", values: [slug] }),
      JSON.stringify({ method: "limit", values: [1] }),
    ];
    const data = await appwriteRest<{ documents: any[]; total: number }>(
      `/databases/${dbId}/collections/${colId}/documents`,
      { queries },
    );
    return (data.documents[0] as unknown as Product) ?? null;
  } catch (err) {
    console.error("[getProductBySlug] Server fetch failed, falling back to catalog snapshot:", err);
    const snapshot = await loadCatalogSnapshot();
    const source = snapshot ?? seedProducts;
    return source.find((p) => p.slug === slug) ?? null;
  }
}
