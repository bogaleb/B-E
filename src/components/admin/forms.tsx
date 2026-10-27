"use client";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import type { ActionState } from "@/app/admin/actions";
import { saveCategory, saveProduct, saveSettings, updateSubmission, uploadProductImage } from "@/app/admin/actions";

export function Submit({ children, variant }: { children: React.ReactNode; variant?: "default" | "destructive" | "outline" }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} disabled={pending}>{pending ? "Saving…" : children}</Button>;
}

function Result({ state }: { state: ActionState }) {
  const [show, setShow] = useState(true);
  useEffect(() => { setShow(true); const t = setTimeout(() => setShow(false), 3000); return () => clearTimeout(t); }, [state]);
  if (!state) return null;
  if (state.ok) return show ? <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-green"><Check className="size-4" />{state.message}</span> : null;
  return <p role="alert" className="rounded-lg bg-red/10 px-3 py-2 text-sm text-red">{state.error}</p>;
}

function F({ label, name, error, hint, children }: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-red">{error}</p>}
    </div>
  );
}

export function StatusForm({ kind, id, statuses, status, notes }: { kind: "inquiry" | "wholesale" | "message"; id: string; statuses: readonly string[]; status: string; notes: string | null }) {
  const [state, action] = useActionState(updateSubmission, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <F label="Status" name="status"><NativeSelect id="status" name="status" defaultValue={status}>{statuses.map((s) => <option key={s} value={s}>{s[0]!.toUpperCase() + s.slice(1)}</option>)}</NativeSelect></F>
      <F label="Internal notes" name="internal_notes" hint="Only visible to your team."><Textarea id="internal_notes" name="internal_notes" defaultValue={notes ?? ""} maxLength={5000} rows={6} /></F>
      <div className="flex flex-wrap items-center gap-3"><Submit>Save changes</Submit><Result state={state} /></div>
    </form>
  );
}

export interface ProductFormValues {
  id?: string; slug: string; name: string; packageName: string; categoryId: string; shortDescription: string; description: string;
  geezName: string; geezLatin: string; uses: string; ingredients: string; grainStyle: string; isActive: boolean; isFeatured: boolean; sortOrder: number;
  variantLabel: string; variantNetWeight: string; variantUpc: string;
}

export function ProductForm({ values, categories }: { values: ProductFormValues; categories: { id: string; name: string }[] }) {
  const [state, action] = useActionState(saveProduct, null);
  const e = state?.fields ?? {};
  return (
    <form action={action} className="grid gap-5">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Product name" name="name" error={e.name}><Input id="name" name="name" defaultValue={values.name} required maxLength={120} /></F>
        <F label="Web address (slug)" name="slug" error={e.slug} hint="Lowercase letters, numbers and hyphens, e.g. red-lentils"><Input id="slug" name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></F>
        <F label="Name on package" name="packageName" error={e.packageName}><Input id="packageName" name="packageName" defaultValue={values.packageName} maxLength={120} /></F>
        <F label="Category" name="categoryId" error={e.categoryId}><NativeSelect id="categoryId" name="categoryId" defaultValue={values.categoryId}><option value="">No category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect></F>
      </div>
      <F label="Short description" name="shortDescription" error={e.shortDescription} hint="Shown on product cards. Up to 300 characters."><Textarea id="shortDescription" name="shortDescription" defaultValue={values.shortDescription} maxLength={300} rows={3} /></F>
      <F label="Full description" name="description" error={e.description}><Textarea id="description" name="description" defaultValue={values.description} maxLength={4000} rows={5} /></F>
      <div className="grid gap-4 sm:grid-cols-3">
        <F label="Amharic name" name="geezName" error={e.geezName}><Input id="geezName" name="geezName" lang="am" defaultValue={values.geezName} maxLength={40} /></F>
        <F label="Amharic name in Latin letters" name="geezLatin" error={e.geezLatin}><Input id="geezLatin" name="geezLatin" defaultValue={values.geezLatin} maxLength={40} /></F>
        <F label="Grain illustration" name="grainStyle" hint="Used when there's no photo."><NativeSelect id="grainStyle" name="grainStyle" defaultValue={values.grainStyle}>{["lentil", "flax", "fava", "bulgur", "bean"].map((g) => <option key={g}>{g}</option>)}</NativeSelect></F>
      </div>
      <F label="Good for" name="uses" error={e.uses} hint="Comma-separated, e.g. Misir wot, Soups"><Input id="uses" name="uses" defaultValue={values.uses} maxLength={400} /></F>
      <F label="Ingredients" name="ingredients" error={e.ingredients} hint="Enter exactly as printed on the package. Leave empty until verified."><Textarea id="ingredients" name="ingredients" defaultValue={values.ingredients} maxLength={1000} rows={2} /></F>
      <fieldset className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-3">
        <legend className="px-1 text-sm font-semibold">Default package size</legend>
        <F label="Size label" name="variantLabel" error={e.variantLabel}><Input id="variantLabel" name="variantLabel" defaultValue={values.variantLabel} placeholder="2 LB" maxLength={60} /></F>
        <F label="Net weight on package" name="variantNetWeight" error={e.variantNetWeight}><Input id="variantNetWeight" name="variantNetWeight" defaultValue={values.variantNetWeight} placeholder="2 LB (907 g)" maxLength={60} /></F>
        <F label="UPC" name="variantUpc" error={e.variantUpc}><Input id="variantUpc" name="variantUpc" defaultValue={values.variantUpc} inputMode="numeric" maxLength={20} /></F>
      </fieldset>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="isActive" defaultChecked={values.isActive} className="size-4 accent-green" />Show on website</label>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="isFeatured" defaultChecked={values.isFeatured} className="size-4 accent-green" />Feature on homepage</label>
        <label className="flex items-center gap-2 text-sm font-medium">Sort order <Input name="sortOrder" type="number" min={0} max={9999} defaultValue={values.sortOrder} className="w-24" /></label>
      </div>
      <div className="flex flex-wrap items-center gap-3"><Submit>{values.id ? "Save product" : "Create product"}</Submit><Result state={state} /></div>
    </form>
  );
}

export function ImageUploader({ productId }: { productId: string }) {
  const [state, action] = useActionState(uploadProductImage, null);
  const [preview, setPreview] = useState<string | null>(null);
  const e = state?.fields ?? {};
  return (
    <form action={action} className="grid gap-4" key={state?.ok ? String(Date.now()) : "form"}>
      <input type="hidden" name="productId" value={productId} />
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-cream text-xs text-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" className="size-full object-cover" /> : "Preview"}
        </div>
        <div className="grid gap-3">
          <F label="Image file" name="file" error={e.file} hint="JPEG, PNG, WebP or AVIF, up to 5 MB."><Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="py-1.5"
            onChange={(ev) => { const f = ev.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }} /></F>
          <F label="Description for screen readers" name="alt" error={e.alt}><Input id="alt" name="alt" required minLength={3} maxLength={200} placeholder="ETHIO red lentils 2 lb bag, front" /></F>
          <F label="Image type" name="kind" hint="Mark AI or design mockups as concepts so customers aren't misled."><NativeSelect id="kind" name="kind" defaultValue="actual"><option value="actual">Actual package photo</option><option value="concept">Package concept</option></NativeSelect></F>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3"><Submit>Upload image</Submit><Result state={state} /></div>
    </form>
  );
}

export function CategoryForm({ values }: { values?: { id: string; slug: string; name: string; sortOrder: number } }) {
  const [state, action] = useActionState(saveCategory, null);
  const e = state?.fields ?? {};
  return (
    <form action={action} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_100px_auto]">
      {values && <input type="hidden" name="id" value={values.id} />}
      <F label="Name" name={`name-${values?.id ?? "new"}`} error={e.name}><Input id={`name-${values?.id ?? "new"}`} name="name" defaultValue={values?.name} required maxLength={80} /></F>
      <F label="Slug" name={`slug-${values?.id ?? "new"}`} error={e.slug}><Input id={`slug-${values?.id ?? "new"}`} name="slug" defaultValue={values?.slug} required /></F>
      <F label="Order" name={`sort-${values?.id ?? "new"}`}><Input id={`sort-${values?.id ?? "new"}`} name="sortOrder" type="number" min={0} defaultValue={values?.sortOrder ?? 0} /></F>
      <div className="flex items-center gap-2"><Submit variant={values ? "outline" : "default"}>{values ? "Save" : "Add category"}</Submit></div>
      <div className="sm:col-span-4"><Result state={state} /></div>
    </form>
  );
}

export interface SettingsValues { company: string; city: string; state: string; email: string; phone: string; hours: string; announcementEnabled: boolean; announcementText: string; heroLede: string; aboutBody: string }
export function SettingsForm({ values }: { values: SettingsValues }) {
  const [state, action] = useActionState(saveSettings, null);
  const e = state?.fields ?? {};
  return (
    <form action={action} className="grid gap-6">
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-display text-lg text-deep">Business details</legend>
        <F label="Company" name="company" error={e.company}><Input id="company" name="company" defaultValue={values.company} required /></F>
        <F label="City" name="city" error={e.city}><Input id="city" name="city" defaultValue={values.city} required /></F>
        <F label="State" name="state" error={e.state}><Input id="state" name="state" defaultValue={values.state} required /></F>
        <F label="Public email" name="email" error={e.email} hint="Shown on the contact page and footer."><Input id="email" name="email" type="email" defaultValue={values.email} /></F>
        <F label="Public phone" name="phone" error={e.phone}><Input id="phone" name="phone" type="tel" defaultValue={values.phone} /></F>
        <F label="Hours" name="hours" error={e.hours}><Input id="hours" name="hours" defaultValue={values.hours} placeholder="Mon–Fri, 9am–5pm" /></F>
      </fieldset>
      <fieldset className="grid gap-3">
        <legend className="mb-2 font-display text-lg text-deep">Announcement bar</legend>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="announcementEnabled" defaultChecked={values.announcementEnabled} className="size-4 accent-green" />Show announcement at the top of every page</label>
        <F label="Announcement text" name="announcementText" error={e.announcementText}><Input id="announcementText" name="announcementText" defaultValue={values.announcementText} maxLength={200} /></F>
      </fieldset>
      <fieldset className="grid gap-4">
        <legend className="mb-2 font-display text-lg text-deep">Page text</legend>
        <F label="Homepage introduction" name="heroLede" error={e.heroLede}><Textarea id="heroLede" name="heroLede" defaultValue={values.heroLede} maxLength={400} rows={3} /></F>
        <F label="Our story" name="aboutBody" error={e.aboutBody} hint="Used on the homepage and About page."><Textarea id="aboutBody" name="aboutBody" defaultValue={values.aboutBody} maxLength={1200} rows={5} /></F>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3"><Submit>Save website content</Submit><Result state={state} /></div>
    </form>
  );
}
