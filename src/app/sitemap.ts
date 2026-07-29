import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/products";
import { categories as seedCategories } from "@/lib/seed-data";

const SITE_URL = "https://ushaelectricals.co.in";

export const revalidate = 3600; // 1 hour — sitemap doesn't need to be instant

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Category landing pages (search-filter URLs)
  const categoryRoutes: MetadataRoute.Sitemap = seedCategories.map((c) => ({
    url: `${SITE_URL}/products?category=${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Individual product pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await listProducts({});
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.$createdAt ? new Date(p.$createdAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // If Appwrite is unreachable, the sitemap just omits product pages
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
