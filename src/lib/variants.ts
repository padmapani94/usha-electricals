import type { Product, ProductVariant } from "./types";

export function parseVariants(product: Pick<Product, "variants">): ProductVariant[] {
  if (!product.variants) return [];
  if (Array.isArray(product.variants)) return product.variants;
  try {
    const parsed = JSON.parse(product.variants);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** The variant with the lowest price — used as the "from ₹X" headline price. */
export function cheapestVariant(variants: ProductVariant[]): ProductVariant | null {
  if (variants.length === 0) return null;
  return variants.reduce((min, v) => (v.price < min.price ? v : min), variants[0]);
}
