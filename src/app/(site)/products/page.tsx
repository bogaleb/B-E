import type { Metadata } from "next";
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
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Products</span></nav>
        <h1>All products</h1>
        <p className="lede">Browse the ETHIO range. Add anything to your inquiry list and we&apos;ll confirm price and availability.</p>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap">
        <Catalog products={products} categories={categories.filter((c) => products.some((p) => p.category?.slug === c.slug))} />
      </div></section>
    </>
  );
}
