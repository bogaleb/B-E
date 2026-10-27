import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/forms";
import { deleteCategory } from "@/app/admin/actions";
import { PageTitle } from "../ui";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("product_categories").select("id, slug, name, sort_order, products(count)").order("sort_order");
  return (
    <>
      <PageTitle title="Categories" sub="Used for the filters on the products page and the homepage." />
      <div className="grid gap-6">
        <Card><CardHeader><CardTitle>Add a category</CardTitle></CardHeader><CardContent><CategoryForm /></CardContent></Card>
        <Card><CardHeader><CardTitle>Current categories</CardTitle></CardHeader><CardContent className="grid gap-5">
          {(data ?? []).map((c) => {
            const n = (c.products as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <div key={c.id} className="grid gap-2 border-b border-line pb-5 last:border-0 last:pb-0">
                <CategoryForm values={{ id: c.id, slug: c.slug, name: c.name, sortOrder: c.sort_order }} />
                <form action={deleteCategory} className="flex items-center gap-3 text-xs text-muted">
                  <input type="hidden" name="id" value={c.id} />
                  <span>{n} product{n === 1 ? "" : "s"}{n ? " (they'll become uncategorized if you delete this)" : ""}</span>
                  <Button type="submit" variant="ghost" size="sm" className="text-red"><Trash2 />Delete</Button>
                </form>
              </div>
            );
          })}
        </CardContent></Card>
      </div>
    </>
  );
}
