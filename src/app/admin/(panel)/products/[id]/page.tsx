import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { imageUrl } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import { ImageUploader, ProductForm } from "@/components/admin/forms";
import { deleteImage, deleteProduct, updateImage } from "@/app/admin/actions";
import { PageTitle } from "../../ui";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditProduct({ params, searchParams }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { created } = await searchParams;
  const ctx = await requireAdmin();
  const [{ data: p }, { data: cats }] = await Promise.all([
    ctx.supabase.from("products").select("*, product_variants(id, label, net_weight, upc, is_default), product_images(id, src, alt, kind, sort_order)").eq("id", id).single(),
    ctx.supabase.from("product_categories").select("id, name").order("sort_order"),
  ]);
  if (!p) notFound();
  const v = (p.product_variants as { label: string; net_weight: string | null; upc: string | null; is_default: boolean }[]).find((x) => x.is_default);
  const imgs = [...(p.product_images as { id: string; src: string; alt: string; kind: string; sort_order: number }[])].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-green">← Products</Link>
      <PageTitle title={p.name} sub={created ? "Product created. Add photos below, then turn on “Show on website”." : `/products/${p.slug}`}
        actions={p.is_active ? <Button asChild variant="outline"><a href={`/products/${p.slug}`} target="_blank" rel="noreferrer">View on website</a></Button> : <Badge tone="hidden">Hidden from website</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader><CardContent>
          <ProductForm categories={cats ?? []} values={{
            id: p.id, slug: p.slug, name: p.name, packageName: p.package_name ?? "", categoryId: p.category_id ?? "", shortDescription: p.short_description ?? "",
            description: p.description ?? "", geezName: p.geez_name ?? "", geezLatin: p.geez_latin ?? "", uses: (p.uses ?? []).join(", "), ingredients: p.ingredients ?? "",
            grainStyle: p.grain_style, isActive: p.is_active, isFeatured: p.is_featured, sortOrder: p.sort_order,
            variantLabel: v?.label ?? "", variantNetWeight: v?.net_weight ?? "", variantUpc: v?.upc ?? "",
          }} />
        </CardContent></Card>
        <div className="grid h-fit gap-6">
          <Card><CardHeader><CardTitle>Photos</CardTitle><span className="text-xs text-muted">First image is used on cards</span></CardHeader><CardContent className="grid gap-4">
            {imgs.length === 0 && <p className="text-sm text-muted">No photos yet. The website shows a grain illustration until you add one.</p>}
            {imgs.map((im) => (
              <div key={im.id} className="grid grid-cols-[96px_1fr] gap-3 rounded-xl border border-line p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream"><Image src={imageUrl(im.src)} alt="" fill sizes="96px" className="object-cover" /></div>
                <div className="grid gap-2">
                  <form action={updateImage} className="grid gap-2">
                    <input type="hidden" name="id" value={im.id} />
                    <Input name="alt" defaultValue={im.alt} aria-label="Image description" minLength={3} maxLength={200} required />
                    <div className="flex gap-2">
                      <NativeSelect name="kind" defaultValue={im.kind} aria-label="Image type" className="flex-1"><option value="actual">Actual photo</option><option value="concept">Concept</option></NativeSelect>
                      <Input name="sortOrder" type="number" min={0} defaultValue={im.sort_order} aria-label="Order" className="w-20" />
                      <Button type="submit" variant="outline" size="sm" className="h-10">Save</Button>
                    </div>
                  </form>
                  <form action={deleteImage}><input type="hidden" name="id" value={im.id} /><Button type="submit" variant="ghost" size="sm" className="text-red"><Trash2 />Remove photo</Button></form>
                </div>
              </div>
            ))}
            <div className="border-t border-line pt-4"><ImageUploader productId={p.id} /></div>
          </CardContent></Card>
          {ctx.role === "admin" && (
            <Card><CardHeader><CardTitle>Delete product</CardTitle></CardHeader><CardContent className="grid gap-3">
              <p className="text-sm text-muted">To stop showing a product, untick “Show on website” instead. Deleting removes it and its photos for good. Past order requests keep the product name.</p>
              <form action={deleteProduct} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={p.id} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" required className="size-4 accent-red" />I want to delete {p.name}</label>
                <Button type="submit" variant="destructive" size="sm"><Trash2 />Delete product</Button>
              </form>
            </CardContent></Card>
          )}
        </div>
      </div>
    </>
  );
}
