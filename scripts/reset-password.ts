/**
 * Reset an Appwrite user's password by email.
 * Usage: npx tsx scripts/reset-password.ts <email> <new-password>
 */
import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Users, Query } from "node-appwrite";

const [, , EMAIL, NEW_PASSWORD] = process.argv;
if (!EMAIL || !NEW_PASSWORD) {
  console.log("Usage: npx tsx scripts/reset-password.ts <email> <new-password>");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const users = new Users(client);

(async () => {
  const found = await users.list([Query.equal("email", EMAIL), Query.limit(1)]);
  if (found.total === 0) {
    console.log(`No user with email ${EMAIL}`);
    process.exit(1);
  }
  const u = (found.users as any[])[0];
  console.log(`Found user: ${u.name} (${u.$id})`);
  await users.updatePassword(u.$id, NEW_PASSWORD);
  console.log("✓ Password updated.");
})().catch((e) => { console.error(e?.message || e); process.exit(1); });
