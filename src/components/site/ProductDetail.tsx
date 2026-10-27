"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Info, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { clampQty } from "@/lib/cart";
import { ASK_SIZE, defaultVariant } from "@/lib/utils";
import { GRAIN } from "./grains";
import { GrainSwatch } from "./GrainSwatch";
import { KindTag } from "./ProductCard";
import { cart, flyToBag, toast } from "./store";

const kindNote = (k: string) => (k === "actual" ? "Photo of the actual ETHIO package." : "This is a package design concept. The bag you receive may look different.");

export function Gallery({ product: p }: { product: Product }) {
  const [i, setI] = useState(0);
  const [lens, setLens] = useState<string | null>(null);
  const img = p.images[i];
  return (
    <div className="gallery">
      <div className="stage" onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !img) return;
        const r = e.currentTarget.getBoundingClientRect();
        setLens(`${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}% ${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      }} onPointerLeave={() => setLens(null)}>
        {img ? (
          <>
            <Image key={img.src} src={img.src} alt={img.alt} fill sizes="(max-width: 900px) 100vw, 60vw" style={{ objectFit: "contain" }} priority />
            <div className={`lens${lens ? " ok" : ""}`} style={{ backgroundImage: `url(${img.src})`, backgroundPosition: lens ?? "50% 50%", backgroundColor: "#fff", opacity: lens ? 1 : 0 }} />
            <KindTag kind={img.kind} />
          </>
        ) : (<><GrainSwatch grain={p.grain} /><KindTag kind="soon" /></>)}
      </div>
      {p.images.length > 1 && (
        <div className="thumbs" role="group" aria-label="Product images">
          {p.images.map((im, j) => (
            <button key={im.src} className="thumb" type="button" aria-pressed={i === j} aria-label={`Show image ${j + 1}: ${im.alt}`} onClick={() => setI(j)}>
              <Image src={im.src} alt="" width={184} height={138} />
            </button>
          ))}
        </div>
      )}
      <p className="imgnote">{img ? kindNote(img.kind) : "We will add a photo of the actual package soon."}</p>
    </div>
  );
}

export function BuyBox({ product: p }: { product: Product }) {
  const [buyer, setBuyer] = useState<"household" | "business">("household");
  const [variant, setVariant] = useState(defaultVariant(p.variants)?.label ?? ASK_SIZE);
  const [qty, setQty] = useState(1);
  const btn = useRef<HTMLButtonElement>(null);
  return (
    <>
      <div className="field"><span className="lbl" id="lbl-buyer">I&apos;m buying for</span>
        <div className="seg" role="group" aria-labelledby="lbl-buyer">
          <button type="button" aria-pressed={buyer === "household"} onClick={() => setBuyer("household")}>My household</button>
          <button type="button" aria-pressed={buyer === "business"} onClick={() => setBuyer("business")}>My business</button>
        </div>
      </div>
      <div className="field"><label htmlFor="size">Package size</label>
        <div className="inp"><select id="size" value={variant} onChange={(e) => setVariant(e.target.value)}>
          {p.variants.map((v) => <option key={v.label}>{v.label}</option>)}
          <option>{ASK_SIZE}</option>
        </select></div>
      </div>
      <div className="field"><span className="lbl">Quantity (bags)</span>
        <div className="buyrow">
          <div className="qty">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => clampQty(q - 1))}><Minus size={16} /></button>
            <input id="qv" inputMode="numeric" aria-label="Quantity" value={qty} onChange={(e) => setQty(clampQty(parseInt(e.target.value, 10)))} />
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => clampQty(q + 1))}><Plus size={16} /></button>
          </div>
          <button ref={btn} className="btn red" type="button" onClick={() => {
            cart.add({ slug: p.slug, variant, buyer, qty });
            if (btn.current) flyToBag(btn.current, GRAIN[p.grain].colors);
            toast(`${qty} × ${p.name} added to your inquiry.`, { href: "/inquiry", text: "View list" });
          }}><Plus /> Add to inquiry</button>
        </div>
      </div>
      <div className="note green"><Info /><span>Adding to your inquiry is not a purchase. We&apos;ll confirm price and availability before anything is final.</span></div>
    </>
  );
}
