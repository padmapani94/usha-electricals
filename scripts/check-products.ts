import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Databases, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const db = new Databases(client);

(async () => {
  const res = await db.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!,
    [Query.orderDesc("$createdAt"), Query.limit(5)],
  );
  console.log(`\nTotal: ${res.total}\n`);
  for (const d of res.documents as any[]) {
    console.log(`name="${d.name}"  slug=${d.slug}  category=${d.category}  published=${d.published}  stock=${d.stock}  price=${d.price}  images=${JSON.stringify(d.images)}`);
    console.log(`  $permissions=${JSON.stringify(d.$permissions)}`);
  }
})().catch((e) => console.error(e?.message || e));
