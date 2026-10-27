import "server-only";
import { cache } from "react";
import { createAnonClient } from "@/lib/supabase/admin";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/lib/catalog-fallback";
import { publicEnv } from "@/lib/env";
import type { Category, GrainStyle, ImageKind, NutritionFacts, Product } from "@/lib/types";

type Row = {
  id: string; slug: string; name: string; package_name: string | null; short_description: string | null;
  geez_name: string | null; geez_latin: string | null; uses: string[] | null; ingredients: string | null;
  nutrition: NutritionFacts | null; nutrition_verified: boolean; grain_style: GrainStyle; is_featured: boolean; sort_order: number;
  product_categories: { id: string; slug: string; name: string } | null;
  product_variants: { id: string; label: string; net_weight: string | null; upc: string | null; is_default: boolean; is_active: boolean; sort_order: number }[];
  product_images: { id: string; src: string; alt: string; kind: ImageKind; sort_order: number }[];
};

export function imageUrl(src: string): string {
  if (src.startsWith("/") || src.startsWith("http")) return src;
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/product-images/${src}`;
}

export function mapProduct(r: Row): Product {
  return {
    id: r.id, slug: r.slug, name: r.name, packageName: r.package_name,
    category: r.product_categories ? { id: r.product_categories.id, slug: r.product_categories.slug, name: r.product_categories.name } : null,
    shortDescription: r.short_description ?? "", geezName: r.geez_name, geezLatin: r.geez_latin, uses: r.uses ?? [],
    ingredients: r.ingredients, nutrition: r.nutrition_verified ? r.nutrition : null, nutritionVerified: r.nutrition_verified,
    grain: r.grain_style, isFeatured: r.is_featured,
    variants: [...(r.product_variants ?? [])].filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({ id: v.id, label: v.label, netWeight: v.net_weight, upc: v.upc, isDefault: v.is_default })),
    images: [...(r.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ id: i.id, src: imageUrl(i.src), alt: i.alt, kind: i.kind })),
  };
}

const SELECT = "id, slug, name, package_name, short_description, geez_name, geez_latin, uses, ingredients, nutrition, nutrition_verified, grain_style, is_featured, sort_order, product_categories(id, slug, name), product_variants(id, label, net_weight, upc, is_default, is_active, sort_order), product_images(id, src, alt, kind, sort_order)";

export const getProducts = cache(async (): Promise<Product[]> => {
  const sb = createAnonClient();
  if (!sb) return FALLBACK_PRODUCTS;
  const { data, error } = await sb.from("products").select(SELECT).eq("is_active", true).order("sort_order");
  if (error) {
    console.error("[catalog] products query failed", error.message);
    return FALLBACK_PRODUCTS;
  }
  return (data as unknown as Row[]).map(mapProduct);
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const sb = createAnonClient();
  if (!sb) return FALLBACK_CATEGORIES;
  const { data, error } = await sb.from("product_categories").select("id, slug, name").order("sort_order");
  if (error) return FALLBACK_CATEGORIES;
  return data as Category[];
});
