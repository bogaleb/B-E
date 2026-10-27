"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { BUSINESS_TYPES, FREQUENCIES } from "@/lib/validation";
import { useCart } from "./store";
import { check, Field, FormError, Honeypot, useSubmit, type Errors } from "./form";

export function WholesaleForm({ products }: { products: Product[] }) {
  const router = useRouter();
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
    if (f.businessName.trim().length < 2) errs.businessName = "Enter your business name.";
    if (f.contactName.trim().length < 2) errs.contactName = "Enter a contact name.";
    if (!check.email(f.email)) errs.email = "Enter an email like name@example.com.";
    if (!check.phone(f.phone)) errs.phone = "Enter a phone number with at least 10 digits.";
    if (!f.businessType) errs.businessType = "Choose your business type.";
    if (f.location.trim().length < 2) errs.location = "Enter your city and state.";
    const chosen = Object.entries(picked).filter(([, v]) => v.on).map(([slug, v]) => ({ slug, quantity: v.qty }));
    if (!chosen.length) errs.products = "Pick at least one product.";
    if (!f.frequency) errs.frequency = "Choose an estimate.";
    if (!consent) errs.consent = "Confirm that you understand this is an inquiry.";
    setErrors(errs);
    if (Object.keys(errs).length) { (document.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement | null)?.focus(); return; }
    const res = await submit({ ...f, products: chosen, consent });
    if (!res) return;
    const reference = String(res.reference ?? "");
    try {
      sessionStorage.setItem("ethio-last-request", JSON.stringify({ reference, type: "Wholesale inquiry", name: f.contactName, email: f.email,
        items: chosen.map((c) => ({ name: products.find((p) => p.slug === c.slug)?.name ?? c.slug, qty: c.quantity || "Quantity to discuss" })) }));
    } catch { /* ignore */ }
    router.push(`/order/confirmation?ref=${encodeURIComponent(reference)}`);
  }

  return (
    <form className="formcard" onSubmit={onSubmit} noValidate>
      <div style={{ display: "grid", gap: 8 }}><h2 style={{ fontSize: 30 }}>Wholesale inquiry</h2><p className="muted">Fields marked optional can be skipped. Everything else helps us prepare an accurate offer.</p></div>
      <div className="fgrid2">
        <Field id="ws-business" name="businessName" label="Business name" error={errors.businessName}><input id="ws-business" name="businessName" autoComplete="organization" value={f.businessName} onChange={set("businessName")} /></Field>
        <Field id="ws-contact" name="contactName" label="Contact person" error={errors.contactName}><input id="ws-contact" name="contactName" autoComplete="name" value={f.contactName} onChange={set("contactName")} /></Field>
        <Field id="ws-email" name="email" label="Email" error={errors.email}><input id="ws-email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} /></Field>
        <Field id="ws-phone" name="phone" label="Phone" error={errors.phone}><input id="ws-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} /></Field>
        <Field id="ws-type" name="businessType" label="Business type" error={errors.businessType}>
          <select id="ws-type" name="businessType" value={f.businessType} onChange={set("businessType")}><option value="">Choose one</option>{Object.entries(BUSINESS_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </Field>
        <Field id="ws-location" name="location" label="City and state" error={errors.location}><input id="ws-location" name="location" autoComplete="address-level2" placeholder="e.g. Sterling, VA" value={f.location} onChange={set("location")} /></Field>
      </div>
      <div className="field" data-field="products">
        <span className="lbl">Products and quantities</span>
        <div className="prodpick">
          {products.map((p) => (
            <div className="row" key={p.slug}>
              <input type="checkbox" id={`wp-${p.slug}`} name={p === products[0] ? "products" : undefined} checked={picked[p.slug]?.on ?? false}
                onChange={(e) => { setTouchedPick(true); setPicked({ ...picked, [p.slug]: { on: e.target.checked, qty: picked[p.slug]?.qty ?? "" } }); }} />
              <label htmlFor={`wp-${p.slug}`}>{p.name}</label>
              <input type="text" id={`wq-${p.slug}`} aria-label={`Quantity for ${p.name}`} placeholder="e.g. 40 bags" maxLength={80} value={picked[p.slug]?.qty ?? ""}
                onChange={(e) => { setTouchedPick(true); setPicked({ ...picked, [p.slug]: { on: true, qty: e.target.value } }); }} />
            </div>
          ))}
        </div>
        {errors.products && <span role="alert" style={{ color: "var(--red)", fontSize: 13, fontWeight: 500 }}>{errors.products}</span>}
      </div>
      <div className="fgrid2">
        <Field id="ws-freq" name="frequency" label="How often would you order?" error={errors.frequency}>
          <select id="ws-freq" name="frequency" value={f.frequency} onChange={set("frequency")}><option value="">Choose one</option>{Object.entries(FREQUENCIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </Field>
        <div className="full"><Field id="ws-notes" name="notes" label="Notes" optional error={errors.notes}><textarea id="ws-notes" name="notes" placeholder="Delivery needs, package sizes, timing…" maxLength={2000} value={f.notes} onChange={set("notes")} /></Field></div>
      </div>
      <Honeypot value={f.website} onChange={(v) => setF({ ...f, website: v })} />
      <label className="check" style={errors.consent ? { color: "var(--red)" } : undefined}>
        <input type="checkbox" name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I understand this is an inquiry. Prices and availability are confirmed by B&amp;E Wholesale before any order is final.</span>
      </label>
      <FormError message={formError} />
      <div><button className="btn red" type="submit" disabled={busy}>{busy ? "Sending…" : <>Send wholesale inquiry <ArrowRight /></>}</button></div>
    </form>
  );
}
