"use client";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { totalQty } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { LineItem } from "./LineItem";
import { useCart } from "./store";

export function InquiryList({ products }: { products: Product[] }) {
  const lines = useCart();
  const bySlug = (s: string) => products.find((p) => p.slug === s);
  if (!lines.length) return (
    <div className="empty"><h2>Your inquiry list is empty</h2><p className="muted">Add products from the catalog to build a request.</p><Link className="btn" href="/products">Browse products</Link></div>
  );
  const unavailable = lines.some((l) => !bySlug(l.slug));
  return (
    <div className="split">
      <div className="lines">
        <h2 className="sr">Products in your list</h2>
        {lines.map((l, i) => <LineItem key={`${l.slug}-${l.variant}-${l.buyer}`} line={l} index={i} product={bySlug(l.slug)} />)}
        <div><Link className="link" href="/products">+ Add more products</Link></div>
      </div>
      <div className="aside">
        <div className="sumcard">
          <h2>Summary</h2>
          {lines.map((l) => <div className="sumline" key={`${l.slug}-${l.variant}-${l.buyer}`}><span>{bySlug(l.slug)?.name ?? l.slug} <span className="muted">· {l.buyer === "business" ? "Business" : "Household"}</span></span><b>{l.qty}</b></div>)}
          <div className="sumline"><span><b>Total bags</b></span><b>{totalQty(lines)}</b></div>
          {unavailable ? <p className="muted">Remove unavailable products to continue.</p> : <Link className="btn red" href="/order">Continue to order request <ArrowRight /></Link>}
        </div>
        <div className="note"><Info /><span>This list isn&apos;t an order. Nothing is charged, and prices aren&apos;t fixed until we confirm them with you.</span></div>
      </div>
    </div>
  );
}
