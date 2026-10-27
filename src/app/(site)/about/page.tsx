import type { Metadata } from "next";
import { T } from "@/components/site/T";
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
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/"><T k="nav.home" /></Link><span>/</span><span><T k="foot.aboutUs" /></span></nav>
        <span className="kicker"><T k="ab.kicker" /></span>
        <h1><T en={`A pantry brand from ${s.contact.company.replace(" LLC", "")}`} am="ከቢ ኤንድ ኢ ሆልሴል የመጣ የጓዳ ብራንድ" /></h1>
        <p className="lede"><T en={s["about.story"].body} am={(s["about.story"] as { bodyAm?: string }).bodyAm} /></p>
      </div></section>
      <section className="sec"><div className="wrap story" style={{ gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)" }}>
        <div className="stage" style={{ cursor: "default", aspectRatio: "4/3" }}>
          <Image src="/images/flax-photo.webp" alt="ETHIO brown flax seeds bag in a store aisle" fill sizes="(max-width: 900px) 100vw, 45vw" style={{ objectFit: "cover" }} />
          <span className="tag"><T k="tag.actual" /></span>
        </div>
        <div className="copy" style={{ display: "grid", gap: 20 }}>
          <h2 style={{ fontSize: "clamp(30px,3.2vw,44px)" }}><T k="ab.h2" /></h2>
          <p className="lede"><T k="ab.p1" /></p>
          <p className="lede"><T k="ab.p2" /></p>
        </div>
      </div></section>
      <section className="sec cream"><div className="wrap">
        <div className="sec-head"><div><span className="kicker"><T k="ab.how" /></span><h2><T k="ab.expect" /></h2></div></div>
        <div className="trio">
          <div><Leaf /><h3><T k="ab.v1.t" /></h3><p><T k="ab.v1.p" /></p></div>
          <div><MessageSquare /><h3><T k="ab.v2.t" /></h3><p><T k="ab.v2.p" /></p></div>
          <div><Box /><h3><T k="ab.v3.t" /></h3><p><T k="ab.v3.p" /></p></div>
        </div>
      </div></section>
      <section className="band sec"><div className="wrap" style={{ display: "grid", gap: 18, justifyItems: "start", maxWidth: 820, marginInline: "auto" }}>
        <h2><T k="ab.shelves" /></h2>
        <p className="lede"><T k="ab.shelvesP" /></p>
        <div className="hero-actions"><Link className="btn on-dark" href="/wholesale"><T k="cta.startWholesale" /></Link><Link className="btn ghost-dark" href="/contact"><T k="cta.contact" /></Link></div>
      </div></section>
    </>
  );
}
