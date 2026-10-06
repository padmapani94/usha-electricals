/**
 * On-demand cache invalidation, called by the admin panel right after a product/
 * price change is saved. Public product pages (/, /products, /products/[slug]) are
 * cached for up to an hour (see src/lib/products.ts) to cut down Appwrite read
 * volume -- this endpoint is what makes admin edits show up immediately anyway,
 * instead of waiting out that cache window.
 *
 * Scoped to the specific product that changed (pass { slug }) rather than busting
 * every product's cached data on every save. With an actively managed ~480-product
 * catalog, a blanket revalidateTag("products") fired on every single edit was
 * invalidating the ENTIRE site's cached product data each time -- effectively
 * defeating the 1h cache window whenever saves happened more than once an hour,
 * which they routinely did. Only the general list/homepage data (a handful of
 * cache entries) is revalidated unconditionally; a specific product's own cached
 * data is only touched when its slug is passed.
 *
 * No auth: worst case of misuse is a wasted re-render (forces a fresh Appwrite
 * read on next visit), not a data exposure or mutation risk, so it's not worth
 * plumbing a client-exposed secret through the admin bundle for this.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PRODUCTS_LIST_TAG, productTag } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as { slug?: string }));
    const slug: string | undefined = body?.slug;

    revalidateTag(PRODUCTS_LIST_TAG);
    revalidatePath("/");
    revalidatePath("/products");

    if (slug) {
      revalidateTag(productTag(slug));
      revalidatePath(`/products/${slug}`);
    }

    return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString(), slug: slug ?? null });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "revalidate failed" }, { status: 500 });
  }
}
