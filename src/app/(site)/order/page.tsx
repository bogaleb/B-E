import type { Metadata } from "next";
import { T } from "@/components/site/T";
import Link from "next/link";
import { OrderForm } from "@/components/site/OrderForm";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Order request", robots: { index: false } };

export default async function OrderPage() {
  const products = await getProducts();
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/"><T k="nav.home" /></Link><span>/</span><Link href="/inquiry"><T k="foot.inquiry" /></Link><span>/</span><span><T k="foot.order" /></span></nav>
        <h1><T k="ord.title" /></h1>
        <p className="lede"><T k="ord.lede" /></p>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap"><OrderForm products={products} /></div></section>
    </>
  );
}
