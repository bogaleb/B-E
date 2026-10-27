import { z } from "zod";

const text = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `Enter ${label}.`).max(max, `${label[0]!.toUpperCase() + label.slice(1)} is too long.`);
const optionalText = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

export const emailField = z.string().trim().toLowerCase().max(254).email("Enter an email like name@example.com.");
export const phoneField = z.string().trim().max(40).refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a phone number with at least 10 digits.");
export const zipField = z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP code.");
/** Honeypot: real visitors never fill this hidden field. */
export const honeypot = z.string().max(0).optional().or(z.literal(""));

export const inquiryItemSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80),
  variant: z.string().trim().min(1).max(60),
  buyer: z.enum(["household", "business"]),
  qty: z.number().int().min(1).max(9999),
});

export const inquirySchema = z.object({
  buyerType: z.enum(["household", "business"]),
  name: text(2, 120, "your full name"),
  email: emailField,
  phone: phoneField,
  zip: zipField,
  businessName: optionalText(160),
  notes: optionalText(2000),
  items: z.array(inquiryItemSchema).min(1, "Add at least one product.").max(50),
  consent: z.literal(true, { error: "Confirm that you understand this is a request." }),
  website: honeypot,
});
export type InquiryInput = z.infer<typeof inquirySchema>;

export const BUSINESS_TYPES = { grocery: "Grocery store", supermarket: "Supermarket", restaurant: "Restaurant", distributor: "Distributor", other: "Other" } as const;
export const FREQUENCIES = { "one-time": "One-time order", weekly: "Weekly", biweekly: "Every two weeks", monthly: "Monthly", unsure: "Not sure yet" } as const;

export const wholesaleSchema = z.object({
  businessName: text(2, 160, "your business name"),
  contactName: text(2, 120, "a contact name"),
  email: emailField,
  phone: phoneField,
  businessType: z.enum(Object.keys(BUSINESS_TYPES) as [keyof typeof BUSINESS_TYPES, ...(keyof typeof BUSINESS_TYPES)[]], { error: "Choose your business type." }),
  location: text(2, 160, "your city and state"),
  products: z.array(z.object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80), quantity: z.string().trim().max(80).optional() })).min(1, "Pick at least one product.").max(30),
  frequency: z.enum(Object.keys(FREQUENCIES) as [keyof typeof FREQUENCIES, ...(keyof typeof FREQUENCIES)[]], { error: "Choose an estimate." }),
  notes: optionalText(2000),
  consent: z.literal(true, { error: "Confirm that you understand this is an inquiry." }),
  website: honeypot,
});
export type WholesaleInput = z.infer<typeof wholesaleSchema>;

export const TOPICS = { product: "Product question", order: "Order request help", wholesale: "Wholesale", other: "Something else" } as const;
export const contactSchema = z.object({
  name: text(2, 120, "your name"),
  email: emailField,
  phone: z.string().trim().max(40).optional().transform((v) => (v ? v : undefined)),
  topic: z.enum(Object.keys(TOPICS) as [keyof typeof TOPICS, ...(keyof typeof TOPICS)[]], { error: "Choose a topic." }),
  message: text(5, 4000, "a short message"),
  website: honeypot,
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Flatten Zod issues into { field: message } for form display. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ---- Admin ---------------------------------------------------------------
export const INQUIRY_STATUSES = ["new", "contacted", "quoted", "confirmed", "fulfilled", "cancelled"] as const;
export const WHOLESALE_STATUSES = ["new", "contacted", "quoted", "won", "lost", "closed"] as const;
export const MESSAGE_STATUSES = ["new", "replied", "closed"] as const;

export const slugField = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.").max(80);

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugField,
  name: text(1, 120, "a product name"),
  packageName: optionalText(120),
  categoryId: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  shortDescription: optionalText(300),
  description: optionalText(4000),
  geezName: optionalText(40),
  geezLatin: optionalText(40),
  nameAm: optionalText(120),
  shortDescriptionAm: optionalText(400),
  usesAm: z.string().max(600).optional().transform((v) => (v ?? "").split(/[,፣]/).map((s) => s.trim()).filter(Boolean).slice(0, 12)),
  uses: z.string().max(400).optional().transform((v) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12)),
  ingredients: optionalText(1000),
  grainStyle: z.enum(["lentil", "flax", "fava", "bulgur", "bean"]),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  variantLabel: optionalText(60),
  variantNetWeight: optionalText(60),
  variantUpc: z.string().trim().regex(/^[0-9 ]{8,20}$/, "UPC should be 8–20 digits.").optional().or(z.literal("").transform(() => undefined)),
});

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugField,
  name: text(1, 80, "a category name"),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
