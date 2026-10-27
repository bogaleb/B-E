"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { GrainStyle } from "@/lib/types";
import { GRAIN, sprites, type Sprite } from "./grains";
import { T } from "./T";
import type { Key } from "@/lib/i18n";

type HeroGrain = "lentil" | "fava" | "flax";
const LINES: { g: HeroGrain; k: Key; color: string }[] = [
  { g: "lentil", k: "hero.name.lentil", color: "var(--lentil)" },
  { g: "fava", k: "hero.name.fava", color: "var(--fava)" },
  { g: "flax", k: "hero.name.flax", color: "var(--flax)" },
];
const BAGS: Record<HeroGrain, { src: string; alt: string; name: string; kind: "actual" | "concept"; tilt: string }> = {
  lentil: { src: "/images/lentils-photo.webp", alt: "ETHIO Football Red Lentils, 2 lb bag", name: "Football Red Lentils · 2 LB", kind: "actual", tilt: "rotate(-5deg)" },
  fava: { src: "/images/fava-concept.webp", alt: "Package design concept for ETHIO split fava beans", name: "Split Fava Beans · 2 LB", kind: "concept", tilt: "rotate(-3deg) translateY(-4px)" },
  flax: { src: "/images/flax-photo.webp", alt: "ETHIO Brown Flax Seeds, 2 lb bag", name: "Brown Flax Seeds · 2 LB", kind: "actual", tilt: "rotate(-6.5deg)" },
};
const ORDER: HeroGrain[] = ["lentil", "fava", "flax"];

interface Falling { x: number; y: number; vx: number; vy: number; r: number; vr: number; type: GrainStyle; s: Sprite }

export function Hero({ lede, ledeAm }: { lede: string; ledeAm?: string }) {
  const secRef = useRef<HTMLElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HeroGrain>("lentil");
  const autoRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [active, setActive] = useState<HeroGrain>("lentil");
  // Only load the other bag photos once their line has been shown.
  const [seen, setSeen] = useState<HeroGrain[]>(["lentil"]);

  const choose = useCallback((g: HeroGrain, user?: boolean) => {
    activeRef.current = g;
    setActive(g);
    setSeen((s) => (s.includes(g) ? s : [...s, g]));
    if (user) {
      clearInterval(autoRef.current);
      autoRef.current = setInterval(() => choose(ORDER[(ORDER.indexOf(activeRef.current) + 1) % 3]!), 9000);
    }
  }, []);

  useEffect(() => {
    const sec = secRef.current, cv = cvRef.current;
    if (!sec || !cv) return;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = cv.getContext("2d")!;
    const pile = document.createElement("canvas"), pctx = pile.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const CW = 2;
    let W = 0, H = 0, cols = 0, cap = 0, raf = 0, last = performance.now(), dacc = 0, alive = true;
    let h = new Float32Array(1);
    let falling: Falling[] = [];
    const spout = { x: 0, y: 0, tx: 0 };
    const pointer = { on: false, down: false, x: 0, y: 0, px: 0, py: 0, moved: false };

    const measure = () => {
      const f = frameRef.current; if (!f) return;
      const a = f.getBoundingClientRect(), s = sec.getBoundingClientRect();
      spout.tx = a.left - s.left + a.width * 0.16; spout.y = a.bottom - s.top - 6;
    };
    const avgH = () => { let s = 0; for (let i = 0; i < cols; i++) s += h[i]!; return s / cols; };
    const settle = (x: number, type: GrainStyle) => {
      const g = GRAIN[type], sp = sprites(type, dpr), s = sp[(Math.random() * sp.length) | 0]!;
      let c = Math.max(1, Math.min(cols - 2, Math.round(x / CW)));
      const t = g.t, step = Math.max(1, Math.round((g.w * 0.35) / CW));
      for (let k = 0; k < 160; k++) {
        const here = h[c]!, L = h[Math.max(0, c - step)]!, R = h[Math.min(cols - 1, c + step)]!;
        const lowL = here - L, lowR = here - R, lim = here > cap * 1.2 ? 0 : t * 0.55;
        if (lowL > lim || lowR > lim) { c += lowL > lowR ? -step : lowR > lowL ? step : Math.random() < 0.5 ? -step : step; c = Math.max(1, Math.min(cols - 2, c)); }
        else break;
      }
      const span = Math.max(1, Math.round((g.w * 0.5) / CW)), base = h[c]!, top = base + t;
      for (let i = c - span; i <= c + span; i++) if (i >= 0 && i < cols) h[i] = Math.max(h[i]!, top - Math.abs(i - c) * (t / (span + 1)));
      pctx.save(); pctx.translate(c * CW + (Math.random() - 0.5) * CW * 2, H - base - t * 0.6); pctx.rotate((Math.random() - 0.5) * 1.4);
      pctx.drawImage(s.c, -s.w / 2, -s.h / 2, s.w, s.h); pctx.restore();
    };
    // Fill the starting heap in small batches across frames so the page stays responsive.
    let fillJob: { type: GrainStyle; target: number; mound?: number }[] = [];
    const queuePrefill = () => {
      pctx.clearRect(0, 0, W, H); h.fill(0);
      fillJob = (["flax", "fava", "lentil"] as GrainStyle[]).map((type, li) => ({ type, target: cap * (0.24 + li * 0.2) }));
      fillJob.push({ type: "lentil", target: 0, mound: 500 });
    };
    const stepPrefill = (budget: number) => {
      let n = 0;
      while (fillJob.length && n < budget) {
        const job = fillJob[0]!;
        if (job.mound !== undefined) {
          settle(spout.x + (Math.random() - 0.5) * 60, "lentil"); n++;
          if (--job.mound <= 0) fillJob.shift();
        } else if (avgH() < job.target) { settle(Math.random() * W, job.type); n++; }
        else fillJob.shift();
      }
      return fillJob.length === 0;
    };
    const size = () => {
      const r = sec.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; pile.width = W * dpr; pile.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CW) + 2; h = new Float32Array(cols);
      cap = Math.min(H * 0.3, W < 700 ? 130 : 170);
      measure(); spout.x = spout.tx; falling = [];
      queuePrefill();
    };
    const drain = (px: number) => {
      dacc += px * dpr; const dev = Math.floor(dacc); if (dev < 1) return; dacc -= dev;
      pctx.save(); pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.globalCompositeOperation = "copy"; pctx.drawImage(pile, 0, dev); pctx.restore();
      const css = dev / dpr; for (let i = 0; i < cols; i++) h[i] = Math.max(0, h[i]! - css);
    };
    const spawn = (x: number, y: number, n: number, type: GrainStyle) => {
      const sp = sprites(type, dpr);
      for (let i = 0; i < n; i++) falling.push({ x: x + (Math.random() - 0.5) * 10, y: y + Math.random() * 4, vx: (Math.random() - 0.5) * 0.5, vy: Math.random() * 0.6, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.25, type, s: sp[(Math.random() * sp.length) | 0]! });
    };
    // Scoop: moving across the heap digs a little trench and flicks grains into the air; they fall back and settle.
    const MIX: GrainStyle[] = ["lentil", "lentil", "lentil", "fava", "fava", "flax"];
    const scoop = () => {
      if (!pointer.on || pointer.down || !pointer.moved) return;
      pointer.moved = false;
      const c0 = Math.round(pointer.x / CW);
      if (c0 < 1 || c0 >= cols - 1) return;
      const surface = H - h[c0]!;
      if (pointer.y < surface - 18) return; // only when touching the pile
      const R = 26, rc = Math.ceil(R / CW), depth = Math.min(10, Math.max(4, Math.abs(pointer.x - pointer.px) * 0.6 + 3));
      let removed = 0;
      pctx.save(); pctx.globalCompositeOperation = "destination-out"; pctx.beginPath();
      for (let i = c0 - rc; i <= c0 + rc; i++) {
        if (i < 0 || i >= cols) continue;
        const dx = (i - c0) * CW, fall = depth * Math.sqrt(Math.max(0, 1 - (dx * dx) / (R * R)));
        if (fall <= 0) continue;
        const nh = Math.max(0, h[i]! - fall);
        removed += h[i]! - nh;
        h[i] = nh;
        pctx.rect(i * CW - CW / 2, 0, CW + 0.5, H - nh);
      }
      pctx.fill(); pctx.restore();
      const n = Math.min(10, Math.round(removed / 18));
      const dir = Math.sign(pointer.x - pointer.px) || (Math.random() < 0.5 ? -1 : 1);
      for (let k = 0; k < n; k++) {
        const type = MIX[(Math.random() * MIX.length) | 0]!, sp = sprites(type, dpr);
        falling.push({ x: pointer.x + (Math.random() - 0.5) * R, y: H - h[c0]! - 4, vx: dir * (1 + Math.random() * 3) + (Math.random() - 0.5) * 2, vy: -(3 + Math.random() * 4), r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.5, type, s: sp[(Math.random() * sp.length) | 0]! });
      }
    };
    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(2.2, (now - last) / 16.67); last = now;
      if (fillJob.length) {
        stepPrefill(220);
        ctx.clearRect(0, 0, W, H); ctx.drawImage(pile, 0, 0, W, H);
        raf = requestAnimationFrame(frame);
        return;
      }
      const type = activeRef.current;
      spout.x += (spout.tx - spout.x) * 0.08 * dt;
      const rate = (W < 700 ? 1.6 : 2.6) * dt;
      spawn(spout.x, spout.y, Math.random() < rate % 1 ? Math.ceil(rate) : Math.floor(rate), type);
      if (pointer.down) spawn(pointer.x, pointer.y, Math.ceil(3 * dt), type);
      scoop();
      ctx.clearRect(0, 0, W, H); ctx.drawImage(pile, 0, 0, W, H);
      for (let i = falling.length - 1; i >= 0; i--) {
        const p = falling[i]!;
        p.vy += 0.32 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (pointer.on && !pointer.down) { const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy; if (d2 < 3600) p.vx += (dx / Math.sqrt(d2 + 1)) * (1 - d2 / 3600) * 0.9 * dt; }
        p.vx *= 0.995;
        if (p.x < 0 || p.x > W) { falling.splice(i, 1); continue; }
        const c = Math.max(0, Math.min(cols - 1, Math.round(p.x / CW)));
        if (p.vy > 0 && p.y >= H - h[c]! - 1) { settle(p.x, p.type); falling.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.drawImage(p.s.c, -p.s.w / 2, -p.s.h / 2, p.s.w, p.s.h); ctx.restore();
      }
      if (avgH() > cap * 0.75) drain(0.5 * dt);
      raf = requestAnimationFrame(frame);
    };
    const pos = (e: PointerEvent) => { const r = sec.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; };
    const onMove = (e: PointerEvent) => { pointer.px = pointer.x; pointer.py = pointer.y; pointer.on = true; pos(e); pointer.moved = true; };
    const onLeave = () => { pointer.on = false; pointer.down = false; };
    const onDown = (e: PointerEvent) => { if ((e.target as Element).closest("a,button,input,select,textarea")) return; pos(e); pointer.down = true; };
    const onUp = () => { pointer.down = false; };
    sec.addEventListener("pointermove", onMove); sec.addEventListener("pointerleave", onLeave); sec.addEventListener("pointerdown", onDown); window.addEventListener("pointerup", onUp);

    let started = false;
    const begin = () => {
      if (started || !alive) return;
      started = true;
      size();
      if (RM) { while (!stepPrefill(5000)); ctx.drawImage(pile, 0, 0, W, H); }
      else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(begin, { timeout: 1200 }); else setTimeout(begin, 400);
    const ro = new ResizeObserver(() => { if (!started) return; const r = sec.getBoundingClientRect(); if (Math.abs(r.width - W) > 2 || Math.abs(r.height - H) > 40) size(); else measure(); });
    ro.observe(sec);
    const io = new IntersectionObserver(([en]) => {
      if (en?.isIntersecting && started && !RM && !document.hidden) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
      else { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(sec);
    const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (started && !RM && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    document.addEventListener("visibilitychange", vis);
    // Fetch the other bag photos after the page has settled so later switches crossfade smoothly.
    const preload = setTimeout(() => setSeen(ORDER), 3500);
    if (!RM) autoRef.current = setInterval(() => choose(ORDER[(ORDER.indexOf(activeRef.current) + 1) % 3]!), 9000);
    return () => {
      alive = false; clearTimeout(preload); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); clearInterval(autoRef.current);
      sec.removeEventListener("pointermove", onMove); sec.removeEventListener("pointerleave", onLeave); sec.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp); document.removeEventListener("visibilitychange", vis);
    };
  }, [choose]);

  const bag = BAGS[active];
  return (
    <section className="hero" ref={secRef} aria-label="Welcome">
      <canvas ref={cvRef} aria-hidden="true" />
      <div className="wrap hero-in">
        <div className="hero-copy">
          <h1>
            {LINES.map((l) => (
              <button key={l.g} type="button" aria-pressed={active === l.g} style={{ "--c": l.color } as React.CSSProperties} onClick={() => choose(l.g, true)}>
                <span><T k={l.k} /></span><span className="dot" />
              </button>
            ))}
          </h1>
          <p className="lede"><T en={lede} am={ledeAm} /></p>
          <div className="hero-actions">
            <Link className="btn red" href="/products"><T k="cta.browse" /> <ArrowRight /></Link>
            <Link className="btn ghost" href="/wholesale"><T k="cta.wholesale" /></Link>
          </div>
          <p className="hero-hint" aria-hidden="true"><T k="hero.hint" /></p>
        </div>
        <div className="hero-bag" aria-live="polite">
          <div className="bagframe" ref={frameRef} style={{ transform: bag.tilt }}>
            <div className="ph">
              {ORDER.filter((g) => seen.includes(g)).map((g) => (
                <Image key={g} className={g === active ? "on" : ""} src={BAGS[g].src} alt={g === active ? BAGS[g].alt : ""} fill sizes="(max-width: 900px) 88vw, 520px" quality={70} priority={g === "lentil"} fetchPriority={g === "lentil" ? "high" : "low"} />
              ))}
            </div>
            <div className="bagcap"><b>{bag.name}</b><span className={`tag${bag.kind === "concept" ? " concept" : ""}`}><T k={bag.kind === "actual" ? "tag.actual" : "tag.concept"} /></span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
