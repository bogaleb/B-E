import type { Metadata } from "next";
import { T } from "@/components/site/T";
import Link from "next/link";
import { Catalog } from "@/components/site/Catalog";
import { getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 300;
export const metadata: Metadata = { title: "Products", description: "Browse ETHIO red lentils, brown flaxseeds, split fava beans, bulgur wheat and beans. Add products to an inquiry list and request an order.", alternates: { canonical: "/products" } };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/"><T k="nav.home" /></Link><span>/</span><span><T k="nav.products" /></span></nav>
        <h1><T k="cat.title" /></h1>
        <p className="lede"><T k="cat.lede" /></p>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap">
        <Catalog products={products} categories={categories.filter((c) => products.some((p) => p.category?.slug === c.slug))} />
      </div></section>
    </>
  );
}
