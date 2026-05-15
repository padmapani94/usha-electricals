/* eslint-disable no-console */
import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Databases, ID, Query } from "node-appwrite";
import { products } from "../src/lib/seed-data";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const colId = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;

async function main() {
  // 1. Delete all existing products
  let total = 0;
  let cursor: string | undefined;
  while (true) {
    const q: any[] = [Query.limit(100)];
    if (cursor) q.push(Query.cursorAfter(cursor));
    const res = await db.listDocuments(dbId, colId, q);
    if (res.documents.length === 0) break;
    for (const d of res.documents as any[]) {
      await db.deleteDocument(dbId, colId, d.$id);
      total += 1;
    }
    cursor = res.documents[res.documents.length - 1].$id;
    if (res.documents.length < 100) break;
  }
  console.log(`\n→ Deleted ${total} existing products`);

  // 2. Insert new products
  console.log(`\n→ Inserting ${products.length} new products`);
  for (const p of products) {
    const payload: any = { ...p, specs: typeof p.specs === "object" ? JSON.stringify(p.specs) : p.specs };
    try {
      await db.createDocument(dbId, colId, ID.unique(), payload);
      console.log(`  ✓ ${p.name}`);
    } catch (e: any) {
      console.log(`  ✗ ${p.name}: ${e?.message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
