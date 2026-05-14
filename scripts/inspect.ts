import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });
import { Client, Databases } from "node-appwrite";

const c = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const db = new Databases(c);

(async () => {
  for (const col of ["products", "orders", "categories"]) {
    const r = await db.listAttributes("usha_db", col);
    console.log(`\n=== ${col} (${r.total} attrs) ===`);
    for (const a of r.attributes as any[]) {
      console.log(`  ${a.key}  type=${a.type}  size=${a.size ?? "-"}  required=${a.required}  array=${a.array}  status=${a.status}`);
    }
  }
})().catch((e) => console.error(e?.message || e));
