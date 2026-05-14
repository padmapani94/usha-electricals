/* eslint-disable no-console */
import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });
import { Client, Databases, ID } from "node-appwrite";
import { products, categories } from "../src/lib/seed-data";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const productsCol = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!;
const categoriesCol = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;

if (!projectId || !apiKey) {
  console.error("Missing Appwrite credentials in .env");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const db = new Databases(client);

async function run() {
  console.log("→ Seeding categories…");
  for (const c of categories) {
    try {
      await db.createDocument(databaseId, categoriesCol, ID.unique(), c);
      console.log(`  ✓ ${c.name}`);
    } catch (e: any) {
      console.log(`  · skipped ${c.name}: ${e?.message}`);
    }
  }
  console.log("→ Seeding products…");
  for (const p of products) {
    try {
      const payload: any = { ...p, specs: typeof p.specs === "object" ? JSON.stringify(p.specs) : p.specs };
      await db.createDocument(databaseId, productsCol, ID.unique(), payload);
      console.log(`  ✓ ${p.name}`);
    } catch (e: any) {
      console.log(`  · skipped ${p.name}: ${e?.message}`);
    }
  }
  console.log("Done.");
}
run().catch((e) => { console.error(e); process.exit(1); });
