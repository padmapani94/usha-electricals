"use client";
import { databases, appwriteConfig, ID, Query } from "./appwrite";
import type { Product } from "./types";

export async function createProduct(data: Omit<Product, "$id" | "$createdAt">) {
  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    ID.unique(),
    {
      ...data,
      specs: typeof data.specs === "object" ? JSON.stringify(data.specs) : data.specs,
    },
  );
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const payload: any = { ...data };
  if (payload.specs && typeof payload.specs === "object") payload.specs = JSON.stringify(payload.specs);
  delete payload.$id; delete payload.$createdAt;
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    id,
    payload,
  );
}

export async function deleteProduct(id: string) {
  return databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    id,
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      id,
    );
    return doc as unknown as Product;
  } catch {
    return null;
  }
}

async function getProductsByBrand(brand: string): Promise<Product[]> {
  const PAGE_SIZE = 100;
  const documents: any[] = [];
  let cursor: string | undefined;
  while (documents.length < 5000) {
    const queries = [Query.equal("brand", brand), Query.limit(PAGE_SIZE)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.productsCollectionId, queries);
    documents.push(...res.documents);
    if (res.documents.length < PAGE_SIZE) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }
  return documents as unknown as Product[];
}

/** Increase or decrease the price of every product of a brand, by percent or a fixed rupee amount. Leaves `mrp` untouched. */
export async function bulkAdjustPriceByBrand(
  brand: string,
  direction: "increase" | "decrease",
  mode: "percent" | "fixed",
  value: number,
): Promise<{ updated: number }> {
  const items = await getProductsByBrand(brand);
  const sign = direction === "increase" ? 1 : -1;
  await Promise.all(
    items.filter((p) => p.$id).map((p) => {
      const delta = mode === "percent" ? p.price * (value / 100) : value;
      const newPrice = Math.max(1, Math.round(p.price + sign * delta));
      return updateProduct(p.$id!, { price: newPrice });
    }),
  );
  return { updated: items.length };
}

/** Apply a % discount to every product of a brand. Uses the existing `mrp` as the baseline if one is already set (so re-applying doesn't compound), otherwise anchors `mrp` to the current price. */
export async function bulkApplyDiscountByBrand(brand: string, discountPercent: number): Promise<{ updated: number }> {
  const items = await getProductsByBrand(brand);
  await Promise.all(
    items.filter((p) => p.$id).map((p) => {
      const baseline = p.mrp && p.mrp > 0 ? p.mrp : p.price;
      const newPrice = Math.max(1, Math.round(baseline * (1 - discountPercent / 100)));
      return updateProduct(p.$id!, { mrp: baseline, price: newPrice });
    }),
  );
  return { updated: items.length };
}

/** Remove any active discount from every product of a brand — resets price back to mrp. */
export async function bulkClearDiscountByBrand(brand: string): Promise<{ updated: number }> {
  const items = await getProductsByBrand(brand);
  const discounted = items.filter((p) => p.$id && p.mrp && p.mrp > p.price);
  await Promise.all(discounted.map((p) => updateProduct(p.$id!, { price: p.mrp })));
  return { updated: discounted.length };
}
