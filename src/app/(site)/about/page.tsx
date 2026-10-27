import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Box, Leaf, MessageSquare } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;
export const metadata: Metadata = { title: "About us", description: "ETHIO is the packaged-food brand of B&E Wholesale LLC in Sterling, Virginia.", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>About us</span></nav>
        <span className="kicker">About ETHIO</span>
        <h1>A pantry brand from {s.contact.company.replace(" LLC", "")}</h1>
        <p className="lede">{s["about.story"].body}</p>
      </div></section>
      <section className="sec"><div className="wrap story" style={{ gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)" }}>
        <div className="stage" style={{ cursor: "default", aspectRatio: "4/3" }}>
          <Image src="/images/flax-photo.webp" alt="ETHIO brown flax seeds bag in a store aisle" fill sizes="(max-width: 900px) 100vw, 45vw" style={{ objectFit: "cover" }} />
          <span className="tag">Actual package</span>
        </div>
        <div className="copy" style={{ display: "grid", gap: 20 }}>
          <h2 style={{ fontSize: "clamp(30px,3.2vw,44px)" }}>Familiar food, easy to find</h2>
          <p className="lede">Our customers cook misir wot on weeknights, bake with flax and keep fava beans in the cupboard for ful. We want those ingredients to be easy to find and clearly labeled, whether you&apos;re buying one bag or stocking a store.</p>
          <p className="lede">Every ETHIO order is handled directly by our team. That&apos;s why this site collects requests instead of payments: we confirm the details with you first.</p>
        </div>
      </div></section>
      <section className="sec cream"><div className="wrap">
        <div className="sec-head"><div><span className="kicker">How we work</span><h2>What you can expect from us</h2></div></div>
        <div className="trio">
          <div><Leaf /><h3>Clear, honest labels</h3><p>Net weight, barcode and nutrition facts are printed on every bag. We add verified details to this site as we confirm them.</p></div>
          <div><MessageSquare /><h3>A real person confirms</h3><p>We reply to every order request and wholesale inquiry ourselves, with prices and delivery details.</p></div>
          <div><Box /><h3>Retail and wholesale</h3><p>Buy a few bags for home or set up a regular supply for your store or restaurant.</p></div>
        </div>
      </div></section>
      <section className="band sec"><div className="wrap" style={{ display: "grid", gap: 18, justifyItems: "start", maxWidth: 820, marginInline: "auto" }}>
        <h2>Want ETHIO on your shelves?</h2>
        <p className="lede">Tell us about your business and we&apos;ll get back to you with an offer.</p>
        <div className="hero-actions"><Link className="btn on-dark" href="/wholesale">Start a wholesale inquiry</Link><Link className="btn ghost-dark" href="/contact">Contact us</Link></div>
      </div></section>
    </>
  );
}
