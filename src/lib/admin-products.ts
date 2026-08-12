"use client";
import { databases, appwriteConfig, ID, Query } from "./appwrite";
import type { Product, ProductVariant } from "./types";
import { parseVariants, cheapestVariant } from "./variants";

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

/**
 * Runs a price transform on a product: if it has size variants, applies the transform to
 * every variant's price and recomputes the derived base price/mrp/stock (cheapest variant,
 * summed stock) so they stay in sync; otherwise applies it directly to the flat product
 * price. Keeps every bulk tool below working correctly for both variant and non-variant
 * products without duplicating this branching in each one.
 */
function applyToProductOrVariants(
  p: Product,
  transformFlat: (p: Product) => Partial<Product>,
  transformVariant: (v: ProductVariant) => ProductVariant,
): Partial<Product> {
  const variants = parseVariants(p);
  if (variants.length === 0) return transformFlat(p);

  const nextVariants = variants.map(transformVariant);
  const cheapest = cheapestVariant(nextVariants)!;
  const totalStock = nextVariants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  return {
    variants: JSON.stringify(nextVariants),
    price: cheapest.price,
    mrp: cheapest.mrp,
    stock: totalStock,
  };
}

/** Increase or decrease the price of every product of a brand, by percent or a fixed rupee amount. Leaves `mrp` untouched. Applies per-size for products with variants. */
export async function bulkAdjustPriceByBrand(
  brand: string,
  direction: "increase" | "decrease",
  mode: "percent" | "fixed",
  value: number,
): Promise<{ updated: number }> {
  const items = await getProductsByBrand(brand);
  const sign = direction === "increase" ? 1 : -1;
  const adjust = (price: number) => {
    const delta = mode === "percent" ? price * (value / 100) : value;
    return Math.max(1, Math.round(price + sign * delta));
  };
  await Promise.all(
    items.filter((p) => p.$id).map((p) => {
      const update = applyToProductOrVariants(
        p,
        (prod) => ({ price: adjust(prod.price) }),
        (v) => ({ ...v, price: adjust(v.price) }),
      );
      return updateProduct(p.$id!, update);
    }),
  );
  return { updated: items.length };
}

/** Apply a % discount to every product of a brand. Uses the existing `mrp` as the baseline if one is already set (so re-applying doesn't compound), otherwise anchors `mrp` to the current price. Applies per-size for products with variants. */
export async function bulkApplyDiscountByBrand(brand: string, discountPercent: number): Promise<{ updated: number }> {
  const items = await getProductsByBrand(brand);
  const discount = (price: number, mrp?: number) => {
    const baseline = mrp && mrp > 0 ? mrp : price;
    return { mrp: baseline, price: Math.max(1, Math.round(baseline * (1 - discountPercent / 100))) };
  };
  await Promise.all(
    items.filter((p) => p.$id).map((p) => {
      const update = applyToProductOrVariants(
        p,
        (prod) => discount(prod.price, prod.mrp),
        (v) => ({ ...v, ...discount(v.price, v.mrp) }),
      );
      return updateProduct(p.$id!, update);
    }),
  );
  return { updated: items.length };
}

/** Remove any active discount from every product of a brand — resets price back to mrp. Clears per-size for products with variants (only sizes that actually have an active discount). */
export async function bulkClearDiscountByBrand(brand: string): Promise<{ updated: number }> {
  const items = await getProductsByBrand(brand);
  const eligible = items.filter((p) => {
    if (!p.$id) return false;
    const variants = parseVariants(p);
    if (variants.length > 0) return variants.some((v) => v.mrp && v.mrp > v.price);
    return !!(p.mrp && p.mrp > p.price);
  });
  await Promise.all(
    eligible.map((p) => {
      const update = applyToProductOrVariants(
        p,
        (prod) => ({ price: prod.mrp }),
        (v) => ({ ...v, price: v.mrp && v.mrp > 0 ? v.mrp : v.price }),
      );
      return updateProduct(p.$id!, update);
    }),
  );
  return { updated: eligible.length };
}
