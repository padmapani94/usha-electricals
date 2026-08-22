/**
 * On-demand cache invalidation, called by the admin panel right after a product/
 * price change is saved. Public product pages (/, /products, /products/[slug]) are
 * cached for up to an hour (see src/lib/products.ts) to cut down Appwrite read
 * volume -- this endpoint is what makes admin edits show up immediately anyway,
 * instead of waiting out that cache window.
 *
 * No auth: worst case of misuse is a wasted re-render (forces a fresh Appwrite
 * read on next visit), not a data exposure or mutation risk, so it's not worth
 * plumbing a client-exposed secret through the admin bundle for this.
 */
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    revalidateTag("products");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/products/[slug]", "page");
    return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "revalidate failed" }, { status: 500 });
  }
}
