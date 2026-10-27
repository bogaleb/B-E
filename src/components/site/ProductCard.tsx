"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORY_AM } from "@/lib/i18n";
import { ASK_SIZE, defaultVariant } from "@/lib/utils";
import { GRAIN } from "./grains";
import { GrainSwatch } from "./GrainSwatch";
import { cart, flyToBag, toast } from "./store";
import { useLang, useT } from "./prefs";
import { addFeedback } from "./feedback";
import { T } from "./T";
import { blurProps } from "@/lib/blur";

export function KindTag({ kind, photo }: { kind: "actual" | "concept" | "soon"; photo?: boolean }) {
  if (kind === "actual") return <span className="tag"><T k={photo ? "tag.actualPhoto" : "tag.actual"} /></span>;
  if (kind === "concept") return <span className="tag concept"><T k="tag.concept" /></span>;
  return <span className="tag soon"><T k="tag.soon" /></span>;
}

export const pName = (p: Product, lang: string) => (lang === "am" && p.nameAm ? p.nameAm : p.name);
export function CatName({ p }: { p: Product }) {
  if (!p.category) return null;
  return <T en={p.category.name} am={p.category.nameAm ?? CATEGORY_AM[p.category.slug]} />;
}

export function ProductCard({ product: p, priority }: { product: Product; priority?: boolean }) {
  const img = p.images[0];
  const v = defaultVariant(p.variants);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const lang = useLang();
  const t = useT();
  const tilt = (e: React.PointerEvent) => {
    const c = ref.current;
    if (!c || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = c.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-3px)`;
  };
  return (
    <article className="card" ref={ref} onPointerMove={tilt} onPointerLeave={() => ref.current && (ref.current.style.transform = "")}>
      <Link href={`/products/${p.slug}`} style={{ textDecoration: "none", display: "contents" }}>
        <div className="media">
          {img ? <Image src={img.src} alt={img.alt} {...blurProps(img.src)} fill sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw" style={{ objectFit: "cover" }} priority={priority} /> : <GrainSwatch grain={p.grain} />}
          <KindTag kind={img ? img.kind : "soon"} />
          {p.geezName && <span className="gzmark" lang="am" aria-hidden="true">{p.geezName}</span>}
        </div>
        <div className="body">
          <div className="meta"><span><CatName p={p} /></span>{p.geezLatin && <span>{p.geezLatin}</span>}</div>
          <h3><T en={p.name} am={p.nameAm ?? undefined} /></h3>
          <p><T en={p.shortDescription} am={p.shortDescriptionAm ?? undefined} /></p>
        </div>
      </Link>
      <div className="foot">
        <span className="size">{v ? <>{v.label} <T k="size.bag" /></> : <T k="size.ask" />}</span>
        <button className={`addbtn${added ? " done" : ""}`} type="button"
          onClick={(e) => {
            cart.add({ slug: p.slug, variant: v?.label ?? ASK_SIZE, buyer: "household", qty: 1 });
            flyToBag(e.currentTarget, GRAIN[p.grain].colors);
            addFeedback();
            toast(`${pName(p, lang)} ${t("toast.added")}`, { href: "/inquiry", text: t("toast.view") });
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}>
          {added ? <><Check size={16} /><T k="cta.added" /></> : <><Plus size={16} /><T k="cta.add" /></>}
        </button>
      </div>
    </article>
  );
}
