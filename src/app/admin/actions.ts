"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin, logActivity } from "@/lib/auth";
import { EXT, sniffImageType } from "@/lib/image-check";
import { categorySchema, fieldErrors, INQUIRY_STATUSES, MAX_IMAGE_BYTES, MESSAGE_STATUSES, productSchema, WHOLESALE_STATUSES } from "@/lib/validation";

export type ActionState = { ok: boolean; message?: string; error?: string; fields?: Record<string, string> } | null;

const fail = (error: string, fields?: Record<string, string>): ActionState => ({ ok: false, error, fields });
const str = (fd: FormData, k: string) => { const v = fd.get(k); return typeof v === "string" ? v : undefined; };
const revalidateCatalog = () => { revalidatePath("/", "layout"); };

export async function signOut() {
  const ctx = await assertAdmin().catch(() => null);
  if (ctx) await ctx.supabase.auth.signOut();
  redirect("/admin/login");
}

// ---- submissions ------------------------------------------------------------
const TABLES = { inquiry: "inquiries", wholesale: "wholesale_inquiries", message: "contact_messages" } as const;
const STATUS_SETS = { inquiry: INQUIRY_STATUSES, wholesale: WHOLESALE_STATUSES, message: MESSAGE_STATUSES } as const;

export async function updateSubmission(_: ActionState, fd: FormData): Promise<ActionState> {
  let ctx;
  try { ctx = await assertAdmin(); } catch { return fail("Your session has ended. Sign in again."); }
  const kind = z.enum(["inquiry", "wholesale", "message"]).safeParse(str(fd, "kind"));
  const id = z.string().uuid().safeParse(str(fd, "id"));
  if (!kind.success || !id.success) return fail("This record could not be found.");
  const status = z.enum(STATUS_SETS[kind.data] as unknown as [string, ...string[]]).safeParse(str(fd, "status"));
  const notes = z.string().max(5000).safeParse(str(fd, "internal_notes") ?? "");
  if (!status.success) return fail("Choose a valid status.");
  if (!notes.success) return fail("Internal notes are limited to 5,000 characters.");
  const { error } = await ctx.supabase.from(TABLES[kind.data]).update({ status: status.data, internal_notes: notes.data || null }).eq("id", id.data);
  if (error) return fail("Changes weren't saved. " + error.message);
  await logActivity(ctx, "update_status", TABLES[kind.data], id.data, { status: status.data });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Saved" };
}

// ---- products ----------------------------------------------------------------
export async function saveProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  let ctx;
  try { ctx = await assertAdmin(); } catch { return fail("Your session has ended. Sign in again."); }
  const parsed = productSchema.safeParse({
    id: str(fd, "id") || undefined, slug: str(fd, "slug"), name: str(fd, "name"), packageName: str(fd, "packageName"),
    categoryId: str(fd, "categoryId") ?? "", shortDescription: str(fd, "shortDescription"), description: str(fd, "description"),
    geezName: str(fd, "geezName"), geezLatin: str(fd, "geezLatin"), nameAm: str(fd, "nameAm"), shortDescriptionAm: str(fd, "shortDescriptionAm"), usesAm: str(fd, "usesAm"), uses: str(fd, "uses"), ingredients: str(fd, "ingredients"),
    grainStyle: str(fd, "grainStyle"), isActive: fd.get("isActive") === "on", isFeatured: fd.get("isFeatured") === "on",
    sortOrder: str(fd, "sortOrder") ?? "0", variantLabel: str(fd, "variantLabel"), variantNetWeight: str(fd, "variantNetWeight"), variantUpc: str(fd, "variantUpc") ?? "",
  });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrors(parsed.error));
  const p = parsed.data;
  const row = {
    slug: p.slug, name: p.name, package_name: p.packageName ?? null, category_id: p.categoryId ?? null,
    short_description: p.shortDescription ?? null, description: p.description ?? null, geez_name: p.geezName ?? null, geez_latin: p.geezLatin ?? null,
    uses: p.uses, ingredients: p.ingredients ?? null,
    name_am: p.nameAm ?? null, short_description_am: p.shortDescriptionAm ?? null, uses_am: p.usesAm, grain_style: p.grainStyle, is_active: p.isActive, is_featured: p.isFeatured, sort_order: p.sortOrder,
  };
  const q = p.id ? ctx.supabase.from("products").update(row).eq("id", p.id).select("id").single() : ctx.supabase.from("products").insert(row).select("id").single();
  let { data, error } = await q;
  if (error?.code === "PGRST204" || error?.code === "42703") {
    // Database hasn't had the Amharic migration yet: save everything else.
    const { name_am: _a, short_description_am: _b, uses_am: _c, ...base } = row;
    void _a; void _b; void _c;
    ({ data, error } = await (p.id ? ctx.supabase.from("products").update(base).eq("id", p.id).select("id").single() : ctx.supabase.from("products").insert(base).select("id").single()));
  }
  if (error || !data) return fail(error?.code === "23505" ? "Another product already uses this web address (slug)." : "The product wasn't saved. " + (error?.message ?? ""), error?.code === "23505" ? { slug: "Choose a different slug." } : undefined);
  if (p.variantLabel) {
    const { data: existing } = await ctx.supabase.from("product_variants").select("id").eq("product_id", data.id).eq("is_default", true).maybeSingle();
    const v = { product_id: data.id, label: p.variantLabel, net_weight: p.variantNetWeight ?? null, upc: p.variantUpc ?? null, is_default: true };
    const { error: vErr } = existing ? await ctx.supabase.from("product_variants").update(v).eq("id", existing.id) : await ctx.supabase.from("product_variants").insert(v);
    if (vErr) return fail("The product was saved, but the package size wasn't. " + vErr.message);
  }
  await logActivity(ctx, p.id ? "update_product" : "create_product", "products", data.id, { slug: p.slug });
  revalidateCatalog();
  if (!p.id) redirect(`/admin/products/${data.id}?created=1`);
  return { ok: true, message: "Product saved" };
}

export async function deleteProduct(fd: FormData) {
  const ctx = await assertAdmin({ ownerOnly: true });
  const id = z.string().uuid().parse(str(fd, "id"));
  const { data: imgs } = await ctx.supabase.from("product_images").select("src").eq("product_id", id);
  const paths = (imgs ?? []).map((i) => i.src as string).filter((s) => !s.startsWith("/") && !s.startsWith("http"));
  if (paths.length) await ctx.supabase.storage.from("product-images").remove(paths);
  const { error } = await ctx.supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(ctx, "delete_product", "products", id);
  revalidateCatalog();
  redirect("/admin/products");
}

export async function uploadProductImage(_: ActionState, fd: FormData): Promise<ActionState> {
  let ctx;
  try { ctx = await assertAdmin(); } catch { return fail("Your session has ended. Sign in again."); }
  const productId = z.string().uuid().safeParse(str(fd, "productId"));
  const alt = z.string().trim().min(3, "Describe the image in a few words.").max(200).safeParse(str(fd, "alt"));
  const kind = z.enum(["actual", "concept"]).safeParse(str(fd, "kind"));
  const file = fd.get("file");
  if (!productId.success) return fail("This product could not be found.");
  if (!alt.success) return fail(alt.error.issues[0]!.message, { alt: alt.error.issues[0]!.message });
  if (!kind.success) return fail("Choose whether this is an actual photo or a concept.");
  if (!(file instanceof File) || file.size === 0) return fail("Choose an image file.", { file: "Choose an image file." });
  if (file.size > MAX_IMAGE_BYTES) return fail("Images must be 5 MB or smaller.", { file: "Images must be 5 MB or smaller." });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return fail("Upload a JPEG, PNG, WebP or AVIF image.", { file: "Upload a JPEG, PNG, WebP or AVIF image." });
  const path = `${productId.data}/${randomUUID()}.${EXT[type]}`;
  const up = await ctx.supabase.storage.from("product-images").upload(path, bytes, { contentType: type, upsert: false, cacheControl: "31536000" });
  if (up.error) return fail("The image wasn't uploaded. " + up.error.message);
  const { count } = await ctx.supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId.data);
  const { error } = await ctx.supabase.from("product_images").insert({ product_id: productId.data, src: path, alt: alt.data, kind: kind.data, sort_order: (count ?? 0) + 1 });
  if (error) {
    await ctx.supabase.storage.from("product-images").remove([path]);
    return fail("The image wasn't saved. " + error.message);
  }
  await logActivity(ctx, "upload_image", "product_images", productId.data, { path, kind: kind.data });
  revalidateCatalog();
  return { ok: true, message: "Image uploaded" };
}

export async function updateImage(fd: FormData) {
  const ctx = await assertAdmin();
  const id = z.string().uuid().parse(str(fd, "id"));
  const alt = z.string().trim().min(3).max(200).parse(str(fd, "alt"));
  const kind = z.enum(["actual", "concept"]).parse(str(fd, "kind"));
  const sort = z.coerce.number().int().min(0).max(999).parse(str(fd, "sortOrder") ?? "0");
  const { error } = await ctx.supabase.from("product_images").update({ alt, kind, sort_order: sort }).eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(ctx, "update_image", "product_images", id);
  revalidateCatalog();
}

export async function deleteImage(fd: FormData) {
  const ctx = await assertAdmin();
  const id = z.string().uuid().parse(str(fd, "id"));
  const { data } = await ctx.supabase.from("product_images").select("src").eq("id", id).single();
  if (data && !String(data.src).startsWith("/") && !String(data.src).startsWith("http")) await ctx.supabase.storage.from("product-images").remove([data.src as string]);
  const { error } = await ctx.supabase.from("product_images").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(ctx, "delete_image", "product_images", id);
  revalidateCatalog();
}

// ---- categories ----------------------------------------------------------------
export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  let ctx;
  try { ctx = await assertAdmin(); } catch { return fail("Your session has ended. Sign in again."); }
  const parsed = categorySchema.safeParse({ id: str(fd, "id") || undefined, slug: str(fd, "slug"), name: str(fd, "name"), sortOrder: str(fd, "sortOrder") ?? "0" });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrors(parsed.error));
  const c = parsed.data;
  const row = { slug: c.slug, name: c.name, sort_order: c.sortOrder };
  const { error } = c.id ? await ctx.supabase.from("product_categories").update(row).eq("id", c.id) : await ctx.supabase.from("product_categories").insert(row);
  if (error) return fail(error.code === "23505" ? "Another category already uses this slug." : error.message);
  await logActivity(ctx, c.id ? "update_category" : "create_category", "product_categories", c.id ?? c.slug);
  revalidateCatalog();
  return { ok: true, message: "Category saved" };
}

export async function deleteCategory(fd: FormData) {
  const ctx = await assertAdmin();
  const id = z.string().uuid().parse(str(fd, "id"));
  const { error } = await ctx.supabase.from("product_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logActivity(ctx, "delete_category", "product_categories", id);
  revalidateCatalog();
}

// ---- site content ----------------------------------------------------------------
const settingsSchema = z.object({
  company: z.string().trim().min(2).max(120), city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email.")]), phone: z.string().trim().max(40), hours: z.string().trim().max(160),
  announcementEnabled: z.boolean(), announcementText: z.string().trim().max(200),
  heroLede: z.string().trim().min(10).max(400), aboutBody: z.string().trim().min(10).max(1200),
  heroLedeAm: z.string().trim().max(600), aboutBodyAm: z.string().trim().max(1600),
});

export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  let ctx;
  try { ctx = await assertAdmin(); } catch { return fail("Your session has ended. Sign in again."); }
  const parsed = settingsSchema.safeParse({
    company: str(fd, "company"), city: str(fd, "city"), state: str(fd, "state"), email: str(fd, "email") ?? "", phone: str(fd, "phone") ?? "", hours: str(fd, "hours") ?? "",
    announcementEnabled: fd.get("announcementEnabled") === "on", announcementText: str(fd, "announcementText") ?? "",
    heroLede: str(fd, "heroLede"), aboutBody: str(fd, "aboutBody"), heroLedeAm: str(fd, "heroLedeAm") ?? "", aboutBodyAm: str(fd, "aboutBodyAm") ?? "",
  });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrors(parsed.error));
  const s = parsed.data;
  const rows = [
    { key: "contact", value: { company: s.company, city: s.city, state: s.state, email: s.email || null, phone: s.phone || null, hours: s.hours || null } },
    { key: "announcement", value: { enabled: s.announcementEnabled, text: s.announcementText } },
    { key: "home.hero", value: { lede: s.heroLede, ledeAm: s.heroLedeAm } },
    { key: "about.story", value: { body: s.aboutBody, bodyAm: s.aboutBodyAm } },
  ].map((r) => ({ ...r, is_public: true, updated_by: ctx.userId }));
  const { error } = await ctx.supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) return fail("Settings weren't saved. " + error.message);
  await logActivity(ctx, "update_settings", "site_settings", null, { keys: rows.map((r) => r.key) });
  revalidateCatalog();
  return { ok: true, message: "Website content saved" };
}
