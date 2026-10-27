"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { totalQty } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { cart, useCart } from "./store";
import { check, Field, FormError, Honeypot, useSubmit, type Errors } from "./form";
import { useLang, useT } from "./prefs";
import { pName } from "./ProductCard";
import { ASK_SIZE } from "@/lib/utils";
import { T } from "./T";

export function OrderForm({ products }: { products: Product[] }) {
  const lines = useCart();
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const [buyerType, setBuyerType] = useState<"household" | "business">("household");
  const [f, setF] = useState({ name: "", email: "", phone: "", zip: "", businessName: "", notes: "", website: "" });
  const [consent, setConsent] = useState(false);
  const { errors, setErrors, formError, busy, submit } = useSubmit("/api/inquiries");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const name = (slug: string) => { const p = products.find((x) => x.slug === slug); return p ? pName(p, lang) : slug; };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (f.name.trim().length < 2) errs.name = t("e.name");
    if (!check.email(f.email)) errs.email = t("e.email");
    if (!check.phone(f.phone)) errs.phone = t("e.phone");
    if (!check.zip(f.zip)) errs.zip = t("e.zip");
    if (!consent) errs.consent = t("e.consent");
    setErrors(errs);
    if (Object.keys(errs).length) {
      (document.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement | null)?.focus();
      return;
    }
    const res = await submit({ buyerType, ...f, consent, items: lines.map((l) => ({ slug: l.slug, variant: l.variant, buyer: l.buyer, qty: l.qty })) });
    if (!res) return;
    const reference = String(res.reference ?? "");
    try {
      sessionStorage.setItem("ethio-last-request", JSON.stringify({ reference, type: "Order request", name: f.name, email: f.email, zip: f.zip,
        items: lines.map((l) => ({ name: name(l.slug), qty: `${l.qty} × ${l.variant}` })) }));
    } catch { /* ignore */ }
    cart.clear();
    router.push(`/order/confirmation?ref=${encodeURIComponent(reference)}`);
  }

  return (
    <div className="split">
      <form className="formcard" onSubmit={onSubmit} noValidate>
        <div className="note"><Info /><span><b><T k="ord.notice.b" /></b> <T k="ord.notice" /></span></div>
        <div className="field"><span className="lbl" id="lbl-ob"><T k="ord.for" /></span>
          <div className="seg" role="group" aria-labelledby="lbl-ob">
            <button type="button" aria-pressed={buyerType === "household"} onClick={() => setBuyerType("household")}><T k="buy.household" /></button>
            <button type="button" aria-pressed={buyerType === "business"} onClick={() => setBuyerType("business")}><T k="buy.business" /></button>
          </div>
        </div>
        <div className="fgrid2">
          <Field id="or-name" name="name" label={<T k="f.fullName" />} error={errors.name}><input id="or-name" name="name" autoComplete="name" value={f.name} onChange={set("name")} aria-invalid={!!errors.name} /></Field>
          <Field id="or-email" name="email" label={<T k="f.email" />} error={errors.email}><input id="or-email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} aria-invalid={!!errors.email} /></Field>
          <Field id="or-phone" name="phone" label={<T k="f.phone" />} error={errors.phone}><input id="or-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} aria-invalid={!!errors.phone} /></Field>
          <Field id="or-zip" name="zip" label={<T k="f.zip" />} error={errors.zip}><input id="or-zip" name="zip" inputMode="numeric" autoComplete="postal-code" placeholder="20164" value={f.zip} onChange={set("zip")} aria-invalid={!!errors.zip} /></Field>
          {buyerType === "business" && (
            <div className="full"><Field id="or-biz" name="businessName" label={<T k="f.business" />} optional error={errors.businessName}><input id="or-biz" name="businessName" autoComplete="organization" value={f.businessName} onChange={set("businessName")} /></Field></div>
          )}
          <div className="full"><Field id="or-notes" name="notes" label={<T k="f.notes" />} optional error={errors.notes}><textarea id="or-notes" name="notes" placeholder={t("f.notesPh")} value={f.notes} onChange={set("notes")} maxLength={2000} /></Field></div>
        </div>
        <Honeypot value={f.website} onChange={(v) => setF({ ...f, website: v })} />
        <label className="check" style={errors.consent ? { color: "var(--red)" } : undefined}>
          <input type="checkbox" name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span><T k="ord.consent" /> <Link className="link" href="/privacy"><T k="ord.privacy" /></Link></span>
        </label>
        {errors.items && <FormError message={errors.items} />}
        <FormError message={formError} />
        <div><button className="btn red" type="submit" disabled={busy || lines.length === 0}>{busy ? <T k="cta.sending" /> : <><T k="ord.send" /> <ArrowRight /></>}</button></div>
      </form>
      <div className="aside">
        <div className="sumcard">
          {lines.length ? (
            <>
              <h2><T k="ord.products" /></h2>
              {lines.map((l) => <div className="sumline" key={`${l.slug}-${l.variant}-${l.buyer}`}><span>{name(l.slug)} <span className="muted">· {l.variant === ASK_SIZE ? <T k="size.ask" /> : l.variant}</span></span><b>{l.qty}</b></div>)}
              <div className="sumline"><span><b><T k="inq.total" /></b></span><b>{totalQty(lines)}</b></div>
              <Link className="link" href="/inquiry"><T k="cta.editList" /></Link>
            </>
          ) : (
            <><h2><T k="ord.noProducts" /></h2><p className="muted"><T k="ord.noProductsHelp" /></p><Link className="btn" href="/products"><T k="cta.browse" /></Link></>
          )}
        </div>
      </div>
    </div>
  );
}
