/**
 * Public, unauthenticated read-only health check: attempts a minimal live Appwrite
 * database read and reports whether it succeeded. No sensitive data returned (no
 * product data, no credentials) -- just a boolean + error type, so it's safe to
 * expose without auth. Built specifically to let an external check (e.g. a
 * scheduled routine with no access to this project's local secrets) verify
 * whether the Appwrite free-tier read quota has reset, without needing to hand
 * that routine any Appwrite credentials at all.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const colId = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID;

  if (!endpoint || !projectId || !apiKey || !dbId || !colId) {
    return NextResponse.json({ ok: false, error: "Appwrite env not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${endpoint}/databases/${dbId}/collections/${colId}/documents?queries[]=${encodeURIComponent(JSON.stringify({ method: "limit", values: [1] }))}`,
      {
        headers: { "X-Appwrite-Project": projectId, "X-Appwrite-Key": apiKey },
        cache: "no-store",
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        checkedAt: new Date().toISOString(),
        status: res.status,
        errorType: (data as any)?.type,
        errorMessage: (data as any)?.message,
      });
    }
    return NextResponse.json({
      ok: true,
      checkedAt: new Date().toISOString(),
      totalProducts: (data as any)?.total,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, checkedAt: new Date().toISOString(), error: err?.message || "fetch failed" });
  }
}
