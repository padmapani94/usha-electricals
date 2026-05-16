import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Databases } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const db = new Databases(client);

(async () => {
  const col = await db.getCollection(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!,
  );
  console.log("name:", col.name);
  console.log("documentSecurity:", (col as any).documentSecurity);
  console.log("permissions:", (col as any).$permissions);
  console.log("permissions (col):", (col as any).permissions);
})().catch((e) => console.error(e?.message || e));
