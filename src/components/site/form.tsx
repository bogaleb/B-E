"use client";
import { useState } from "react";

export type Errors = Record<string, string>;

export function useSubmit<T extends Record<string, unknown>>(endpoint: string) {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(body: T): Promise<Record<string, unknown> | null> {
    setBusy(true); setFormError(null);
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Errors };
      if (!res.ok || !data.ok) {
        setErrors(data.fields ?? {});
        setFormError(data.error ?? "Your request could not be sent. Check your connection and try again.");
        focusFirstError(data.fields);
        return null;
      }
      setErrors({});
      return data as Record<string, unknown>;
    } catch {
      setFormError("Your request could not be sent. Check your connection and try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { errors, setErrors, formError, busy, submit };
}

function focusFirstError(fields?: Errors) {
  const k = fields && Object.keys(fields)[0];
  if (k) requestAnimationFrame(() => (document.querySelector(`[name="${k}"]`) as HTMLElement | null)?.focus());
}

/** Client-side checks mirror the server schema so most mistakes are caught before sending. */
export const check = {
  required: (v: string) => v.trim().length > 0,
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  phone: (v: string) => v.replace(/\D/g, "").length >= 10,
  zip: (v: string) => /^\d{5}(-\d{4})?$/.test(v.trim()),
};

export function Field({ id, name, label, error, optional, children }: { id: string; name: string; label: string; error?: string; optional?: boolean; children: React.ReactElement<Record<string, unknown>> }) {
  return (
    <div className={`inp${error ? " bad" : ""}`} data-field={name}>
      <label htmlFor={id}>{label}{optional && <span className="opt"> (optional)</span>}</label>
      {children}
      <span className="err" id={`${id}-err`} role={error ? "alert" : undefined}>{error}</span>
    </div>
  );
}

export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="hp" aria-hidden="true">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="note" role="alert" style={{ background: "rgba(201,44,50,.07)", borderColor: "rgba(201,44,50,.35)", color: "#8E1D22" }}><span>{message}</span></div>;
}
