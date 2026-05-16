"use client";
import type { Product } from "./types";
import { products as seedProducts } from "./seed-data";
import { databases, appwriteConfig, isAppwriteConfigured, Query } from "./appwrite";

// Client-side product list (used by admin pages where the user is authed)
export async function listProductsClient(opts: { category?: string; search?: string; limit?: number; includeUnpublished?: boolean } = {}): Promise<Product[]> {
  if (!isAppwriteConfigured) {
    return seedProducts.filter((p) => opts.includeUnpublished || p.published !== false);
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
  } catch (err) {
    console.error("[listProductsClient] failed:", err);
    return seedProducts;
  }
}
