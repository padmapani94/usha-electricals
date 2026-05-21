/**
 * Create an Appwrite user (email + password + name).
 * Usage: npx tsx scripts/create-user.ts <email> <password> <name>
 */
import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Users, ID } from "node-appwrite";

const [, , EMAIL, PASSWORD, ...nameParts] = process.argv;
const NAME = nameParts.join(" ");

if (!EMAIL || !PASSWORD || !NAME) {
  console.log("Usage: npx tsx scripts/create-user.ts <email> <password> <name>");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const users = new Users(client);

(async () => {
  const u = await users.create(ID.unique(), EMAIL, undefined, PASSWORD, NAME);
  console.log(`✓ Created user: ${u.name} <${u.email}> (id: ${u.$id})`);
})().catch((e) => { console.error(e?.message || e); process.exit(1); });
