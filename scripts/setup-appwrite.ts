/* eslint-disable no-console */
import { config } from "dotenv";
import { existsSync } from "fs";
config({ path: existsSync(".env.local") ? ".env.local" : ".env" });
import { Client, Databases, Storage, ID, Permission, Role } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "usha_db";
const productsCol = process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID || "products";
const ordersCol = process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || "orders";
const categoriesCol = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || "categories";
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "product_images";

if (!projectId || !apiKey) {
  console.error("❌ Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_KEY in .env");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const db = new Databases(client);
const storage = new Storage(client);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const out = await fn();
    console.log(`  ✓ ${label}`);
    return out;
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (msg.includes("already exists") || msg.includes("attribute_already_exists") || e?.code === 409) {
      console.log(`  · ${label} (exists)`);
      return null;
    }
    console.log(`  ✗ ${label}: ${msg}`);
    return null;
  }
}

async function ensureDatabase() {
  console.log("\n→ Database");
  await safe(`database ${databaseId}`, () => db.create(databaseId, "Usha DB"));
}

async function ensureCollection(id: string, name: string, perms: string[]) {
  console.log(`\n→ Collection ${name}`);
  await safe(`collection ${id}`, () =>
    db.createCollection(databaseId, id, name, perms, false, true),
  );
}

async function attr(col: string, type: string, key: string, required: boolean, opts: any = {}) {
  return safe(`${col}.${key} (${type}${opts.array ? "[]" : ""})`, async () => {
    if (type === "string") {
      return db.createStringAttribute(databaseId, col, key, opts.size ?? 256, required, opts.default, !!opts.array);
    }
    if (type === "integer") {
      return db.createIntegerAttribute(databaseId, col, key, required, opts.min, opts.max, opts.default, !!opts.array);
    }
    if (type === "boolean") {
      return db.createBooleanAttribute(databaseId, col, key, required, opts.default, !!opts.array);
    }
    throw new Error("Unknown type " + type);
  });
}

async function setupProducts() {
  await ensureCollection(productsCol, "Products", [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]);

  await attr(productsCol, "string", "name", true, { size: 256 });
  await attr(productsCol, "string", "slug", true, { size: 256 });
  await attr(productsCol, "string", "description", true, { size: 5000 });
  await attr(productsCol, "string", "category", true, { size: 64 });
  await attr(productsCol, "string", "brand", false, { size: 128 });
  await attr(productsCol, "integer", "price", true, { min: 0 });
  await attr(productsCol, "integer", "mrp", false, { min: 0 });
  await attr(productsCol, "integer", "stock", true, { min: 0 });
  await attr(productsCol, "string", "images", true, { size: 512, array: true });
  await attr(productsCol, "string", "specs", false, { size: 5000 });
  await attr(productsCol, "boolean", "featured", false, { default: false });
  await attr(productsCol, "boolean", "published", false, { default: true });
  await attr(productsCol, "string", "tags", false, { size: 64, array: true });
  await attr(productsCol, "string", "metaTitle", false, { size: 70 });
  await attr(productsCol, "string", "metaDescription", false, { size: 300 });
  await attr(productsCol, "string", "imageAlt", false, { size: 160 });

  await safe("products.brand_idx (index)", () =>
    db.createIndex(databaseId, productsCol, "brand_idx", "key" as any, ["brand"], ["ASC"] as any),
  );
  await safe("products.name_fulltext_idx (index)", () =>
    db.createIndex(databaseId, productsCol, "name_fulltext_idx", "fulltext" as any, ["name"]),
  );
}

async function setupOrders() {
  await ensureCollection(ordersCol, "Orders", [
    Permission.create(Role.users()),
    // Reads & updates handled via app logic + API key
  ]);

  await attr(ordersCol, "string", "userId", true, { size: 64 });
  await attr(ordersCol, "string", "items", true, { size: 4000 });
  await attr(ordersCol, "integer", "total", true, { min: 0 });
  await attr(ordersCol, "string", "status", true, { size: 32 });
  await attr(ordersCol, "string", "shippingAddress", true, { size: 1500 });
  await attr(ordersCol, "string", "paymentMethod", false, { size: 32 });
}

async function setupCategories() {
  await ensureCollection(categoriesCol, "Categories", [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]);

  await attr(categoriesCol, "string", "name", true, { size: 128 });
  await attr(categoriesCol, "string", "slug", true, { size: 128 });
  await attr(categoriesCol, "string", "description", false, { size: 500 });
  await attr(categoriesCol, "string", "image", false, { size: 512 });
}

async function setupBucket() {
  console.log("\n→ Storage bucket");
  await safe(`bucket ${bucketId}`, () =>
    storage.createBucket(
      bucketId,
      "Product Images",
      [Permission.read(Role.any()), Permission.create(Role.users()), Permission.update(Role.users()), Permission.delete(Role.users())],
      undefined, // fileSecurity
      true, // enabled
      undefined, // maximumFileSize
      ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    ),
  );
}

async function run() {
  console.log(`Setting up Appwrite project ${projectId} at ${endpoint}\n`);
  await ensureDatabase();
  await setupProducts();
  await sleep(1000);
  await setupOrders();
  await sleep(1000);
  await setupCategories();
  await sleep(500);
  await setupBucket();
  console.log("\n✅ Setup complete.");
  console.log("Run `npm run seed` next to push the 21 starter products.");
}

run().catch((e) => { console.error(e); process.exit(1); });
