"use client";
import type { Product } from "./types";
import { products as seedProducts } from "./seed-data";
import { databases, appwriteConfig, isAppwriteConfigured, Query } from "./appwrite";

const MAX_FETCH_ALL = 5000;
const PAGE_SIZE = 100;

function filterSeed(opts: { category?: string; search?: string; includeUnpublished?: boolean }): Product[] {
  let list = [...seedProducts];
  if (opts.category) list = list.filter((p) => p.category === opts.category);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q));
  }
  if (!opts.includeUnpublished) list = list.filter((p) => p.published !== false);
  return list;
}

// Client-side product list (used by admin pages where the user is authed)
export async function listProductsClient(opts: { category?: string; search?: string; limit?: number; includeUnpublished?: boolean } = {}): Promise<Product[]> {
  if (!isAppwriteConfigured) return filterSeed(opts);

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
    console.error("[listProductsClient] failed:", err);
    return filterSeed(opts);
  }
}
