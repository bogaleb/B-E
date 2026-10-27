"use client";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { totalQty } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { LineItem } from "./LineItem";
import { useCart } from "./store";
import { T } from "./T";

export function InquiryList({ products }: { products: Product[] }) {
  const lines = useCart();
  const bySlug = (s: string) => products.find((p) => p.slug === s);
  if (!lines.length) return (
    <div className="empty"><h2><T k="inq.emptyTitle" /></h2><p className="muted"><T k="inq.emptyHelp" /></p><Link className="btn" href="/products"><T k="cta.browse" /></Link></div>
  );
  const unavailable = lines.some((l) => !bySlug(l.slug));
  return (
    <div className="split">
      <div className="lines">
        <h2 className="sr">Products in your list</h2>
        {lines.map((l, i) => <LineItem key={`${l.slug}-${l.variant}-${l.buyer}`} line={l} index={i} product={bySlug(l.slug)} />)}
        <div><Link className="link" href="/products"><T k="cta.addMore" /></Link></div>
      </div>
      <div className="aside">
        <div className="sumcard">
          <h2><T k="inq.summary" /></h2>
          {lines.map((l) => <div className="sumline" key={`${l.slug}-${l.variant}-${l.buyer}`}><span>{(() => { const p = bySlug(l.slug); return p ? <T en={p.name} am={p.nameAm ?? undefined} /> : l.slug; })()} <span className="muted">· <T k={l.buyer === "business" ? "inq.business" : "inq.household"} /></span></span><b>{l.qty}</b></div>)}
          <div className="sumline"><span><b><T k="inq.total" /></b></span><b>{totalQty(lines)}</b></div>
          {unavailable ? <p className="muted"><T k="inq.removeToContinue" /></p> : <Link className="btn red" href="/order"><T k="cta.continueOrder" /> <ArrowRight /></Link>}
        </div>
        <div className="note"><Info /><span><T k="inq.notOrder" /></span></div>
      </div>
    </div>
  );
}
