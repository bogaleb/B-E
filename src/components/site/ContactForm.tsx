"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { TOPICS } from "@/lib/validation";
import { check, Field, FormError, Honeypot, useSubmit, type Errors } from "./form";
import { TOPICS_AM } from "@/lib/i18n";
import { useLang, useT } from "./prefs";
import { T } from "./T";

export function ContactForm() {
  const t = useT();
  const lang = useLang();
  const [f, setF] = useState({ name: "", email: "", phone: "", topic: "", message: "", website: "" });
  const [sent, setSent] = useState(false);
  const { errors, setErrors, formError, busy, submit } = useSubmit("/api/contact");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (f.name.trim().length < 2) errs.name = t("e.name");
    if (!check.email(f.email)) errs.email = t("e.email");
    if (!f.topic) errs.topic = t("e.topic");
    if (f.message.trim().length < 5) errs.message = t("e.message");
    setErrors(errs);
    if (Object.keys(errs).length) { (document.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement | null)?.focus(); return; }
    if (await submit(f)) setSent(true);
  }
  if (sent) return (
    <div className="formcard" role="status">
      <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
        <span className="tag"><T k="ct.sent" /></span>
        <h2 style={{ fontSize: 30 }}><T k="ct.thanks" />, {f.name.split(" ")[0]}</h2>
        <p className="lede"><T k="ct.sentHelp" /> ({f.email})</p>
        <Link className="btn ghost" href="/products"><T k="cta.browse" /></Link>
      </div>
    </div>
  );
  return (
    <form className="formcard" onSubmit={onSubmit} noValidate>
      <div className="fgrid2">
        <Field id="ct-name" name="name" label={<T k="f.name" />} error={errors.name}><input id="ct-name" name="name" autoComplete="name" value={f.name} onChange={set("name")} /></Field>
        <Field id="ct-email" name="email" label={<T k="f.email" />} error={errors.email}><input id="ct-email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} /></Field>
        <Field id="ct-phone" name="phone" label={<T k="f.phone" />} optional error={errors.phone}><input id="ct-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} /></Field>
        <Field id="ct-topic" name="topic" label={<T k="f.topic" />} error={errors.topic}>
          <select id="ct-topic" name="topic" value={f.topic} onChange={set("topic")}><option value="">{t("f.choose")}</option>{Object.entries(TOPICS).map(([k, v]) => <option key={k} value={k}>{lang === "am" ? TOPICS_AM[k] : v}</option>)}</select>
        </Field>
        <div className="full"><Field id="ct-msg" name="message" label={<T k="f.message" />} error={errors.message}><textarea id="ct-msg" name="message" placeholder={t("f.messagePh")} maxLength={4000} value={f.message} onChange={set("message")} /></Field></div>
      </div>
      <Honeypot value={f.website} onChange={(v) => setF({ ...f, website: v })} />
      <FormError message={formError} />
      <div><button className="btn" type="submit" disabled={busy}>{busy ? <T k="cta.sending" /> : <><T k="ct.send" /> <ArrowRight /></>}</button></div>
    </form>
  );
}
