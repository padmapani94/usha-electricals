/* eslint-disable no-console */
import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Databases, ID, Query } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const db = new Databases(client);

const NEW = [
  { name: "Testing Equipment", slug: "testing-equipment", description: "Insulation testers, earth testers, megohmmeters and load test kits." },
  { name: "Measuring Instruments", slug: "measuring-instruments", description: "Multimeters, clamp meters, calibrators and oscilloscopes for site & lab." },
  { name: "Electrical", slug: "electrical", description: "Switches, MCBs, RCCBs, contactors, relays and general electrical accessories." },
  { name: "Power Tools", slug: "power-tools", description: "Drills, grinders, impact drivers and corded/cordless power tools for industrial use." },
  { name: "Hand Tools", slug: "hand-tools", description: "Pliers, screwdrivers, wrench sets, cable cutters and electrician hand tools." },
];

async function main() {
  console.log(`\n→ Adding ${NEW.length} categories to ${collectionId}\n`);
  // Fetch existing slugs to avoid duplicates
  const existing = await db.listDocuments(databaseId, collectionId, [Query.limit(200)]);
  const existingSlugs = new Set((existing.documents as any[]).map((d) => d.slug));

  for (const c of NEW) {
    if (existingSlugs.has(c.slug)) {
      console.log(`  · ${c.name} (already exists)`);
      continue;
    }
    try {
      await db.createDocument(databaseId, collectionId, ID.unique(), c);
      console.log(`  ✓ ${c.name}`);
    } catch (e: any) {
      console.log(`  ✗ ${c.name}: ${e?.message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
