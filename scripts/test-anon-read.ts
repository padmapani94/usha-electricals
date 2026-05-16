import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

// Use the browser SDK (no API key, anonymous)
import { Client, Databases, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
const db = new Databases(client);

(async () => {
  const res = await db.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!,
    [Query.limit(100)],
  );
  console.log(`\nAnonymous read returned ${res.total} products (page got ${res.documents.length}):\n`);
  for (const d of res.documents as any[]) {
    console.log(`  - ${d.name}  (perms: ${JSON.stringify(d.$permissions)})`);
  }
})().catch((e) => console.error(e?.message || e));
