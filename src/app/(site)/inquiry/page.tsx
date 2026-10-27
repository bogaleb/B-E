import type { Metadata } from "next";
import { T } from "@/components/site/T";
import Link from "next/link";
import { InquiryList } from "@/components/site/InquiryList";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Inquiry list", robots: { index: false } };

export default async function InquiryPage() {
  const products = await getProducts();
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/"><T k="nav.home" /></Link><span>/</span><span><T k="foot.inquiry" /></span></nav>
        <h1><T k="inq.title" /></h1>
        <p className="lede"><T k="inq.lede" /></p>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap"><InquiryList products={products} /></div></section>
    </>
  );
}
