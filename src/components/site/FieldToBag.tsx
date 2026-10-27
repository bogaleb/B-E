"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Key } from "@/lib/i18n";
import { sprites, type Sprite } from "./grains";
import { T } from "./T";

const STEPS: { t: Key; p: Key }[] = [
  { t: "story.1.t", p: "story.1.p" },
  { t: "story.2.t", p: "story.2.p" },
  { t: "story.3.t", p: "story.3.p" },
  { t: "story.4.t", p: "story.4.p" },
];

interface P { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: Sprite; life: number; chaff?: boolean }

/**
 * "From field to bag": four steps scroll past while one illustrated scene stays in view and
 * morphs from a swaying field, to a shaking sieve, to a bag filling up, to the real bag on a shelf.
 */
export function FieldToBag() {
  const wrapRef = useRef<HTMLElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const visRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const progRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const cv = cvRef.current, wrap = wrapRef.current, vis = visRef.current;
    if (!cv || !wrap || !vis) return;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0, raf = 0, visible = false, last = performance.now(), time = 0;
    const lentils = sprites("lentil", dpr), flax = sprites("flax", dpr), fava = sprites("fava", dpr);
    const pick = () => { const r = Math.random(); const set = r < 0.5 ? lentils : r < 0.78 ? fava : flax; return set[(Math.random() * set.length) | 0]!; };
    let sieveFall: P[] = [];
    let bagFall: P[] = [];
    const pile: { x: number; y: number; r: number; s: Sprite }[] = [];
    const bagGrains: { x: number; y: number; r: number; s: Sprite }[] = [];
    const logo = new window.Image();
    let logoRequested = false;

    const css = getComputedStyle(document.documentElement);
    const col = (v: string, fb: string) => css.getPropertyValue(v).trim() || fb;

    const size = () => {
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pile.length = 0; bagGrains.length = 0;
    };

    // ---- scenes -------------------------------------------------------------
    const field = (a: number) => {
      ctx.save(); ctx.globalAlpha = a;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#F6E7C2"); sky.addColorStop(0.62, "#F3DCA8"); sky.addColorStop(0.63, "#C9A247"); sky.addColorStop(1, "#8C6B2A");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(201,163,74,.55)"; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.24, Math.min(W, H) * 0.11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#E7C77A"; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.24, Math.min(W, H) * 0.075, 0, Math.PI * 2); ctx.fill();
      // hills
      ctx.fillStyle = "#B89547"; ctx.beginPath(); ctx.moveTo(0, H * 0.64);
      ctx.bezierCurveTo(W * 0.3, H * 0.55, W * 0.6, H * 0.7, W, H * 0.6); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      // stalks in three depth rows
      for (let row = 0; row < 3; row++) {
        const n = 16 + row * 6, baseY = H * (0.72 + row * 0.12), hgt = H * (0.2 + row * 0.1), sc = 0.6 + row * 0.35;
        for (let i = 0; i < n; i++) {
          const x = ((i + (row % 2) * 0.5) / n) * W * 1.1 - W * 0.05;
          const sway = Math.sin(time * 1.3 + i * 0.7 + row) * 10 * sc;
          const tipX = x + sway, tipY = baseY - hgt;
          ctx.strokeStyle = row === 2 ? "#2F6B3E" : row === 1 ? "#4F7F43" : "#7A8F4A";
          ctx.lineWidth = 2 * sc;
          ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x + sway * 0.2, baseY - hgt * 0.5, tipX, tipY); ctx.stroke();
          // grain head
          ctx.fillStyle = row === 2 ? "#D4A64A" : "#C9A247";
          for (let k = 0; k < 6; k++) {
            const t = k / 6, hx = tipX + sway * 0.05 * k, hy = tipY + t * 26 * sc;
            ctx.beginPath(); ctx.ellipse(hx - 4 * sc, hy, 3.4 * sc, 6 * sc, -0.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(hx + 4 * sc, hy, 3.4 * sc, 6 * sc, 0.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      ctx.restore();
    };

    const sieve = (a: number, dt: number) => {
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = col("--cream", "#FAF5E9"); ctx.fillRect(0, 0, W, H);
      const cx = W / 2 + Math.sin(time * 9) * 10, cy = H * 0.34, rx = Math.min(W * 0.36, 210), ry = rx * 0.28;
      // pile below
      if (pile.length < 900) for (let i = 0; i < 3; i++) {
        const spread = (Math.random() + Math.random() - 1) * rx * 0.9;
        const depth = Math.max(0, 1 - Math.abs(spread) / (rx * 0.95));
        pile.push({ x: W / 2 + spread, y: H * 0.9 - Math.random() * depth * H * 0.16, r: Math.random() * 6, s: pick() });
      }
      // falling grains + chaff
      if (sieveFall.length < 160) {
        sieveFall.push({ x: cx + (Math.random() - 0.5) * rx * 1.4, y: cy + ry * 0.5, vx: (Math.random() - 0.5) * 0.4, vy: 1, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, s: pick(), life: 1 });
        if (Math.random() < 0.35) sieveFall.push({ x: cx + (Math.random() - 0.5) * rx, y: cy, vx: 1.5 + Math.random() * 2, vy: -0.6, r: Math.random() * 6, vr: 0.2, s: pick(), life: 1, chaff: true });
      }
      for (const g of pile) { ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.r); ctx.drawImage(g.s.c, -g.s.w / 2, -g.s.h / 2, g.s.w, g.s.h); ctx.restore(); }
      sieveFall = sieveFall.filter((p) => {
        if (p.chaff) { p.vx += 0.03 * dt; p.vy += 0.01 * dt; p.life -= 0.012 * dt; } else p.vy += 0.3 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.chaff) {
          ctx.fillStyle = `rgba(214,196,150,${Math.max(0, p.life) * 0.9})`;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, 5, 2, p.r, 0, Math.PI * 2); ctx.fill();
          return p.life > 0 && p.x < W + 20;
        }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.drawImage(p.s.c, -p.s.w / 2, -p.s.h / 2, p.s.w, p.s.h); ctx.restore();
        return p.y < H * 0.86;
      });
      // sieve
      ctx.fillStyle = "#8B6B3E"; ctx.beginPath(); ctx.ellipse(cx, cy, rx + 10, ry + 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3F3424"; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(255,240,210,.22)"; ctx.lineWidth = 1;
      for (let x = cx - rx; x < cx + rx; x += 7) { ctx.beginPath(); ctx.moveTo(x, cy - ry); ctx.lineTo(x + ry, cy + ry); ctx.stroke(); }
      for (let x = cx - rx - ry; x < cx + rx; x += 7) { ctx.beginPath(); ctx.moveTo(x + ry, cy - ry); ctx.lineTo(x, cy + ry); ctx.stroke(); }
      for (let i = 0; i < 70; i++) { const s = lentils[i % lentils.length]!; const ang = i * 2.4, rr = Math.sqrt(i / 70); ctx.drawImage(s.c, cx + Math.cos(ang) * rx * 0.8 * rr - s.w / 2, cy + Math.sin(ang) * ry * 0.75 * rr - s.h / 2, s.w, s.h); }
      ctx.restore();
      ctx.restore();
    };

    const bag = (a: number, fill: number, dt: number) => {
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = col("--cream", "#FAF5E9"); ctx.fillRect(0, 0, W, H);
      const bw = Math.min(W * 0.62, 340), bh = bw * 1.15, bx = W / 2 - bw / 2, by = H * 0.24;
      // funnel
      ctx.fillStyle = "#B9C3BC"; ctx.beginPath(); ctx.moveTo(W / 2 - 60, 10); ctx.lineTo(W / 2 + 60, 10); ctx.lineTo(W / 2 + 12, by - 18); ctx.lineTo(W / 2 - 12, by - 18); ctx.closePath(); ctx.fill();
      const target = Math.round(650 * Math.min(1, fill));
      while (bagGrains.length < target) {
        const level = bagGrains.length / 650;
        bagGrains.push({ x: bx + 14 + Math.random() * (bw - 28), y: by + bh - 16 - level * (bh * 0.78) - Math.random() * 12, r: Math.random() * 6, s: pick() });
      }
      if (bagGrains.length > target) bagGrains.length = target;
      if (fill < 0.98 && bagFall.length < 60) bagFall.push({ x: W / 2 + (Math.random() - 0.5) * 14, y: by - 18, vx: (Math.random() - 0.5) * 0.4, vy: 1, r: Math.random() * 6, vr: 0.2, s: pick(), life: 1 });
      const surface = by + bh - 16 - (bagGrains.length / 650) * bh * 0.78;
      // bag body (clear film)
      ctx.save();
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 18); ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(bx, by, bw, bh);
      for (const g of bagGrains) { ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.r); ctx.drawImage(g.s.c, -g.s.w / 2, -g.s.h / 2, g.s.w, g.s.h); ctx.restore(); }
      bagFall = bagFall.filter((p) => {
        p.vy += 0.35 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.drawImage(p.s.c, -p.s.w / 2, -p.s.h / 2, p.s.w, p.s.h); ctx.restore();
        return p.y < surface;
      });
      const shine = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      shine.addColorStop(0, "rgba(255,255,255,.35)"); shine.addColorStop(0.18, "rgba(255,255,255,0)"); shine.addColorStop(0.8, "rgba(255,255,255,0)"); shine.addColorStop(1, "rgba(255,255,255,.25)");
      ctx.fillStyle = shine; ctx.fillRect(bx, by, bw, bh);
      ctx.restore();
      ctx.strokeStyle = "rgba(16,63,45,.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 18); ctx.stroke();
      // crimped seal
      ctx.fillStyle = "rgba(16,63,45,.18)"; ctx.fillRect(bx, by, bw, 14);
      // label appears once the bag is mostly full
      const la = Math.max(0, Math.min(1, (fill - 0.55) / 0.3));
      if (la > 0) {
        ctx.globalAlpha = a * la;
        const lw = bw * 0.72, lh = lw * 0.5, lx = W / 2 - lw / 2, ly = by + bh * 0.36;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, 8); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,.08)"; ctx.stroke();
        if (!logoRequested) { logoRequested = true; logo.src = "/images/logo-color.webp"; }
        if (logo.complete && logo.naturalWidth) { const iw = lw * 0.62, ih = iw * (logo.naturalHeight / logo.naturalWidth); ctx.drawImage(logo, W / 2 - iw / 2, ly + 10, iw, ih); }
        ctx.fillStyle = "#C92C32"; ctx.beginPath(); ctx.roundRect(lx + lw * 0.14, ly + lh - 34, lw * 0.72, 22, 11); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `600 ${Math.max(10, lw * 0.06)}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("NET WEIGHT 2 LB", W / 2, ly + lh - 23);
      }
      ctx.restore();
    };

    const draw = (dt: number) => {
      const p = progRef.current;
      ctx.clearRect(0, 0, W, H);
      const near = (i: number) => Math.max(0, 1 - Math.abs(p - i));
      const a0 = near(0), a1 = near(1), a2 = p >= 2 ? 1 : near(2);
      if (a0 > 0.01) field(a0);
      if (a1 > 0.01) sieve(a1, dt);
      if (a2 > 0.01) bag(a2, Math.max(0, Math.min(1, p - 1.4)), dt);
      vis.style.setProperty("--shelf", String(Math.max(0, Math.min(1, (p - 2.4) / 0.6))));
    };

    const measure = () => {
      const els = stepRefs.current.filter(Boolean) as HTMLLIElement[];
      if (!els.length) return;
      const vr = vis.getBoundingClientRect();
      const stacked = window.innerWidth < 900;
      const ref = stacked ? vr.bottom + (window.innerHeight - vr.bottom) * 0.45 : window.innerHeight * 0.55;
      const centers = els.map((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; });
      let p = 0;
      if (ref <= centers[0]!) p = 0;
      else if (ref >= centers[centers.length - 1]!) p = centers.length - 1;
      else for (let i = 0; i < centers.length - 1; i++) if (ref >= centers[i]! && ref < centers[i + 1]!) { p = i + (ref - centers[i]!) / (centers[i + 1]! - centers[i]!); break; }
      progRef.current = p;
      setActive(Math.round(p));
      if (RM) draw(1);
    };
    const loop = (now: number) => {
      const dt = Math.min(2.2, (now - last) / 16.67); last = now; time += dt / 60;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    size(); measure(); draw(1);
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => { size(); measure(); draw(1); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible && !RM && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
      if (!visible) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(wrap);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); ro.disconnect(); io.disconnect(); };
  }, []);

  return (
    <section className="f2b" ref={wrapRef} aria-labelledby="f2b-title">
      <div className="wrap">
        <div className="f2b-head">
          <span className="kicker"><T k="story.kicker" /></span>
          <h2 id="f2b-title"><T k="story.title" /></h2>
        </div>
        <div className="f2b-grid">
          <div className="f2b-vis" ref={visRef}>
            <div className="f2b-frame">
              <canvas ref={cvRef} aria-hidden="true" />
              <div className="f2b-shelf">
                <Image src="/images/lentils-photo.webp" alt="ETHIO red lentils 2 lb bag on a store shelf" fill sizes="(max-width: 900px) 92vw, 46vw" style={{ objectFit: "cover" }} />
                <span className="tag"><T k="tag.actual" /></span>
              </div>
              <ol className="f2b-dots" aria-hidden="true">{STEPS.map((_, i) => <li key={i} className={i === active ? "on" : ""} />)}</ol>
            </div>
          </div>
          <ol className="f2b-steps">
            {STEPS.map((s, i) => (
              <li key={s.t} ref={(el) => { stepRefs.current[i] = el; }} className={i === active ? "on" : ""}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3><T k={s.t} /></h3>
                <p><T k={s.p} /></p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
