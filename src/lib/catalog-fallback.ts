import type { Category, Product } from "./types";

/**
 * Starter catalog used when Supabase is not configured (local preview, first deploy).
 * Mirrors supabase/seed.sql. Only details printed on actual packaging are included.
 */
export const FALLBACK_CATEGORIES: Category[] = [
  { slug: "lentils-pulses", name: "Lentils & pulses", nameAm: "ምስርና ጥራጥሬ" },
  { slug: "seeds", name: "Seeds", nameAm: "ዘሮች" },
  { slug: "grains", name: "Grains", nameAm: "እህሎች" },
  { slug: "beans", name: "Beans", nameAm: "ባቄላ" },
];
const cat = (slug: string) => FALLBACK_CATEGORIES.find((c) => c.slug === slug) ?? null;

export const FALLBACK_PRODUCTS: Product[] = [
  {
    slug: "red-lentils", name: "Red Lentils", nameAm: "ቀይ ምስር", packageName: "Football Red Lentils", category: cat("lentils-pulses"),
    shortDescription: "Split red lentils that cook down soft and quick. The base for misir wot, soups and everyday dal.",
    shortDescriptionAm: "በቀላሉ የሚበስልና የሚለሰልስ የተከካ ቀይ ምስር። ለምስር ወጥ፣ ለሾርባና ለዕለት ምግብ።", usesAm: ["ምስር ወጥ", "ሾርባ", "ወጥ", "ዳል"],
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
    slug: "brown-flaxseeds", name: "Brown Flaxseeds", nameAm: "ቡናማ ተልባ", packageName: "Brown Flax Seeds", category: cat("seeds"),
    shortDescription: "Whole brown flaxseeds for telba, baking, smoothies and breakfast bowls. Grind just before use for the best flavor.",
    shortDescriptionAm: "ለተልባ መጠጥ፣ ለዳቦ፣ ለስሙዚና ለቁርስ የሚሆን ሙሉ ቡናማ ተልባ። ለተሻለ ጣዕም ከመጠቀምዎ በፊት ይፍጩት።", usesAm: ["የተልባ መጠጥ", "ዳቦና መጋገሪያ", "ስሙዚ", "አጥሚት"],
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
    slug: "split-fava-beans", name: "Split Fava Beans", nameAm: "የተከካ ባቄላ", packageName: "Split Fava Beans", category: cat("beans"),
    shortDescription: "Split broad beans with the skins removed, ready for ful, hearty soups and slow stews.",
    shortDescriptionAm: "ቅርፊቱ የተላጠ የተከካ ባቄላ፤ ለፉል፣ ለሾርባና ለወጥ ዝግጁ።", usesAm: ["ፉል", "ሾርባ", "ወጥ"],
    geezName: "ባቄላ", geezLatin: "bakela", uses: ["Ful", "Soups", "Stews"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "fava", isFeatured: true,
    variants: [{ label: "2 LB", netWeight: "2 LB (907 g)", upc: null, isDefault: true }],
    images: [{ src: "/images/fava-concept.webp", kind: "concept", alt: "Package design concept for ETHIO split fava beans 2 lb" }],
  },
  {
    slug: "bulgur-wheat", name: "Bulgur Wheat", nameAm: "ቡልጉር ስንዴ", packageName: "Bulgur Wheat", category: cat("grains"),
    shortDescription: "Cracked wheat for kinche, salads and pilafs. Ask us about grind and package sizes.",
    shortDescriptionAm: "ለቅንጬ፣ ለሰላጣና ለፒላፍ የሚሆን የተፈተገ ስንዴ። ስለ ፍተጋውና ስለ ማሸጊያ መጠኑ ይጠይቁን።", usesAm: ["ቅንጬ", "ሰላጣ", "ፒላፍ"],
    geezName: null, geezLatin: null, uses: ["Kinche", "Salads", "Pilaf"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "bulgur", isFeatured: false,
    variants: [], images: [],
  },
  {
    slug: "beans", name: "Beans", nameAm: "ቦሎቄ", packageName: "Beans", category: cat("beans"),
    shortDescription: "Dried beans for home cooking and food service. Ask which varieties are in stock.",
    shortDescriptionAm: "ለቤት ማብሰያና ለምግብ ቤቶች የደረቀ ቦሎቄ። የትኞቹ ዓይነቶች እንዳሉ ይጠይቁ።", usesAm: ["ወጥ", "ሾርባ", "ሰላጣ"],
    geezName: null, geezLatin: null, uses: ["Stews", "Soups", "Salads"],
    ingredients: null, nutrition: null, nutritionVerified: false, grain: "bean", isFeatured: false,
    variants: [], images: [],
  },
];
