import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { imageUrl } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, PageTitle } from "../ui";

export const metadata = { title: "Products" };

export default async function ProductsAdmin() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select("id, slug, name, is_active, is_featured, sort_order, product_categories(name), product_images(src, kind, sort_order), product_variants(label, is_default)").order("sort_order");
  return (
    <>
      <PageTitle title="Products" sub="Edit descriptions, package sizes and photos. Changes appear on the website within a few minutes." actions={<Button asChild><Link href="/admin/products/new"><Plus />Add product</Link></Button>} />
      {error ? <Empty>Couldn&apos;t load products: {error.message}</Empty> : !data?.length ? <Empty>No products yet. Add your first product.</Empty> : (
        <div className="grid gap-3">
          {data.map((p) => {
            const imgs = [...(p.product_images as { src: string; kind: string; sort_order: number }[])].sort((a, b) => a.sort_order - b.sort_order);
            const v = (p.product_variants as { label: string; is_default: boolean }[]).find((x) => x.is_default);
            const cat = p.product_categories as unknown as { name: string } | null;
            return (
              <Link key={p.id} href={`/admin/products/${p.id}`} className="grid grid-cols-[88px_1fr_auto] items-center gap-4 rounded-2xl border border-line bg-white p-3 hover:border-deep">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-cream">{imgs[0] && <Image src={imageUrl(imgs[0].src)} alt="" fill sizes="88px" className="object-cover" />}</div>
                <div className="min-w-0"><p className="font-display text-lg text-deep">{p.name}</p><p className="text-xs text-muted">{cat?.name ?? "No category"} · {v?.label ?? "No size"} · {imgs.length} image{imgs.length === 1 ? "" : "s"} · /products/{p.slug}</p></div>
                <div className="flex flex-wrap justify-end gap-2">{p.is_featured && <Badge tone="quoted">Featured</Badge>}<Badge tone={p.is_active ? "active" : "hidden"}>{p.is_active ? "Visible" : "Hidden"}</Badge></div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
