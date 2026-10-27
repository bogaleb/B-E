"use client";
import Link from "next/link";
import { useToast } from "./store";

export function Toast() {
  const t = useToast();
  return (
    <div className={`toast${t ? " on" : ""}`} role="status" aria-live="polite">
      {t && <>{t.text} {t.href && <Link href={t.href}>{t.linkText}</Link>}</>}
    </div>
  );
}
