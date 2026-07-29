// Server-only product fetcher: uses Appwrite REST with API key + cache:no-store
// Admin client pages should import from ./products-admin instead.
import type { Product } from "./types";
import { products as seedProducts } from "./seed-data";
import { unstable_noStore as noStore } from "next/cache";

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
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Appwrite ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function listProducts(opts: { category?: string; search?: string; limit?: number; includeUnpublished?: boolean } = {}): Promise<Product[]> {
  noStore();
  if (!hasAppwrite()) {
    let list = [...seedProducts];
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
    return list.slice(0, opts.limit ?? 100);
  }

  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const colId = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;
    const queries: string[] = [JSON.stringify({ method: "limit", values: [opts.limit ?? 100] })];
    if (opts.category) queries.push(JSON.stringify({ method: "equal", attribute: "category", values: [opts.category] }));
    if (opts.search) queries.push(JSON.stringify({ method: "search", attribute: "name", values: [opts.search] }));

    const data = await appwriteRest<{ documents: any[]; total: number }>(
      `/databases/${dbId}/collections/${colId}/documents`,
      { queries },
    );
    let list = data.documents as unknown as Product[];
    if (!opts.includeUnpublished) list = list.filter((p) => p.published !== false);
    return list;
  } catch (err) {
    console.error("[listProducts] Server fetch failed, falling back to seed:", err);
    let list = [...seedProducts];
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
    return list.slice(0, opts.limit ?? 100);
  }
}

export async function getFeatured(): Promise<Product[]> {
  const all = await listProducts({ limit: 200 });
  return all.filter((p) => p.featured);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();
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
    console.error("[getProductBySlug] Server fetch failed:", err);
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
}
