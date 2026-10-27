"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartLine, Product } from "@/lib/types";
import { ASK_SIZE } from "@/lib/utils";
import { GrainSwatch } from "./GrainSwatch";
import { cart, toast } from "./store";
import { useLang, useT } from "./prefs";
import { pName } from "./ProductCard";
import { T } from "./T";

export function LineItem({ line, index, product, compact }: { line: CartLine; index: number; product: Product | undefined; compact?: boolean }) {
  const lang = useLang();
  const t = useT();
  const name = product ? pName(product, lang) : line.slug;
  const img = product?.images[0];
  return (
    <div className="line">
      <Link className="th" href={product ? `/products/${product.slug}` : "/products"} aria-label={name}>
        {img ? <Image src={img.src} alt="" width={220} height={165} /> : product ? <GrainSwatch grain={product.grain} /> : null}
      </Link>
      <div style={{ minWidth: 0 }}>
        <h3>{product ? <T en={product.name} am={product.nameAm ?? undefined} /> : line.slug}</h3>
        <div className="sub">{line.variant === ASK_SIZE ? <T k="size.ask" /> : line.variant} · <T k={line.buyer === "business" ? "inq.business" : "inq.household"} /></div>
        {!product && <div className="sub" style={{ color: "var(--red)" }}><T k="inq.unavailable" /></div>}
      </div>
      <div className="ctl">
        <div className="qty" role="group" aria-label={name}>
          <button type="button" aria-label={t("qty.dec")} onClick={() => cart.setQty(index, line.qty - 1)}><Minus size={16} /></button>
          <input id={`qty-${compact ? "d" : "p"}-${index}`} inputMode="numeric" aria-label={t("qty.bags")} value={line.qty}
            onChange={(e) => { const v = parseInt(e.target.value, 10); if (Number.isFinite(v)) cart.setQty(index, v); }} />
          <button type="button" aria-label={t("qty.inc")} onClick={() => cart.setQty(index, line.qty + 1)}><Plus size={16} /></button>
        </div>
        <button className="iconbtn" type="button" aria-label={`${t("remove")}: ${name}`} onClick={() => { cart.remove(index); toast(`${name} ${t("toast.removed")}`); }}><Trash2 size={18} /></button>
      </div>
    </div>
  );
}
