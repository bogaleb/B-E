import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const isPreview = process.env.VERCEL_ENV === "preview";
  return {
    rules: isPreview ? [{ userAgent: "*", disallow: "/" }] : [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/inquiry", "/order"] }],
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
