"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { TOPICS } from "@/lib/validation";
import { check, Field, FormError, Honeypot, useSubmit, type Errors } from "./form";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", topic: "", message: "", website: "" });
  const [sent, setSent] = useState(false);
  const { errors, setErrors, formError, busy, submit } = useSubmit("/api/contact");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (f.name.trim().length < 2) errs.name = "Enter your name.";
    if (!check.email(f.email)) errs.email = "Enter an email like name@example.com.";
    if (!f.topic) errs.topic = "Choose a topic.";
    if (f.message.trim().length < 5) errs.message = "Write a short message.";
    setErrors(errs);
    if (Object.keys(errs).length) { (document.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement | null)?.focus(); return; }
    if (await submit(f)) setSent(true);
  }
  if (sent) return (
    <div className="formcard" role="status">
      <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
        <span className="tag">Message sent</span>
        <h2 style={{ fontSize: 30 }}>Thanks, {f.name.split(" ")[0]}</h2>
        <p className="lede">We received your message and will reply to {f.email}. A confirmation email is on its way.</p>
        <Link className="btn ghost" href="/products">Browse products</Link>
      </div>
    </div>
  );
  return (
    <form className="formcard" onSubmit={onSubmit} noValidate>
      <div className="fgrid2">
        <Field id="ct-name" name="name" label="Your name" error={errors.name}><input id="ct-name" name="name" autoComplete="name" value={f.name} onChange={set("name")} /></Field>
        <Field id="ct-email" name="email" label="Email" error={errors.email}><input id="ct-email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} /></Field>
        <Field id="ct-phone" name="phone" label="Phone" optional error={errors.phone}><input id="ct-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} /></Field>
        <Field id="ct-topic" name="topic" label="Topic" error={errors.topic}>
          <select id="ct-topic" name="topic" value={f.topic} onChange={set("topic")}><option value="">Choose one</option>{Object.entries(TOPICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </Field>
        <div className="full"><Field id="ct-msg" name="message" label="Message" error={errors.message}><textarea id="ct-msg" name="message" placeholder="How can we help?" maxLength={4000} value={f.message} onChange={set("message")} /></Field></div>
      </div>
      <Honeypot value={f.website} onChange={(v) => setF({ ...f, website: v })} />
      <FormError message={formError} />
      <div><button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : <>Send message <ArrowRight /></>}</button></div>
    </form>
  );
}
