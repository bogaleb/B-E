import type { Metadata } from "next";
import { T } from "@/components/site/T";
import Link from "next/link";
import { Info } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;
export const metadata: Metadata = { title: "Contact", description: "Questions about ETHIO products, stock or delivery? Send B&E Wholesale a message.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const { contact: c } = await getSettings();
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/"><T k="nav.home" /></Link><span>/</span><span><T k="nav.contact" /></span></nav>
        <h1><T k="ct.title" /></h1>
        <p className="lede"><T k="ct.lede" /></p>
      </div></section>
      <section className="sec" style={{ paddingTop: 44 }}><div className="wrap split">
        <ContactForm />
        <div className="aside">
          <div className="sumcard">
            <h2>{c.company}</h2>
            <p className="muted">{c.city}, {c.state}</p>
            {c.email && <p><span className="muted"><T k="ct.email" /> </span><span style={{ userSelect: "all" }}>{c.email}</span></p>}
            {c.phone && <p><span className="muted"><T k="ct.phone" /> </span><span style={{ userSelect: "all" }}>{c.phone}</span></p>}
            {c.hours && <p className="muted">{c.hours}</p>}
          </div>
          <div className="note green"><Info /><span><T k="ct.ready" /> <Link className="link" href="/inquiry"><T k="foot.inquiry" /></Link></span></div>
        </div>
      </div></section>
    </>
  );
}
