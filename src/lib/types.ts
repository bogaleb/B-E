export type GrainStyle = "lentil" | "flax" | "fava" | "bulgur" | "bean";
export type ImageKind = "actual" | "concept";

export interface ProductImage {
  id?: string;
  src: string;
  alt: string;
  kind: ImageKind;
}

export interface ProductVariant {
  id?: string;
  label: string;
  netWeight: string | null;
  upc: string | null;
  isDefault: boolean;
}

export interface Category {
  id?: string;
  slug: string;
  name: string;
  nameAm?: string | null;
}

export interface Product {
  id?: string;
  slug: string;
  name: string;
  nameAm: string | null;
  packageName: string | null;
  category: Category | null;
  shortDescription: string;
  shortDescriptionAm: string | null;
  geezName: string | null;
  geezLatin: string | null;
  uses: string[];
  usesAm: string[];
  ingredients: string | null;
  nutrition: NutritionFacts | null;
  nutritionVerified: boolean;
  grain: GrainStyle;
  isFeatured: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface NutritionFacts {
  servingSize?: string;
  servingsPerContainer?: string;
  calories?: number;
  rows?: { label: string; amount: string; dailyValue?: string }[];
}

export interface CartLine {
  slug: string;
  variant: string;
  buyer: "household" | "business";
  qty: number;
}

export interface SiteContact {
  company: string;
  city: string;
  state: string;
  email: string | null;
  phone: string | null;
  hours: string | null;
}
