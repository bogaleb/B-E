import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";
import { demoSubmissionsAllowed } from "@/lib/env";
import { getProducts } from "@/lib/catalog";
import { makeReference } from "@/lib/reference";
import { sendSubmissionEmails } from "@/lib/email";
import { BUSINESS_TYPES, FREQUENCIES, TOPICS, type ContactInput, type InquiryInput, type WholesaleInput } from "@/lib/validation";
import { HttpError } from "@/lib/security";

interface Ctx { ipHash: string; userAgent: string }

const unavailable = () => new HttpError(503, "We can't take requests online right now. Please try again later.");

async function insertWithUniqueRef<T>(prefix: "ETH" | "WHL", insert: (ref: string) => Promise<{ data: T | null; error: { code?: string; message: string } | null }>) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const ref = makeReference(prefix);
    const { data, error } = await insert(ref);
    if (!error && data) return { ref, data };
    if (error?.code !== "23505") throw new Error(error?.message ?? "insert failed");
  }
  throw new Error("could not allocate a reference number");
}

export async function submitInquiry(input: InquiryInput, ctx: Ctx) {
  const catalog = await getProducts();
  const items = input.items.map((i) => {
    const p = catalog.find((x) => x.slug === i.slug);
    if (!p) throw new HttpError(422, "One of the products in your list is no longer available. Remove it and try again.");
    const v = p.variants.find((x) => x.label === i.variant);
    return { product: p, variant: v, label: v?.label ?? "Ask about sizes", qty: i.qty, buyer: i.buyer };
  });
  const sb = createServiceClient();
  let reference: string;
  if (!sb) {
    if (!demoSubmissionsAllowed()) throw unavailable();
    reference = makeReference("ETH");
    console.info("[inquiry] demo mode — not stored", reference);
  } else {
    const { ref, data } = await insertWithUniqueRef<{ id: string }>("ETH", async (r) =>
      sb.from("inquiries").insert({
        reference: r, buyer_type: input.buyerType, name: input.name, email: input.email, phone: input.phone,
        delivery_zip: input.zip, business_name: input.businessName ?? null, notes: input.notes ?? null,
        ip_hash: ctx.ipHash, user_agent: ctx.userAgent.slice(0, 400),
      }).select("id").single());
    const { error } = await sb.from("inquiry_items").insert(items.map((i) => ({
      inquiry_id: data.id, product_id: i.product.id ?? null, variant_id: i.variant?.id ?? null,
      product_name: i.product.name, variant_label: i.label, buyer_type: i.buyer, quantity: i.qty,
    })));
    if (error) {
      await sb.from("inquiries").delete().eq("id", data.id);
      throw new Error("inquiry items insert failed: " + error.message);
    }
    reference = ref;
  }
  await sendSubmissionEmails({
    kind: "Order request", reference, customerName: input.name, customerEmail: input.email,
    details: [
      { label: "Name", value: input.name }, { label: "Email", value: input.email }, { label: "Phone", value: input.phone },
      { label: "Delivery ZIP", value: input.zip }, { label: "Buying for", value: input.buyerType === "business" ? "Business" : "Household" },
      ...(input.businessName ? [{ label: "Business", value: input.businessName }] : []),
      ...(input.notes ? [{ label: "Notes", value: input.notes }] : []),
    ],
    items: items.map((i) => ({ label: `${i.product.name} (${i.label})`, value: `${i.qty} bag${i.qty === 1 ? "" : "s"}` })),
  });
  return { reference };
}

export async function submitWholesale(input: WholesaleInput, ctx: Ctx) {
  const catalog = await getProducts();
  const products = input.products.map((p) => {
    const prod = catalog.find((x) => x.slug === p.slug);
    if (!prod) throw new HttpError(422, "One of the selected products is no longer available.");
    return { prod, quantity: p.quantity || null };
  });
  const sb = createServiceClient();
  let reference: string;
  if (!sb) {
    if (!demoSubmissionsAllowed()) throw unavailable();
    reference = makeReference("WHL");
  } else {
    const { ref, data } = await insertWithUniqueRef<{ id: string }>("WHL", async (r) =>
      sb.from("wholesale_inquiries").insert({
        reference: r, business_name: input.businessName, contact_name: input.contactName, email: input.email, phone: input.phone,
        business_type: input.businessType, location: input.location, order_frequency: input.frequency, notes: input.notes ?? null,
        ip_hash: ctx.ipHash, user_agent: ctx.userAgent.slice(0, 400),
      }).select("id").single());
    const { error } = await sb.from("wholesale_inquiry_items").insert(products.map((p) => ({
      wholesale_inquiry_id: data.id, product_id: p.prod.id ?? null, product_name: p.prod.name, quantity_text: p.quantity,
    })));
    if (error) {
      await sb.from("wholesale_inquiries").delete().eq("id", data.id);
      throw new Error("wholesale items insert failed: " + error.message);
    }
    reference = ref;
  }
  await sendSubmissionEmails({
    kind: "Wholesale inquiry", reference, customerName: input.contactName, customerEmail: input.email,
    details: [
      { label: "Business", value: input.businessName }, { label: "Contact", value: input.contactName },
      { label: "Email", value: input.email }, { label: "Phone", value: input.phone },
      { label: "Business type", value: BUSINESS_TYPES[input.businessType] }, { label: "Location", value: input.location },
      { label: "Order frequency", value: FREQUENCIES[input.frequency] },
      ...(input.notes ? [{ label: "Notes", value: input.notes }] : []),
    ],
    items: products.map((p) => ({ label: p.prod.name, value: p.quantity ?? "Quantity to discuss" })),
  });
  return { reference };
}

export async function submitContact(input: ContactInput, ctx: Ctx) {
  const sb = createServiceClient();
  if (!sb) {
    if (!demoSubmissionsAllowed()) throw unavailable();
  } else {
    const { error } = await sb.from("contact_messages").insert({
      name: input.name, email: input.email, phone: input.phone ?? null, topic: input.topic, message: input.message, ip_hash: ctx.ipHash,
    });
    if (error) throw new Error("contact insert failed: " + error.message);
  }
  await sendSubmissionEmails({
    kind: "Contact message", customerName: input.name, customerEmail: input.email,
    details: [
      { label: "Name", value: input.name }, { label: "Email", value: input.email },
      ...(input.phone ? [{ label: "Phone", value: input.phone }] : []),
      { label: "Topic", value: TOPICS[input.topic] }, { label: "Message", value: input.message },
    ],
  });
  return { ok: true };
}
