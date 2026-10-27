"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { CATEGORY_AM } from "@/lib/i18n";
import { useT } from "./prefs";
import { T } from "./T";

export function Catalog({ products, categories }: { products: Product[]; categories: Category[] }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  // Read ?category= after hydration so the page can stay statically rendered.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("category");
    if (c && categories.some((x) => x.slug === c)) setCat(c);
  }, [categories]);
  const [photo, setPhoto] = useState(false);
  const counts = useMemo(() => Object.fromEntries(categories.map((c) => [c.slug, products.filter((p) => p.category?.slug === c.slug).length])), [categories, products]);
  const list = products.filter((p) => {
    const needle = q.trim().toLowerCase();
    return (!cat || p.category?.slug === cat) && (!photo || p.images.some((i) => i.kind === "actual")) &&
      (!needle || [p.name, p.nameAm, p.packageName, p.category?.name, p.category?.nameAm, p.shortDescription, p.shortDescriptionAm, p.geezName, p.geezLatin, ...p.uses, ...p.usesAm].join(" ").toLowerCase().includes(needle));
  });
  const lead = list.length === 5 || list.length === 2;
  return (
    <>
      <div className="toolbar">
        <div className="search"><Search aria-hidden="true" /><label className="sr" htmlFor="q"><T k="cat.searchLabel" /></label>
          <input id="q" type="search" placeholder={t("cat.search")} autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chips" role="group" aria-label={t("cat.searchLabel")}>
          <button className="chip" aria-pressed={!cat} onClick={() => setCat("")}><T k="cat.all" /><span className="c">{products.length}</span></button>
          {categories.map((c) => (
            <button key={c.slug} className="chip" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)}><T en={c.name} am={c.nameAm ?? CATEGORY_AM[c.slug]} /><span className="c">{counts[c.slug] ?? 0}</span></button>
          ))}
        </div>
        <label className="toggle"><input id="photoonly" type="checkbox" checked={photo} onChange={(e) => setPhoto(e.target.checked)} /><T k="cat.photoOnly" /></label>
      </div>
      <h2 className="sr">Product list</h2>
      <p className="sr" aria-live="polite">{list.length} products shown</p>
      <div className={`pgrid three${lead ? " lead" : ""}`}>
        {list.length ? list.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 3} />) : (
          <div className="empty" style={{ gridColumn: "1/-1" }}>
            <h3><T k="cat.none" />{q ? <> “{q}”</> : null}</h3>
            <p className="muted"><T k="cat.noneHelp" /></p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <button className="btn ghost" type="button" onClick={() => { setQ(""); setCat(""); setPhoto(false); }}><T k="cta.clear" /></button>
              <Link className="btn" href="/contact"><T k="cta.askProduct" /></Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
