import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/site/T";

export const metadata: Metadata = { title: "FAQ", description: "How ordering, delivery, wholesale and product information work at ETHIO Foods.", alternates: { canonical: "/faq" } };

const FAQ_AM: [string, string][] = [
  ["በመስመር ላይ መክፈል እችላለሁ?", "ገና አይቻልም። ይህ ድረ ገጽ የትዕዛዝ ጥያቄዎችን ይቀበላል። ዋጋ፣ መኖርና ማድረሻን ለማረጋገጥ እናነጋግርዎታለን፤ ክፍያውንም በቀጥታ እናመቻቻለን።"],
  ["ጥያቄ መላክ ትዕዛዜን ያረጋግጣል?", "አይደለም። ጥያቄ የሚፈልጉትን ይነግረናል። ትዕዛዝዎ የሚረጋገጠው ካነጋገርንዎና በዝርዝሩ ከተስማማን በኋላ ብቻ ነው።"],
  ["እንዴት ታገኙኛላችሁ?", "በጥያቄው ቅጽ ላይ ባስገቡት ኢሜይል ወይም ስልክ፣ ከተላከ በኋላ የሚታየውን የማጣቀሻ ቁጥር በመጠቀም።"],
  ["የት ታደርሳላችሁ?", "በትዕዛዝ ጥያቄው ላይ ዚፕ ኮድዎን ያስገቡ። ለአካባቢዎ ያሉትን የማድረሻ ወይም የመውሰጃ አማራጮች እንነግርዎታለን።"],
  ["በጅምላ ትሸጣላችሁ?", "አዎ። ግሮሰሪዎች፣ ሱፐርማርኬቶች፣ ምግብ ቤቶችና አከፋፋዮች ምርቶችን፣ ብዛትንና በምን ያህል ጊዜ ለማዘዝ እንዳሰቡ የያዘ የጅምላ ጥያቄ መላክ ይችላሉ።"],
  ["የማሸጊያ ፎቶዎቹ እውነተኛ ናቸው?", "“ትክክለኛ ማሸጊያ” የተባሉት ፎቶዎች እውነተኛ የኢትዮ ከረጢቶችን ያሳያሉ። “የማሸጊያ ንድፍ” የተባሉት የንድፍ ቅድመ ዕይታዎች ናቸው፤ የሚደርስዎ ከረጢት የተለየ ሊመስል ይችላል።"],
  ["ግብዓቶችንና የአመጋገብ መረጃን የት አገኛለሁ?", "በእያንዳንዱ ማሸጊያ ላይ ታትመዋል። ያረጋገጥናቸውን ዝርዝሮች ወደ እያንዳንዱ የምርት ገጽ እንጨምራለን።"],
  ["ያልዘረዘራችሁትን ምርት መጠየቅ እችላለሁ?", "አዎ። ከ‹ያግኙን› ገጽ መልዕክት ይላኩልንና የሚፈልጉትን ይንገሩን።"],
];

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
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/"><T k="nav.home" /></Link><span>/</span><span><T k="foot.faq" /></span></nav>
        <h1><T k="faq.title" /></h1>
      </div></section>
      <section className="sec" style={{ paddingTop: 40 }}><div className="wrap"><div className="faq">
        {FAQ.map(([q, a], i) => <details key={q}><summary><T en={q} am={FAQ_AM[i]?.[0]} /></summary><p><T en={a} am={FAQ_AM[i]?.[1]} /></p></details>)}
      </div></div></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
