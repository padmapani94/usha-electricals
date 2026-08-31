/**
 * Serves the last-known-good product catalog snapshot (see src/lib/catalog-snapshot.ts)
 * to CLIENT-SIDE code without touching Appwrite at all. Used for admin-panel reads that
 * don't need millisecond freshness (e.g. the brand-name dropdown) and as a fallback when
 * a live Appwrite read fails (paused project, exceeded read quota, etc.) -- reading this
 * costs zero Appwrite reads, since it's served from Vercel Blob storage instead.
 */
import { NextResponse } from "next/server";
import { loadCatalogSnapshot } from "@/lib/catalog-snapshot";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const products = await loadCatalogSnapshot();
  return NextResponse.json({ products: products ?? [] });
}
