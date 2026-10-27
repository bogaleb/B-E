import Image from "next/image";
import Link from "next/link";
import { Store, CookingPot, Truck } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { GrainSpill } from "@/components/site/GrainSpill";
import { FieldToBag } from "@/components/site/FieldToBag";
import { ProductCard } from "@/components/site/ProductCard";
import { GrainSwatch } from "@/components/site/GrainSwatch";
import { T } from "@/components/site/T";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { CATEGORY_AM } from "@/lib/i18n";

export const revalidate = 300;

export default async function Home() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const featured = products.filter((p) => p.isFeatured).slice(0, 3);
  const hero = settings["home.hero"] as { lede: string; ledeAm?: string };
  const story = settings["about.story"] as { body: string; bodyAm?: string };
  return (
    <>
      <Hero lede={hero.lede} ledeAm={hero.ledeAm} />
      <GrainSpill />
      <div className="strip" aria-hidden="true">
        <div className="track">
          {[0, 1].map((n) => (
            <span key={n} style={{ display: "contents" }}>
              {products.map((p) => <span key={`${n}-${p.slug}`} style={{ display: "contents" }}><span><T en={p.name} am={p.nameAm ?? undefined} />{p.geezName && <span className="geez l-en" lang="am">{p.geezName}</span>}</span><i /></span>)}
              <span><T k="marquee.rw" /></span><i />
              <span>{settings.contact.city}, {settings.contact.state}</span><i />
            </span>
          ))}
        </div>
      </div>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div><span className="kicker"><T k="home.range.kicker" /></span><h2><T k="home.range.title" /></h2><p className="lede"><T k="home.range.lede" /></p></div>
            <Link className="btn ghost" href="/products"><T k="cta.seeAll" /></Link>
          </div>
          <div className="pgrid three">{featured.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </div>
      </section>

      <FieldToBag />

      <section className="sec cream">
        <div className="wrap">
          <div className="sec-head"><div><span className="kicker"><T k="home.kinds.kicker" /></span><h2><T k="home.kinds.title" /></h2></div></div>
          <div className="cats">
            {categories.map((c) => {
              const items = products.filter((p) => p.category?.slug === c.slug);
              if (!items.length) return null;
              return (
                <Link key={c.slug} className="cat" href={`/products?category=${c.slug}`}>
                  <span style={{ position: "absolute", inset: "0 0 auto 0", height: 96, WebkitMaskImage: "linear-gradient(#000 40%,transparent)", maskImage: "linear-gradient(#000 40%,transparent)" }}><GrainSwatch grain={items[0]!.grain} /></span>
                  <b><T en={c.name} am={c.nameAm ?? CATEGORY_AM[c.slug]} /></b>
                  <span>{items.map((p, i) => <span key={p.slug}>{i ? ", " : ""}<T en={p.name} am={p.nameAm ?? undefined} /></span>)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head"><div><span className="kicker"><T k="home.how.kicker" /></span><h2><T k="home.how.title" /></h2><p className="lede"><T k="home.how.lede" /></p></div></div>
          <div className="steps">
            <div className="step"><span className="n">1</span><h3><T k="home.how.1.t" /></h3><p><T k="home.how.1.p" /></p></div>
            <div className="step"><span className="n">2</span><h3><T k="home.how.2.t" /></h3><p><T k="home.how.2.p" /></p></div>
            <div className="step"><span className="n">3</span><h3><T k="home.how.3.t" /></h3><p><T k="home.how.3.p" /></p></div>
          </div>
        </div>
      </section>

      <section className="band sec">
        <div className="wrap story">
          <div className="logoplate"><Image src="/images/logo-white-gold.webp" alt="ETHIO logo" width={520} height={230} style={{ width: "72%", height: "auto" }} /></div>
          <div className="copy">
            <span className="kicker"><T k="home.story.kicker" /></span>
            <h2><T k="home.story.title" /></h2>
            <p className="lede"><T en={story.body} am={story.bodyAm} /></p>
            <div className="facts">
              <div><b>{settings.contact.company}</b><span><T k="home.fact.company" /></span></div>
              <div><b>{settings.contact.city}, {settings.contact.state}</b><span><T k="home.fact.based" /></span></div>
              <div><b><T k="home.fact.rw" /></b><span><T k="home.fact.rw.sub" /></span></div>
              <div><b><T k="home.fact.clear" /></b><span><T k="home.fact.clear.sub" /></span></div>
            </div>
            <div><Link className="btn on-dark" href="/about"><T k="cta.story" /></Link></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="promo">
            <div className="l"><span className="kicker"><T k="home.biz.kicker" /></span><h2><T k="home.biz.title" /></h2><p className="lede"><T k="home.biz.lede" /></p><div className="hero-actions"><Link className="btn" href="/wholesale"><T k="cta.startWholesale" /></Link></div></div>
            <div className="r"><ul>
              <li><Store /><div><b><T k="home.biz.grocery" /></b><span><T k="home.biz.grocery.sub" /></span></div></li>
              <li><CookingPot /><div><b><T k="home.biz.rest" /></b><span><T k="home.biz.rest.sub" /></span></div></li>
              <li><Truck /><div><b><T k="home.biz.dist" /></b><span><T k="home.biz.dist.sub" /></span></div></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap"><div className="cta">
          <div style={{ display: "grid", gap: 10, maxWidth: 560 }}><h2><T k="home.cta.title" /></h2><p className="muted"><T k="home.cta.sub" /></p></div>
          <div className="hero-actions"><Link className="btn" href="/contact"><T k="cta.contact" /></Link><Link className="btn ghost" href="/faq"><T k="cta.faq" /></Link></div>
        </div></div>
      </section>
    </>
  );
}
