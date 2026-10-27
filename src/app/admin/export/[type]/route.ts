import { NextResponse } from "next/server";
import { getAdmin, logActivity } from "@/lib/auth";
import { toCSV } from "@/lib/csv";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ type: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const ctx = await getAdmin();
  if (!ctx) return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  const { type } = await params;
  const sb = ctx.supabase;
  let headers: string[] = [], rows: unknown[][] = [];
  if (type === "inquiries") {
    const { data, error } = await sb.from("inquiries").select("reference, created_at, status, buyer_type, name, email, phone, delivery_zip, business_name, notes, internal_notes, inquiry_items(product_name, variant_label, quantity)").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    headers = ["Reference", "Received", "Status", "Buying for", "Name", "Email", "Phone", "Delivery ZIP", "Business", "Products", "Total bags", "Customer notes", "Internal notes"];
    rows = data.map((r) => {
      const items = r.inquiry_items as { product_name: string; variant_label: string | null; quantity: number }[];
      return [r.reference, r.created_at, r.status, r.buyer_type, r.name, r.email, r.phone, r.delivery_zip, r.business_name, items.map((i) => `${i.quantity} × ${i.product_name} (${i.variant_label ?? ""})`), items.reduce((a, i) => a + i.quantity, 0), r.notes, r.internal_notes];
    });
  } else if (type === "wholesale") {
    const { data, error } = await sb.from("wholesale_inquiries").select("reference, created_at, status, business_name, contact_name, email, phone, business_type, location, order_frequency, notes, internal_notes, wholesale_inquiry_items(product_name, quantity_text)").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    headers = ["Reference", "Received", "Status", "Business", "Contact", "Email", "Phone", "Business type", "Location", "Frequency", "Products", "Notes", "Internal notes"];
    rows = data.map((r) => [r.reference, r.created_at, r.status, r.business_name, r.contact_name, r.email, r.phone, r.business_type, r.location, r.order_frequency,
      (r.wholesale_inquiry_items as { product_name: string; quantity_text: string | null }[]).map((i) => `${i.product_name}: ${i.quantity_text ?? "to discuss"}`), r.notes, r.internal_notes]);
  } else if (type === "messages") {
    const { data, error } = await sb.from("contact_messages").select("created_at, status, name, email, phone, topic, message, internal_notes").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    headers = ["Received", "Status", "Name", "Email", "Phone", "Topic", "Message", "Internal notes"];
    rows = data.map((r) => [r.created_at, r.status, r.name, r.email, r.phone, r.topic, r.message, r.internal_notes]);
  } else {
    return NextResponse.json({ error: "Unknown export" }, { status: 404 });
  }
  await logActivity(ctx, "export_csv", type, null, { rows: rows.length });
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + toCSV(headers, rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ethio-${type}-${date}.csv"`, "Cache-Control": "private, no-store" },
  });
}
