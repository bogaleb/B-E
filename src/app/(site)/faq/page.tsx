import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ", description: "How ordering, delivery, wholesale and product information work at ETHIO Foods.", alternates: { canonical: "/faq" } };

const FAQ: [string, string][] = [
  ["Can I pay online?", "Not yet. This site collects order requests. We contact you to confirm price, availability and delivery, and arrange payment directly."],
  ["Does sending a request confirm my order?", "No. A request tells us what you want. Your order is confirmed only after we contact you and agree on the details."],
  ["How will you contact me?", "By the email or phone number you enter on the request form, using the reference number shown after you send it."],
  ["Where do you deliver?", "Enter your ZIP code on the order request. We'll tell you what delivery or pickup options are available for your area."],
  ["Do you sell wholesale?", "Yes. Grocery stores, supermarkets, restaurants and distributors can send a wholesale inquiry with products, quantities and how often they plan to order."],
  ["Are the package photos real?", "Photos labeled “Actual package” show real ETHIO bags. Images labeled “Package concept” are design previews; the bag you receive may look different."],
  ["Where can I find ingredients and nutrition facts?", "They're printed on every package. We add verified details to each product page as we confirm them."],
  ["Can I ask for a product you don't list?", "Yes. Send us a message from the contact page and tell us what you're looking for."],
];

export default function FaqPage() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <>
      <section className="phead"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>FAQ</span></nav>
        <h1>Questions and answers</h1>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap"><div className="faq">
        {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </div></div></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
