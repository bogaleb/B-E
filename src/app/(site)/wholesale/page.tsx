import type { Metadata } from "next";
import { T } from "@/components/site/T";
import Link from "next/link";
import { Info } from "lucide-react";
import { WholesaleForm } from "@/components/site/WholesaleForm";
import { getProducts } from "@/lib/catalog";

export const revalidate = 300;
export const metadata: Metadata = { title: "Wholesale", description: "Wholesale ETHIO lentils, fava beans, flaxseed and pantry staples for grocery stores, supermarkets, restaurants and distributors.", alternates: { canonical: "/wholesale" } };

export default async function WholesalePage() {
  const products = await getProducts();
  return (
    <>
      <section className="phead dark"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb" style={{ color: "#A9C0B1" }}><Link href="/"><T k="nav.home" /></Link><span>/</span><span><T k="nav.wholesale" /></span></nav>
        <span className="kicker"><T k="ws.kicker" /></span>
        <h1><T k="ws.title" /></h1>
        <p className="lede"><T k="ws.lede" /></p>
      </div></section>
      <section className="band" style={{ paddingBlock: "0 64px" }}><div className="wrap"><div className="quad">
        <div><b><T k="ws.grocery" /></b><span><T k="ws.grocery.p" /></span></div>
        <div><b><T k="ws.super" /></b><span><T k="ws.super.p" /></span></div>
        <div><b><T k="ws.rest" /></b><span><T k="ws.rest.p" /></span></div>
        <div><b><T k="ws.dist" /></b><span><T k="ws.dist.p" /></span></div>
      </div></div></section>
      <section className="sec"><div className="wrap split">
        <WholesaleForm products={products} />
        <div className="aside">
          <div className="sumcard"><h2><T k="ws.next" /></h2>
            <div className="sumline"><span><T k="ws.next1" /></span></div>
            <div className="sumline"><span><T k="ws.next2" /></span></div>
            <div className="sumline"><span><T k="ws.next3" /></span></div>
          </div>
          <div className="note"><Info /><span><T k="ws.noPrices" /></span></div>
        </div>
      </div></section>
    </>
  );
}
