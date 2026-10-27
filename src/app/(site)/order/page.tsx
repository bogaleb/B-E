import type { Metadata } from "next";
import Link from "next/link";
import { OrderForm } from "@/components/site/OrderForm";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Order request", robots: { index: false } };

export default async function OrderPage() {
  const products = await getProducts();
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/inquiry">Inquiry list</Link><span>/</span><span>Order request</span></nav>
        <h1>Send an order request</h1>
        <p className="lede">Tell us who you are and where the order is going. We&apos;ll contact you to confirm price, availability and delivery.</p>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap"><OrderForm products={products} /></div></section>
    </>
  );
}
