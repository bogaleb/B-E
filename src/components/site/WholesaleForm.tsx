"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { BUSINESS_TYPES, FREQUENCIES } from "@/lib/validation";
import { useCart } from "./store";
import { check, Field, FormError, Honeypot, useSubmit, type Errors } from "./form";
import { BUSINESS_TYPES_AM, FREQUENCIES_AM } from "@/lib/i18n";
import { useLang, useT } from "./prefs";
import { pName } from "./ProductCard";
import { T } from "./T";

export function WholesaleForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const lines = useCart();
  const [f, setF] = useState({ businessName: "", contactName: "", email: "", phone: "", businessType: "", location: "", frequency: "", notes: "", website: "" });
  const [picked, setPicked] = useState<Record<string, { on: boolean; qty: string }>>(() =>
    Object.fromEntries(products.map((p) => [p.slug, { on: false, qty: "" }])));
  const [touchedPick, setTouchedPick] = useState(false);
  const [consent, setConsent] = useState(false);
  const { errors, setErrors, formError, busy, submit } = useSubmit("/api/wholesale");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  // Pre-select products already in the visitor's inquiry list (once, after the list loads).
  useEffect(() => {
    if (touchedPick || !lines.length) return;
    setPicked((prev) => {
      const next = { ...prev };
      for (const l of lines) if (next[l.slug]) next[l.slug] = { on: true, qty: `${(parseInt(next[l.slug]!.qty, 10) || 0) + l.qty} bags` };
      return next;
    });
    setTouchedPick(true);
  }, [lines, touchedPick]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (f.businessName.trim().length < 2) errs.businessName = t("e.business");
    if (f.contactName.trim().length < 2) errs.contactName = t("e.contact");
    if (!check.email(f.email)) errs.email = t("e.email");
    if (!check.phone(f.phone)) errs.phone = t("e.phone");
    if (!f.businessType) errs.businessType = t("e.type");
    if (f.location.trim().length < 2) errs.location = t("e.location");
    const chosen = Object.entries(picked).filter(([, v]) => v.on).map(([slug, v]) => ({ slug, quantity: v.qty }));
    if (!chosen.length) errs.products = t("e.products");
    if (!f.frequency) errs.frequency = t("e.freq");
    if (!consent) errs.consent = t("e.consent");
    setErrors(errs);
    if (Object.keys(errs).length) { (document.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement | null)?.focus(); return; }
    const res = await submit({ ...f, products: chosen, consent });
    if (!res) return;
    const reference = String(res.reference ?? "");
    try {
      sessionStorage.setItem("ethio-last-request", JSON.stringify({ reference, type: "Wholesale inquiry", name: f.contactName, email: f.email,
        items: chosen.map((c) => ({ name: (() => { const p = products.find((x) => x.slug === c.slug); return p ? pName(p, lang) : c.slug; })(), qty: c.quantity || "Quantity to discuss" })) }));
    } catch { /* ignore */ }
    router.push(`/order/confirmation?ref=${encodeURIComponent(reference)}`);
  }

  return (
    <form className="formcard" onSubmit={onSubmit} noValidate>
      <div style={{ display: "grid", gap: 8 }}><h2 style={{ fontSize: 30 }}><T k="ws.form" /></h2><p className="muted"><T k="ws.formHelp" /></p></div>
      <div className="fgrid2">
        <Field id="ws-business" name="businessName" label={<T k="f.business" />} error={errors.businessName}><input id="ws-business" name="businessName" autoComplete="organization" value={f.businessName} onChange={set("businessName")} /></Field>
        <Field id="ws-contact" name="contactName" label={<T k="f.contact" />} error={errors.contactName}><input id="ws-contact" name="contactName" autoComplete="name" value={f.contactName} onChange={set("contactName")} /></Field>
        <Field id="ws-email" name="email" label={<T k="f.email" />} error={errors.email}><input id="ws-email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} /></Field>
        <Field id="ws-phone" name="phone" label={<T k="f.phone" />} error={errors.phone}><input id="ws-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} /></Field>
        <Field id="ws-type" name="businessType" label={<T k="f.type" />} error={errors.businessType}>
          <select id="ws-type" name="businessType" value={f.businessType} onChange={set("businessType")}><option value="">{t("f.choose")}</option>{Object.entries(BUSINESS_TYPES).map(([k, v]) => <option key={k} value={k}>{lang === "am" ? BUSINESS_TYPES_AM[k] : v}</option>)}</select>
        </Field>
        <Field id="ws-location" name="location" label={<T k="f.location" />} error={errors.location}><input id="ws-location" name="location" autoComplete="address-level2" placeholder="e.g. Sterling, VA" value={f.location} onChange={set("location")} /></Field>
      </div>
      <div className="field" data-field="products">
        <span className="lbl"><T k="f.prodQty" /></span>
        <div className="prodpick">
          {products.map((p) => (
            <div className="row" key={p.slug}>
              <input type="checkbox" id={`wp-${p.slug}`} name={p === products[0] ? "products" : undefined} checked={picked[p.slug]?.on ?? false}
                onChange={(e) => { setTouchedPick(true); setPicked({ ...picked, [p.slug]: { on: e.target.checked, qty: picked[p.slug]?.qty ?? "" } }); }} />
              <label htmlFor={`wp-${p.slug}`}><T en={p.name} am={p.nameAm ?? undefined} /></label>
              <input type="text" id={`wq-${p.slug}`} aria-label={pName(p, lang)} placeholder={t("f.qtyPh")} maxLength={80} value={picked[p.slug]?.qty ?? ""}
                onChange={(e) => { setTouchedPick(true); setPicked({ ...picked, [p.slug]: { on: true, qty: e.target.value } }); }} />
            </div>
          ))}
        </div>
        {errors.products && <span role="alert" style={{ color: "var(--red)", fontSize: 13, fontWeight: 500 }}>{errors.products}</span>}
      </div>
      <div className="fgrid2">
        <Field id="ws-freq" name="frequency" label={<T k="f.freq" />} error={errors.frequency}>
          <select id="ws-freq" name="frequency" value={f.frequency} onChange={set("frequency")}><option value="">{t("f.choose")}</option>{Object.entries(FREQUENCIES).map(([k, v]) => <option key={k} value={k}>{lang === "am" ? FREQUENCIES_AM[k] : v}</option>)}</select>
        </Field>
        <div className="full"><Field id="ws-notes" name="notes" label={<T k="f.notes" />} optional error={errors.notes}><textarea id="ws-notes" name="notes" placeholder={t("f.notesPh")} maxLength={2000} value={f.notes} onChange={set("notes")} /></Field></div>
      </div>
      <Honeypot value={f.website} onChange={(v) => setF({ ...f, website: v })} />
      <label className="check" style={errors.consent ? { color: "var(--red)" } : undefined}>
        <input type="checkbox" name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span><T k="ws.consent" /></span>
      </label>
      <FormError message={formError} />
      <div><button className="btn red" type="submit" disabled={busy}>{busy ? <T k="cta.sending" /> : <><T k="ws.send" /> <ArrowRight /></>}</button></div>
    </form>
  );
}
