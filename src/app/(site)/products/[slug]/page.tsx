import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox, Gallery } from "@/components/site/ProductDetail";
import { ProductCard } from "@/components/site/ProductCard";
import { getProduct, getProducts } from "@/lib/catalog";
import { publicEnv } from "@/lib/env";
import { defaultVariant } from "@/lib/utils";

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
        <nav className="crumbs" aria-label="Breadcrumb" style={{ marginBottom: 26 }}><Link href="/">Home</Link><span>/</span><Link href="/products">Products</Link><span>/</span><span>{p.name}</span></nav>
        <div className="detail" style={{ "--c": COLORS[p.grain] } as React.CSSProperties}>
          <Gallery product={p} />
          <div className="info">
            <div style={{ display: "grid", gap: 12 }}>
              {p.category && <span className="kicker">{p.category.name}</span>}
              <h1>{p.name}</h1>
              {p.geezName && <div className="gzname" lang="am">{p.geezName} <small lang="en">{p.geezLatin}</small></div>}
              <p className="lede">{p.shortDescription}</p>
            </div>
            <BuyBox product={p} />
            {p.uses.length > 0 && <div style={{ display: "grid", gap: 12 }}><h2 style={{ fontSize: 24 }}>Good for</h2><div className="uses">{p.uses.map((u) => <span key={u}>{u}</span>)}</div></div>}
            <dl className="specs">
              <div><dt>Net weight</dt><dd>{v?.netWeight ? `${v.netWeight} (as printed on package)` : "Ask us about current sizes"}</dd></div>
              <div><dt>Ingredients</dt><dd>{p.ingredients ?? "Listed on the package label. We'll publish them here once verified."}</dd></div>
              <div><dt>Nutrition facts</dt><dd>
                {p.nutrition ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}><tbody>
                    {p.nutrition.servingSize && <tr><td>Serving size</td><td style={{ textAlign: "right" }}>{p.nutrition.servingSize}</td></tr>}
                    {p.nutrition.calories !== undefined && <tr><td>Calories</td><td style={{ textAlign: "right" }}>{p.nutrition.calories}</td></tr>}
                    {p.nutrition.rows?.map((r) => <tr key={r.label}><td>{r.label}</td><td style={{ textAlign: "right" }}>{r.amount}{r.dailyValue ? ` · ${r.dailyValue}` : ""}</td></tr>)}
                  </tbody></table>
                ) : hasLabel ? "Printed on the package (see label photo). Verified figures will be added here." : "Printed on the package. Verified figures will be added here."}
              </dd></div>
              {v?.upc && <div><dt>UPC</dt><dd style={{ fontVariantNumeric: "tabular-nums" }}>{v.upc}</dd></div>}
              <div><dt>Distributed by</dt><dd>B&amp;E Wholesale LLC, Sterling, Virginia</dd></div>
            </dl>
          </div>
        </div>
      </div></section>
      <section className="sec cream"><div className="wrap">
        <div className="sec-head"><div><h2>More from ETHIO</h2></div><Link className="btn ghost" href="/products">All products</Link></div>
        <div className={`pgrid ${others.length >= 4 ? "four" : "three"}`}>{others.map((o) => <ProductCard key={o.slug} product={o} />)}</div>
      </div></section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </>
  );
}
