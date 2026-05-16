import type { Product } from "./types";
import { products as seedProducts } from "./seed-data";
import { databases, appwriteConfig, isAppwriteConfigured, Query } from "./appwrite";
import { unstable_noStore as noStore } from "next/cache";

const hasAppwrite = () => isAppwriteConfigured;

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
    const queries: any[] = [Query.limit(opts.limit ?? 100)];
    if (opts.category) queries.push(Query.equal("category", opts.category));
    if (opts.search) queries.push(Query.search("name", opts.search));
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      queries,
    );
    let list = res.documents as unknown as Product[];
    if (!opts.includeUnpublished) list = list.filter((p) => p.published !== false);
    return list;
  } catch {
    return seedProducts.filter((p) => opts.includeUnpublished || p.published !== false);
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
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.equal("slug", slug), Query.limit(1)],
    );
    return (res.documents[0] as unknown as Product) ?? null;
  } catch {
    return seedProducts.find((p) => p.slug === slug) ?? null;
  }
}
