import type { Metadata } from "next";
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
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Contact</span></nav>
        <h1>Contact us</h1>
        <p className="lede">Questions about a product, stock or delivery? Send us a message and we&apos;ll reply by email or phone.</p>
      </div></section>
      <section className="sec" style={{ paddingTop: 44 }}><div className="wrap split">
        <ContactForm />
        <div className="aside">
          <div className="sumcard">
            <h2>{c.company}</h2>
            <p className="muted">{c.city}, {c.state}</p>
            {c.email && <p><span className="muted">Email </span><span style={{ userSelect: "all" }}>{c.email}</span></p>}
            {c.phone && <p><span className="muted">Phone </span><span style={{ userSelect: "all" }}>{c.phone}</span></p>}
            {c.hours && <p className="muted">{c.hours}</p>}
          </div>
          <div className="note green"><Info /><span>Ready to order? Add products to your <Link className="link" href="/inquiry">inquiry list</Link> and send an order request instead. It&apos;s faster for us to confirm.</span></div>
        </div>
      </div></section>
    </>
  );
}
