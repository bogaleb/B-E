import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { publicEnv } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl;
  const pages = ["", "/products", "/wholesale", "/about", "/contact", "/faq", "/privacy", "/terms"].map((p) => ({
    url: base + p, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7,
  }));
  const products = (await getProducts()).map((p) => ({ url: `${base}/products/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  return [...pages, ...products];
}
