import type { Metadata } from "next";
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
        <nav className="crumbs" aria-label="Breadcrumb" style={{ color: "#A9C0B1" }}><Link href="/">Home</Link><span>/</span><span>Wholesale</span></nav>
        <span className="kicker">For businesses</span>
        <h1>Wholesale for stores, restaurants and distributors</h1>
        <p className="lede">Tell us which ETHIO products you need, in what quantities and how often. We&apos;ll reply with pricing, availability and delivery options for your location.</p>
      </div></section>
      <section className="band" style={{ paddingBlock: "0 64px" }}><div className="wrap"><div className="quad">
        <div><b>Grocery stores</b><span>Retail-ready 2 lb bags with printed barcodes.</span></div>
        <div><b>Supermarkets</b><span>Steady supply across multiple products.</span></div>
        <div><b>Restaurants</b><span>The pulses and grains your menu depends on.</span></div>
        <div><b>Distributors</b><span>Mixed orders across the full range.</span></div>
      </div></div></section>
      <section className="sec"><div className="wrap split">
        <WholesaleForm products={products} />
        <div className="aside">
          <div className="sumcard"><h2>What happens next</h2>
            <div className="sumline"><span>1. You&apos;ll see a reference number</span></div>
            <div className="sumline"><span>2. We review your request</span></div>
            <div className="sumline"><span>3. We contact you with an offer</span></div>
          </div>
          <div className="note"><Info /><span>We don&apos;t publish wholesale prices online. Pricing depends on products, volume and delivery location.</span></div>
        </div>
      </div></section>
    </>
  );
}
