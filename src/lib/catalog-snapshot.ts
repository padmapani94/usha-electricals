// Persists a full copy of the live product catalog to Vercel Blob storage every
// time the keepalive cron successfully reaches Appwrite. If Appwrite is later
// paused/unreachable, listProducts()/getProductBySlug() fall back to this
// snapshot instead of the tiny hardcoded seed-data.ts, so the real catalog
// (not just the original ~22 launch products) keeps showing on the site.
import { put, get } from "@vercel/blob";
import type { Product } from "./types";

const SNAPSHOT_PATH = "catalog-snapshot.json";

export async function saveCatalogSnapshot(products: Product[]): Promise<void> {
  await put(SNAPSHOT_PATH, JSON.stringify({ savedAt: new Date().toISOString(), products }), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function loadCatalogSnapshot(): Promise<Product[] | null> {
  try {
    const result = await get(SNAPSHOT_PATH, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);
    return Array.isArray(data.products) ? data.products : null;
  } catch (err) {
    console.error("[catalog-snapshot] load failed:", err);
    return null;
  }
}
