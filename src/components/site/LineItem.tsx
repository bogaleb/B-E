"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartLine, Product } from "@/lib/types";
import { GrainSwatch } from "./GrainSwatch";
import { cart, toast } from "./store";

export function LineItem({ line, index, product, compact }: { line: CartLine; index: number; product: Product | undefined; compact?: boolean }) {
  const name = product?.name ?? "Unavailable product";
  const img = product?.images[0];
  return (
    <div className="line">
      <Link className="th" href={product ? `/products/${product.slug}` : "/products"} aria-label={name}>
        {img ? <Image src={img.src} alt="" width={220} height={165} /> : product ? <GrainSwatch grain={product.grain} /> : null}
      </Link>
      <div style={{ minWidth: 0 }}>
        <h3>{name}</h3>
        <div className="sub">{line.variant} · {line.buyer === "business" ? "Business" : "Household"}</div>
        {!product && <div className="sub" style={{ color: "var(--red)" }}>No longer available. Remove it to continue.</div>}
      </div>
      <div className="ctl">
        <div className="qty" role="group" aria-label={`Quantity for ${name}`}>
          <button type="button" aria-label="Decrease" onClick={() => cart.setQty(index, line.qty - 1)}><Minus size={16} /></button>
          <input id={`qty-${compact ? "d" : "p"}-${index}`} inputMode="numeric" aria-label="Bags" value={line.qty}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (Number.isFinite(v)) cart.setQty(index, v); }} />
          <button type="button" aria-label="Increase" onClick={() => cart.setQty(index, line.qty + 1)}><Plus size={16} /></button>
        </div>
        <button className="iconbtn" type="button" aria-label={`Remove ${name}`} onClick={() => { cart.remove(index); toast(`${name} removed.`); }}><Trash2 size={18} /></button>
      </div>
    </div>
  );
}
