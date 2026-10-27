"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { totalQty } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { LineItem } from "./LineItem";
import { drawer, useCart, useDrawer } from "./store";
import { useT } from "./prefs";
import { T } from "./T";

export function CartDrawer({ products }: { products: Product[] }) {
  const open = useDrawer();
  const lines = useCart();
  const path = usePathname();
  const reduce = useReducedMotion();
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
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="scrim" className="scrim on" onClick={drawer.close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside key="drawer" className="drawer on" role="dialog" aria-modal="true" aria-label={t("inq.drawer")}
            initial={reduce ? { opacity: 0 } : { x: "102%" }} animate={reduce ? { opacity: 1 } : { x: 0 }} exit={reduce ? { opacity: 0 } : { x: "102%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}>
            <div className="dh"><h2><T k="inq.drawer" /></h2><button ref={closeRef} className="iconbtn" aria-label={t("close")} onClick={drawer.close}><X size={18} /></button></div>
            <div className="db">
              {lines.length === 0 ? (
                <div className="empty" style={{ marginTop: 12 }}>
                  <h3><T k="inq.empty" /></h3>
                  <p className="muted"><T k="inq.emptyHelp" /></p>
                  <Link className="btn" href="/products"><T k="cta.browse" /></Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {lines.map((l, i) => (
                    <motion.div key={`${l.slug}-${l.variant}-${l.buyer}`} layout={!reduce} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}>
                      <LineItem line={l} index={i} product={bySlug(l.slug)} compact />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            {lines.length > 0 && (
              <div className="df">
                <div className="sumline"><span><T k="inq.total" /></span><b>{totalQty(lines)}</b></div>
                <Link className="btn red" href="/order"><T k="cta.continueOrder" /> <ArrowRight /></Link>
                <Link className="btn ghost" href="/inquiry"><T k="cta.review" /></Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
