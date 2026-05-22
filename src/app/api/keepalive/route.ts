/**
 * Keep-alive endpoint hit by Vercel Cron to prevent the Appwrite
 * free-tier project from auto-pausing after 7 days of inactivity.
 *
 * Makes a tiny read against the products collection. Returns the
 * document count + timestamp so we can spot-check it manually.
 *
 * Secured by Authorization: Bearer <CRON_SECRET>. Vercel Cron sets
 * this header automatically when triggering the route on a schedule.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel sets this header on cron invocations: "Bearer <CRON_SECRET>"
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  // In dev (no secret set), allow it through. In prod, require the header.
  if (process.env.CRON_SECRET && auth !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const colId = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID;

  if (!endpoint || !projectId || !apiKey || !dbId || !colId) {
    return NextResponse.json({ ok: false, error: "Appwrite env not configured" }, { status: 500 });
  }

  const url = `${endpoint}/databases/${dbId}/collections/${colId}/documents?queries[]=${encodeURIComponent(JSON.stringify({ method: "limit", values: [1] }))}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[keepalive] Appwrite returned", res.status, data);
      return NextResponse.json({ ok: false, status: res.status, error: data }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      pingedAt: new Date().toISOString(),
      productsCount: (data as any).total ?? null,
    });
  } catch (err: any) {
    console.error("[keepalive] fetch failed:", err?.message || err);
    return NextResponse.json({ ok: false, error: err?.message || "fetch failed" }, { status: 502 });
  }
}
