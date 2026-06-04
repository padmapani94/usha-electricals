/**
 * Keep-alive endpoint hit by Vercel Cron to prevent the Appwrite
 * free-tier project from auto-pausing after 7 days of inactivity.
 *
 * Performs a real WRITE: creates a tiny placeholder document in the
 * categories collection and immediately deletes it. Writes are
 * unambiguous "activity" per Appwrite Cloud's tracker, so this
 * guarantees the inactivity timer resets every run.
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
  if (process.env.CRON_SECRET && auth !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  // Use the categories collection — smaller, less hot than products
  const colId = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID;

  if (!endpoint || !projectId || !apiKey || !dbId || !colId) {
    return NextResponse.json({ ok: false, error: "Appwrite env not configured" }, { status: 500 });
  }

  const headers = {
    "Content-Type": "application/json",
    "X-Appwrite-Project": projectId,
    "X-Appwrite-Key": apiKey,
  };

  const now = new Date().toISOString();
  let createdId: string | null = null;

  try {
    // 1. WRITE: create a tiny temporary document. Slug needs to be unique
    //    so we suffix with timestamp; same for name so they don't clash.
    const createRes = await fetch(`${endpoint}/databases/${dbId}/collections/${colId}/documents`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        documentId: "unique()",
        data: {
          name: "_keepalive",
          slug: `_keepalive-${Date.now()}`,
          description: `Auto-ping ${now}`,
        },
      }),
    });
    const createData = await createRes.json().catch(() => ({}));
    if (!createRes.ok) {
      console.error("[keepalive] create failed:", createRes.status, createData);
      return NextResponse.json({ ok: false, step: "create", status: createRes.status, error: createData }, { status: 502 });
    }
    createdId = (createData as any).$id;

    // 2. WRITE: delete the document we just made — leaves the collection clean.
    if (createdId) {
      const deleteRes = await fetch(`${endpoint}/databases/${dbId}/collections/${colId}/documents/${createdId}`, {
        method: "DELETE",
        headers,
        cache: "no-store",
      });
      if (!deleteRes.ok) {
        // Not fatal — the write already happened, the doc just lingers
        console.warn("[keepalive] delete failed (write succeeded though):", deleteRes.status);
      }
    }

    return NextResponse.json({
      ok: true,
      pingedAt: now,
      action: "create+delete",
      createdId,
    });
  } catch (err: any) {
    console.error("[keepalive] fetch failed:", err?.message || err);
    return NextResponse.json({ ok: false, error: err?.message || "fetch failed" }, { status: 502 });
  }
}
