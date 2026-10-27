import type { Metadata } from "next";
import Link from "next/link";
import { InquiryList } from "@/components/site/InquiryList";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Inquiry list", robots: { index: false } };

export default async function InquiryPage() {
  const products = await getProducts();
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Inquiry list</span></nav>
        <h1>Your inquiry list</h1>
        <p className="lede">Adjust quantities, then send it as an order request. Prices and availability are confirmed by our team.</p>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap"><InquiryList products={products} /></div></section>
    </>
  );
}
