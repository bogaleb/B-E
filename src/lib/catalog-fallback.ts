import type { Category, Product } from "./types";

/**
 * Starter catalog used when Supabase is not configured (local preview, first deploy).
 * Mirrors supabase/seed.sql. Only details printed on actual packaging are included.
 */
export const FALLBACK_CATEGORIES: Category[] = [
  { slug: "lentils-pulses", name: "Lentils & pulses" },
  { slug: "seeds", name: "Seeds" },
  { slug: "grains", name: "Grains" },
  { slug: "beans", name: "Beans" },
];
const cat = (slug: string) => FALLBACK_CATEGORIES.find((c) => c.slug === slug) ?? null;

export const FALLBACK_PRODUCTS: Product[] = [
  {
    slug: "red-lentils", name: "Red Lentils", packageName: "Football Red Lentils", category: cat("lentils-pulses"),
    shortDescription: "Split red lentils that cook down soft and quick. The base for misir wot, soups and everyday dal.",
    geezName: "ምስር", geezLatin: "misir", uses: ["Misir wot", "Soups", "Stews", "Dal"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "lentil", isFeatured: true,
    variants: [{ label: "2 LB", netWeight: "2 LB", upc: "7 41654 43996 8", isDefault: true }],
    images: [
      { src: "/images/lentils-photo.webp", kind: "actual", alt: "ETHIO Football Red Lentils 2 lb bag on a store shelf" },
      { src: "/images/lentils-label.webp", kind: "actual", alt: "Close-up of the ETHIO red lentils label with nutrition panel" },
      { src: "/images/lentils-concept.webp", kind: "concept", alt: "Package design concept for ETHIO split red lentils" },
    ],
  },
  {
    slug: "brown-flaxseeds", name: "Brown Flaxseeds", packageName: "Brown Flax Seeds", category: cat("seeds"),
    shortDescription: "Whole brown flaxseeds for telba, baking, smoothies and breakfast bowls. Grind just before use for the best flavor.",
    geezName: "ተልባ", geezLatin: "telba", uses: ["Telba drink", "Bread and baking", "Smoothies", "Oatmeal"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "flax", isFeatured: true,
    variants: [{ label: "2 LB", netWeight: "2 LB", upc: "7 41654 44001 8", isDefault: true }],
    images: [
      { src: "/images/flax-photo.webp", kind: "actual", alt: "ETHIO Brown Flax Seeds 2 lb bag held in a store aisle" },
      { src: "/images/flax-label.webp", kind: "actual", alt: "Close-up of the ETHIO brown flax seeds label" },
      { src: "/images/flax-concept-front.webp", kind: "concept", alt: "Package design concept for ETHIO flax seeds, front" },
      { src: "/images/flax-concept-back.webp", kind: "concept", alt: "Package design concept for ETHIO flax seeds, back" },
    ],
  },
  {
    slug: "split-fava-beans", name: "Split Fava Beans", packageName: "Split Fava Beans", category: cat("beans"),
    shortDescription: "Split broad beans with the skins removed, ready for ful, hearty soups and slow stews.",
    geezName: "ባቄላ", geezLatin: "bakela", uses: ["Ful", "Soups", "Stews"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "fava", isFeatured: true,
    variants: [{ label: "2 LB", netWeight: "2 LB (907 g)", upc: null, isDefault: true }],
    images: [{ src: "/images/fava-concept.webp", kind: "concept", alt: "Package design concept for ETHIO split fava beans 2 lb" }],
  },
  {
    slug: "bulgur-wheat", name: "Bulgur Wheat", packageName: "Bulgur Wheat", category: cat("grains"),
    shortDescription: "Cracked wheat for kinche, salads and pilafs. Ask us about grind and package sizes.",
    geezName: null, geezLatin: null, uses: ["Kinche", "Salads", "Pilaf"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "bulgur", isFeatured: false,
    variants: [], images: [],
  },
  {
    slug: "beans", name: "Beans", packageName: "Beans", category: cat("beans"),
    shortDescription: "Dried beans for home cooking and food service. Ask which varieties are in stock.",
    geezName: null, geezLatin: null, uses: ["Stews", "Soups", "Salads"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "bean", isFeatured: false,
    variants: [], images: [],
  },
];
