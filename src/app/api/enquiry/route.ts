import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EnquiryBody = {
  items: Array<{ productId: string; name: string; slug: string; price: number; quantity: number; image?: string }>;
  total: number;
  fullName: string;
  phone: string;
  notes?: string;
  method: "whatsapp" | "email";
};

export async function POST(req: NextRequest) {
  let body: EnquiryBody;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.fullName?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const colId = process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID;

  if (!endpoint || !projectId || !apiKey || !dbId || !colId) {
    // Appwrite not configured — just succeed silently so the client still opens WhatsApp/Email
    return NextResponse.json({ ok: true, logged: false });
  }

  const doc = {
    userId: "anonymous",
    items: JSON.stringify(body.items.map((i) => ({
      productId: i.productId, name: i.name, slug: i.slug, price: i.price, quantity: i.quantity, image: i.image,
    }))).slice(0, 4000),
    total: Math.round(Number(body.total) || 0),
    status: "received",
    shippingAddress: JSON.stringify({
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      notes: body.notes?.trim() ?? "",
    }).slice(0, 1500),
    paymentMethod: body.method === "email" ? "email" : "whatsapp",
  };

  try {
    const res = await fetch(`${endpoint}/databases/${dbId}/collections/${colId}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
      body: JSON.stringify({ documentId: "unique()", data: doc }),
      cache: "no-store",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[/api/enquiry] Appwrite create failed:", res.status, txt.slice(0, 200));
      return NextResponse.json({ ok: true, logged: false });
    }
    return NextResponse.json({ ok: true, logged: true });
  } catch (e: any) {
    console.error("[/api/enquiry] fetch failed:", e?.message || e);
    return NextResponse.json({ ok: true, logged: false });
  }
}
