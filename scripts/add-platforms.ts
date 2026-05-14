import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;

const platforms = [
  { name: "Production Domain", hostname: "ushaelectricals.co.in" },
  { name: "Production WWW", hostname: "www.ushaelectricals.co.in" },
];

async function addPlatform(name: string, hostname: string) {
  const res = await fetch(`${endpoint}/projects/${projectId}/platforms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
      "X-Appwrite-Mode": "admin",
    },
    body: JSON.stringify({
      platformId: "unique()",
      type: "web",
      name,
      hostname,
    }),
  });
  const text = await res.text();
  if (res.ok) {
    console.log(`  ✓ ${hostname}`);
  } else {
    console.log(`  · ${hostname}: ${res.status} ${text.slice(0, 200)}`);
  }
}

(async () => {
  console.log(`\n→ Adding Web platforms to project ${projectId}\n`);
  for (const p of platforms) {
    await addPlatform(p.name, p.hostname);
  }
})().catch((e) => console.error(e?.message || e));
