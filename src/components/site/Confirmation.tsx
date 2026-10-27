"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { REFERENCE_PATTERN } from "@/lib/reference";

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
    <div className="empty"><h1 style={{ fontSize: 26 }}>No request found</h1><p className="muted">Send an order request or wholesale inquiry and your reference number will show here.</p><Link className="btn" href="/products">Browse products</Link></div>
  );
  const kind = reference.startsWith("WHL") ? "Wholesale inquiry" : "Order request";
  return (
    <div className="split">
      <div style={{ display: "grid", gap: 24 }}>
        <span className="kicker">{kind} received</span>
        <h1 style={{ fontSize: "clamp(36px,4.4vw,58px)" }}>Thank you{summary?.name ? `, ${summary.name.split(" ")[0]}` : ""}.</h1>
        <div className="refbox">
          <span style={{ fontSize: 14, color: "#C5D6CB" }}>Your reference number</span>
          <span className="ref" id="refnum">{reference}</span>
          <button className="btn on-dark" type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(reference); setCopied(true); setTimeout(() => setCopied(false), 1800); }
            catch { const r = document.createRange(); r.selectNodeContents(document.getElementById("refnum")!); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
          }}>{copied ? <><Check /> Copied</> : <><Copy /> Copy number</>}</button>
        </div>
        <p className="lede">Keep this number. We&apos;ll use it when we contact you{summary?.email ? <> at <b>{summary.email}</b></> : ""} to confirm price, availability and delivery. Your request is not a confirmed order yet.</p>
        <h2 className="sr">What happens next</h2>
        <div className="steps">
          <div className="step"><span className="n">1</span><h3>Received</h3><p>Your request is saved with the number above.</p></div>
          <div className="step"><span className="n">2</span><h3>Review</h3><p>We check stock and prepare a price.</p></div>
          <div className="step"><span className="n">3</span><h3>Confirm</h3><p>We contact you to finish the order.</p></div>
        </div>
      </div>
      <div className="aside">
        {summary ? (
          <div className="sumcard"><h2>Requested</h2>
            {summary.items.map((i) => <div className="sumline" key={i.name}><span>{i.name}</span><b>{i.qty}</b></div>)}
            {summary.zip && <div className="sumline"><span>Delivery ZIP</span><b>{summary.zip}</b></div>}
            <Link className="btn ghost" href="/products">Keep browsing</Link>
          </div>
        ) : <div className="sumcard"><h2>What&apos;s next</h2><p className="muted">Check your inbox for an acknowledgment email with your reference number.</p><Link className="btn ghost" href="/products">Keep browsing</Link></div>}
      </div>
    </div>
  );
}
