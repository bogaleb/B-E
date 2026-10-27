"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { REFERENCE_PATTERN } from "@/lib/reference";
import { T } from "./T";

interface Summary { reference: string; type: string; name: string; email: string; zip?: string; items: { name: string; qty: string }[] }

export function Confirmation({ reference }: { reference: string }) {
  const valid = REFERENCE_PATTERN.test(reference);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem("ethio-last-request") ?? "null") as Summary | null;
      if (s && s.reference === reference) setSummary(s);
    } catch { /* ignore */ }
  }, [reference]);
  if (!valid) return (
    <div className="empty"><h1 style={{ fontSize: 26 }}><T k="cf.none" /></h1><p className="muted"><T k="cf.noneHelp" /></p><Link className="btn" href="/products"><T k="cta.browse" /></Link></div>
  );
  const ws = reference.startsWith("WHL");
  return (
    <div className="split">
      <div style={{ display: "grid", gap: 24 }}>
        <span className="kicker"><T k={ws ? "cf.received.ws" : "cf.received.order"} /></span>
        <h1 style={{ fontSize: "clamp(36px,4.4vw,58px)" }}><T k="cf.thanks" />{summary?.name ? `, ${summary.name.split(" ")[0]}` : ""}.</h1>
        <div className="refbox">
          <span style={{ fontSize: 14, color: "#C5D6CB" }}><T k="cf.ref" /></span>
          <span className="ref" id="refnum">{reference}</span>
          <button className="btn on-dark" type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(reference); setCopied(true); setTimeout(() => setCopied(false), 1800); }
            catch { const r = document.createRange(); r.selectNodeContents(document.getElementById("refnum")!); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
          }}>{copied ? <><Check /> <T k="cta.copied" /></> : <><Copy /> <T k="cta.copy" /></>}</button>
        </div>
        <p className="lede"><T k="cf.keep" />{summary?.email ? <> (<b>{summary.email}</b>)</> : null}</p>
        <h2 className="sr"><T k="cf.next" /></h2>
        <div className="steps">
          <div className="step"><span className="n">1</span><h3><T k="cf.1.t" /></h3><p><T k="cf.1.p" /></p></div>
          <div className="step"><span className="n">2</span><h3><T k="cf.2.t" /></h3><p><T k="cf.2.p" /></p></div>
          <div className="step"><span className="n">3</span><h3><T k="cf.3.t" /></h3><p><T k="cf.3.p" /></p></div>
        </div>
      </div>
      <div className="aside">
        {summary ? (
          <div className="sumcard"><h2><T k="cf.requested" /></h2>
            {summary.items.map((i) => <div className="sumline" key={i.name}><span>{i.name}</span><b>{i.qty}</b></div>)}
            {summary.zip && <div className="sumline"><span><T k="cf.zip" /></span><b>{summary.zip}</b></div>}
            <Link className="btn ghost" href="/products"><T k="cta.keepBrowsing" /></Link>
          </div>
        ) : <div className="sumcard"><h2><T k="cf.next" /></h2><p className="muted"><T k="cf.inbox" /></p><Link className="btn ghost" href="/products"><T k="cta.keepBrowsing" /></Link></div>}
      </div>
    </div>
  );
}
