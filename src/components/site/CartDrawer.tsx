"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { totalQty } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { LineItem } from "./LineItem";
import { drawer, useCart, useDrawer } from "./store";
import { useT } from "./prefs";
import { T } from "./T";

/** Slide-in inquiry list. Animated with CSS transitions only, so it adds no animation library to the page. */
export function CartDrawer({ products }: { products: Product[] }) {
  const open = useDrawer();
  const lines = useCart();
  const path = usePathname();
  const t = useT();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => drawer.close(), [path]);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && drawer.close();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  const bySlug = (s: string) => products.find((p) => p.slug === s);
  return (
    <>
      <div className={`scrim${open ? " on" : ""}`} onClick={drawer.close} aria-hidden="true" />
      <aside className={`drawer${open ? " on" : ""}`} role="dialog" aria-modal="true" aria-label={t("inq.drawer")} aria-hidden={!open} inert={!open}>
        <div className="dh"><h2><T k="inq.drawer" /></h2><button ref={closeRef} className="iconbtn" aria-label={t("close")} onClick={drawer.close}><X size={18} /></button></div>
        <div className="db">
          {lines.length === 0 ? (
            <div className="empty" style={{ marginTop: 12 }}>
              <h3><T k="inq.empty" /></h3>
              <p className="muted"><T k="inq.emptyHelp" /></p>
              <Link className="btn" href="/products"><T k="cta.browse" /></Link>
            </div>
          ) : (
            lines.map((l, i) => (
              <div key={`${l.slug}-${l.variant}-${l.buyer}`} className="lineIn">
                <LineItem line={l} index={i} product={bySlug(l.slug)} compact />
              </div>
            ))
          )}
        </div>
        {lines.length > 0 && (
          <div className="df">
            <div className="sumline"><span><T k="inq.total" /></span><b>{totalQty(lines)}</b></div>
            <Link className="btn red" href="/order"><T k="cta.continueOrder" /> <ArrowRight /></Link>
            <Link className="btn ghost" href="/inquiry"><T k="cta.review" /></Link>
          </div>
        )}
      </aside>
    </>
  );
}
