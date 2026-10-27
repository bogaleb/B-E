import Image from "next/image";
import Link from "next/link";
import { Store, CookingPot, Truck } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { GrainSwatch } from "@/components/site/GrainSwatch";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export default async function Home() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const featured = products.filter((p) => p.isFeatured).slice(0, 3);
  const marquee = [...products.map((p) => ({ k: p.slug, t: p.name, g: p.geezName })), { k: "rw", t: "Retail & wholesale", g: null }, { k: "va", t: `${settings.contact.city}, ${settings.contact.state}`, g: null }];
  return (
    <>
      <Hero lede={settings["home.hero"].lede} />
      <div className="strip" aria-hidden="true">
        <div className="track">
          {[0, 1].map((n) => marquee.map((m) => (
            <span key={`${n}-${m.k}`} style={{ display: "contents" }}>
              <span>{m.t}{m.g && <span className="geez" lang="am">{m.g}</span>}</span><i />
            </span>
          )))}
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div><span className="kicker">The range</span><h2>Staples for the pantry and the shelf</h2><p className="lede">Packed in clear bags so you can see what you&apos;re buying.</p></div>
            <Link className="btn ghost" href="/products">See all products</Link>
          </div>
          <div className="grid three">{featured.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </div>
      </section>

      <section className="sec cream">
        <div className="wrap">
          <div className="sec-head"><div><span className="kicker">Shop by kind</span><h2>Lentils, seeds, grains and beans</h2></div></div>
          <div className="cats">
            {categories.map((c) => {
              const items = products.filter((p) => p.category?.slug === c.slug);
              if (!items.length) return null;
              return (
                <Link key={c.slug} className="cat" href={`/products?category=${c.slug}`}>
                  <span style={{ position: "absolute", inset: "0 0 auto 0", height: 96, WebkitMaskImage: "linear-gradient(#000 40%,transparent)", maskImage: "linear-gradient(#000 40%,transparent)" }}><GrainSwatch grain={items[0]!.grain} /></span>
                  <b>{c.name}</b><span>{items.map((p) => p.name).join(", ")}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="kicker">How ordering works</span><h2>No checkout. Just a conversation.</h2><p className="lede">We don&apos;t take payment online. Every order is confirmed by a person, so you know the price and delivery before anything ships.</p></div></div>
          <div className="steps">
            <div className="step"><span className="n">1</span><h3>Build your list</h3><p>Add products and quantities to your inquiry list. Retail or wholesale, any mix.</p></div>
            <div className="step"><span className="n">2</span><h3>Send the request</h3><p>Tell us who you are and where it&apos;s going. You get a reference number right away.</p></div>
            <div className="step"><span className="n">3</span><h3>We confirm with you</h3><p>B&amp;E Wholesale contacts you with price, stock and delivery details to finish the order.</p></div>
          </div>
        </div>
      </section>

      <section className="band sec">
        <div className="wrap story">
          <div className="logoplate"><Image src="/images/logo-white-gold.webp" alt="ETHIO logo" width={520} height={230} style={{ width: "72%", height: "auto" }} /></div>
          <div className="copy">
            <span className="kicker">Our story</span>
            <h2>Good ingredients, packed with care and easy to find</h2>
            <p className="lede">{settings["about.story"].body}</p>
            <div className="facts">
              <div><b>{settings.contact.company}</b><span>The company behind ETHIO</span></div>
              <div><b>{settings.contact.city}, {settings.contact.state}</b><span>Where we&apos;re based</span></div>
              <div><b>Retail &amp; wholesale</b><span>Households, stores and restaurants</span></div>
              <div><b>Clear packaging</b><span>See the product before you buy</span></div>
            </div>
            <div><Link className="btn on-dark" href="/about">Read our story</Link></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="promo">
            <div className="l"><span className="kicker">For businesses</span><h2>Stock ETHIO in your store or kitchen</h2><p className="lede">Grocery stores, supermarkets, restaurants and distributors can request wholesale quantities. Tell us what you need and how often, and we&apos;ll put together an offer.</p><div className="hero-actions"><Link className="btn" href="/wholesale">Start a wholesale inquiry</Link></div></div>
            <div className="r"><ul>
              <li><Store /><div><b>Grocery &amp; supermarkets</b><span>Shelf-ready 2 lb bags with barcodes</span></div></li>
              <li><CookingPot /><div><b>Restaurants</b><span>Regular supply of the staples you cook with</span></div></li>
              <li><Truck /><div><b>Distributors</b><span>Mixed orders across the ETHIO range</span></div></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap"><div className="cta">
          <div style={{ display: "grid", gap: 10, maxWidth: 560 }}><h2>Have a question before you order?</h2><p className="muted">Ask about stock, sizes or delivery. We&apos;ll get back to you.</p></div>
          <div className="hero-actions"><Link className="btn" href="/contact">Contact us</Link><Link className="btn ghost" href="/faq">Read the FAQ</Link></div>
        </div></div>
      </section>
    </>
  );
}
