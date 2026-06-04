import type { MetadataRoute } from "next";

const SITE_URL = "https://ushaelectricals.co.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/login", "/cart", "/checkout"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
