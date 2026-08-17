import type { MetadataRoute } from "next";

import { supabase } from "@/lib/supabase";

const siteUrl = "https://mausamdesigner.com";

const staticRoutes = [
  "/",
  "/shop",
  "/about",
  "/contact",
  "/return-policy",
  "/shipping-policy",
  "/privacy-policy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const baseRoutes: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));

  try {
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from("products").select("id,created_at"),
      supabase.from("categories").select("slug,created_at"),
    ]);

    const productRoutes: MetadataRoute.Sitemap = (products ?? []).map(
      (product) => ({
        url: `${siteUrl}/products/${product.id}`,
        lastModified: product.created_at
          ? new Date(product.created_at)
          : now,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );

    const categoryRoutes: MetadataRoute.Sitemap = (categories ?? [])
      .filter((category) => category.slug)
      .map((category) => ({
        url: `${siteUrl}/categories/${category.slug}`,
        lastModified: category.created_at
          ? new Date(category.created_at)
          : now,
        changeFrequency: "daily",
        priority: 0.75,
      }));

    return [...baseRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Failed to build dynamic MAUSAM sitemap:", error);
    return baseRoutes;
  }
}
