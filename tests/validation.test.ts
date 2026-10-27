import { describe, expect, it } from "vitest";
import { contactSchema, inquirySchema, productSchema, wholesaleSchema, fieldErrors } from "@/lib/validation";

const validInquiry = {
  buyerType: "household", name: "Abeba Tesfaye", email: "Abeba@Example.com", phone: "(571) 555-0134", zip: "20164",
  items: [{ slug: "red-lentils", variant: "2 LB", buyer: "household", qty: 3 }], consent: true, website: "",
};

describe("inquirySchema", () => {
  it("accepts a valid request and normalizes email", () => {
    const r = inquirySchema.safeParse(validInquiry);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("abeba@example.com");
  });
  it("rejects missing consent", () => {
    expect(inquirySchema.safeParse({ ...validInquiry, consent: false }).success).toBe(false);
  });
  it("rejects bad ZIP, phone and email with field messages", () => {
    const r = inquirySchema.safeParse({ ...validInquiry, zip: "2016", phone: "555", email: "nope" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const f = fieldErrors(r.error);
      expect(Object.keys(f)).toEqual(expect.arrayContaining(["zip", "phone", "email"]));
      expect(f.zip).toMatch(/ZIP/);
    }
  });
  it("rejects empty carts, absurd quantities and unsafe slugs", () => {
    expect(inquirySchema.safeParse({ ...validInquiry, items: [] }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...validInquiry, items: [{ ...validInquiry.items[0], qty: 100000 }] }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...validInquiry, items: [{ ...validInquiry.items[0], slug: "../etc" }] }).success).toBe(false);
  });
  it("rejects a filled honeypot", () => {
    expect(inquirySchema.safeParse({ ...validInquiry, website: "http://spam" }).success).toBe(false);
  });
  it("caps notes length", () => {
    expect(inquirySchema.safeParse({ ...validInquiry, notes: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("wholesaleSchema", () => {
  const ok = { businessName: "Sheger Market", contactName: "Dawit", email: "dawit@example.com", phone: "703 555 0199", businessType: "grocery", location: "Sterling, VA", products: [{ slug: "brown-flaxseeds", quantity: "40 bags" }], frequency: "monthly", consent: true };
  it("accepts a valid inquiry", () => expect(wholesaleSchema.safeParse(ok).success).toBe(true));
  it("requires a known business type and frequency", () => {
    expect(wholesaleSchema.safeParse({ ...ok, businessType: "casino" }).success).toBe(false);
    expect(wholesaleSchema.safeParse({ ...ok, frequency: "hourly" }).success).toBe(false);
  });
  it("requires at least one product", () => expect(wholesaleSchema.safeParse({ ...ok, products: [] }).success).toBe(false));
});

describe("contactSchema", () => {
  it("phone is optional", () => expect(contactSchema.safeParse({ name: "Sara", email: "s@example.com", topic: "product", message: "Do you have yellow split peas?" }).success).toBe(true));
  it("rejects unknown topic", () => expect(contactSchema.safeParse({ name: "Sara", email: "s@example.com", topic: "x", message: "hello there" }).success).toBe(false));
});

describe("productSchema", () => {
  it("parses comma-separated uses and empty optional fields", () => {
    const r = productSchema.safeParse({ slug: "red-lentils", name: "Red Lentils", categoryId: "", grainStyle: "lentil", isActive: true, isFeatured: false, sortOrder: "1", uses: "Misir wot, Soups, ,", variantUpc: "" });
    expect(r.success).toBe(true);
    if (r.success) { expect(r.data.uses).toEqual(["Misir wot", "Soups"]); expect(r.data.categoryId).toBeUndefined(); expect(r.data.variantUpc).toBeUndefined(); }
  });
  it("rejects slugs with spaces or uppercase after trimming", () => {
    expect(productSchema.safeParse({ slug: "red lentils", name: "x", grainStyle: "lentil", isActive: true, isFeatured: false, sortOrder: 1 }).success).toBe(false);
  });
});
