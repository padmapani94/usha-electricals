import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

import { Client, Users } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
const users = new Users(client);

(async () => {
  const res = await users.list();
  console.log(`Total users: ${res.total}\n`);
  for (const u of res.users as any[]) {
    console.log(`  - ${u.name}  <${u.email}>  id=${u.$id}`);
  }
})().catch((e) => { console.error(e?.message || e); process.exit(1); });
