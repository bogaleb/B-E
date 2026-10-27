import type { Metadata } from "next";
import { T } from "@/components/site/T";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox, Gallery } from "@/components/site/ProductDetail";
import { ProductCard } from "@/components/site/ProductCard";
import { getProduct, getProducts } from "@/lib/catalog";
import { publicEnv } from "@/lib/env";
import { defaultVariant } from "@/lib/utils";
import { CATEGORY_AM } from "@/lib/i18n";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  const img = p.images.find((i) => i.kind === "actual") ?? p.images[0];
  return {
    title: p.name, description: p.shortDescription, alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: `${p.name} · ETHIO Foods`, description: p.shortDescription, images: img ? [{ url: img.src, alt: img.alt }] : undefined },
  };
}

const COLORS: Record<string, string> = { lentil: "var(--lentil)", flax: "var(--flax)", fava: "var(--fava)", bulgur: "var(--bulgur)", bean: "var(--bean)" };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const others = (await getProducts()).filter((x) => x.slug !== p.slug).slice(0, 4);
  const v = defaultVariant(p.variants);
  const hasLabel = p.images.some((i) => i.src.includes("label"));
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: `ETHIO ${p.name}`, description: p.shortDescription,
    brand: { "@type": "Brand", name: "ETHIO" }, category: p.category?.name,
    image: p.images.filter((i) => i.kind === "actual").map((i) => (i.src.startsWith("http") ? i.src : publicEnv.siteUrl + i.src)),
    ...(v?.upc ? { gtin12: v.upc.replace(/\D/g, "").slice(0, 12) } : {}),
    ...(v?.netWeight ? { weight: v.netWeight } : {}),
  };
  return (
    <>
      <section className="sec" style={{ paddingTop: 36 }}><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb" style={{ marginBottom: 26 }}><Link href="/"><T k="nav.home" /></Link><span>/</span><Link href="/products"><T k="nav.products" /></Link><span>/</span><span><T en={p.name} am={p.nameAm ?? undefined} /></span></nav>
        <div className="detail" style={{ "--c": COLORS[p.grain] } as React.CSSProperties}>
          <Gallery product={p} />
          <div className="info">
            <div style={{ display: "grid", gap: 12 }}>
              {p.category && <span className="kicker"><T en={p.category.name} am={p.category.nameAm ?? CATEGORY_AM[p.category.slug]} /></span>}
              <h1><T en={p.name} am={p.nameAm ?? undefined} /></h1>
              {p.geezName && <div className="gzname" lang="am">{p.geezName} <small lang="en">{p.geezLatin}</small></div>}
              <p className="lede"><T en={p.shortDescription} am={p.shortDescriptionAm ?? undefined} /></p>
            </div>
            <BuyBox product={p} />
            {p.uses.length > 0 && <div style={{ display: "grid", gap: 12 }}><h2 style={{ fontSize: 24 }}><T k="buy.goodFor" /></h2><div className="uses">{p.uses.map((u, i) => <span key={u}><T en={u} am={p.usesAm[i]} /></span>)}</div></div>}
            <dl className="specs">
              <div><dt><T k="spec.weight" /></dt><dd>{v?.netWeight ? <>{v.netWeight} <T k="spec.weightPrinted" /></> : <T k="spec.weightAsk" />}</dd></div>
              <div><dt><T k="spec.ingredients" /></dt><dd>{p.ingredients ?? <T k="spec.ingredientsPending" />}</dd></div>
              <div><dt><T k="spec.nutrition" /></dt><dd>
                {p.nutrition ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}><tbody>
                    {p.nutrition.servingSize && <tr><td>Serving size</td><td style={{ textAlign: "right" }}>{p.nutrition.servingSize}</td></tr>}
                    {p.nutrition.calories !== undefined && <tr><td>Calories</td><td style={{ textAlign: "right" }}>{p.nutrition.calories}</td></tr>}
                    {p.nutrition.rows?.map((r) => <tr key={r.label}><td>{r.label}</td><td style={{ textAlign: "right" }}>{r.amount}{r.dailyValue ? ` · ${r.dailyValue}` : ""}</td></tr>)}
                  </tbody></table>
                ) : hasLabel ? <T k="spec.nutritionLabel" /> : <T k="spec.nutritionPending" />}
              </dd></div>
              {v?.upc && <div><dt><T k="spec.upc" /></dt><dd style={{ fontVariantNumeric: "tabular-nums" }}>{v.upc}</dd></div>}
              <div><dt><T k="spec.distributor" /></dt><dd>B&amp;E Wholesale LLC, Sterling, Virginia</dd></div>
            </dl>
          </div>
        </div>
      </div></section>
      <section className="sec cream"><div className="wrap">
        <div className="sec-head"><div><h2><T k="more.title" /></h2></div><Link className="btn ghost" href="/products"><T k="cta.allProducts" /></Link></div>
        <div className={`pgrid ${others.length >= 4 ? "four" : "three"}`}>{others.map((o) => <ProductCard key={o.slug} product={o} />)}</div>
      </div></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
