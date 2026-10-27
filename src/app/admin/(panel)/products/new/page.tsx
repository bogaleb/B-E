import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/forms";
import { PageTitle } from "../../ui";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  const { supabase } = await requireAdmin();
  const { data: cats } = await supabase.from("product_categories").select("id, name").order("sort_order");
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold text-green">← Products</Link>
      <PageTitle title="Add product" sub="You can add photos after the product is created." />
      <Card><CardContent>
        <ProductForm categories={cats ?? []} values={{ slug: "", name: "", packageName: "", categoryId: "", shortDescription: "", description: "", geezName: "", geezLatin: "", uses: "", ingredients: "", grainStyle: "lentil", isActive: false, isFeatured: false, sortOrder: 10, variantLabel: "", variantNetWeight: "", variantUpc: "" }} />
      </CardContent></Card>
    </>
  );
}
