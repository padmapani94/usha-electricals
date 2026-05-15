/* eslint-disable no-console */
import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Databases, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(client);
const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const colId = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;

const KEEP = new Set([
  "testing-equipment",
  "measuring-instruments",
  "electrical",
  "power-tools",
  "hand-tools",
]);

async function main() {
  const res = await db.listDocuments(dbId, colId, [Query.limit(200)]);
  console.log(`\n→ Found ${res.total} categories\n`);
  for (const d of res.documents as any[]) {
    if (KEEP.has(d.slug)) {
      console.log(`  · keeping ${d.name}`);
    } else {
      try {
        await db.deleteDocument(dbId, colId, d.$id);
        console.log(`  ✓ deleted ${d.name}`);
      } catch (e: any) {
        console.log(`  ✗ ${d.name}: ${e?.message}`);
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
