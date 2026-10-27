"use client";
import { useEffect, useRef } from "react";
import { sprites, type Sprite } from "./grains";

interface P { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: Sprite; a: number }

/** As the visitor scrolls past the hero, a few grains tumble over its bottom edge into the next section. */
export function GrainSpill() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const set = [...sprites("lentil", dpr), ...sprites("fava", dpr), ...sprites("flax", dpr)];
    let W = 0, H = 0, raf = 0, lastY = window.scrollY, last = performance.now();
    let ps: P[] = [];
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const frame = (now: number) => {
      const dt = Math.min(2.2, (now - last) / 16.67); last = now;
      ctx.clearRect(0, 0, W, H);
      ps = ps.filter((p) => {
        p.vy += 0.34 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.y > H * 0.55) p.a -= 0.03 * dt;
        ctx.globalAlpha = Math.max(0, p.a);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.drawImage(p.s.c, -p.s.w / 2, -p.s.h / 2, p.s.w, p.s.h); ctx.restore();
        return p.a > 0 && p.y < H + 10;
      });
      ctx.globalAlpha = 1;
      raf = ps.length ? requestAnimationFrame(frame) : 0;
    };
    const onScroll = () => {
      const y = window.scrollY, d = y - lastY; lastY = y;
      if (d <= 0) return;
      const top = cv.getBoundingClientRect().top;
      if (top < -40 || top > window.innerHeight) return; // only while the hero's edge is on screen
      const n = Math.min(14, Math.ceil(d / 6));
      for (let i = 0; i < n && ps.length < 220; i++) {
        ps.push({ x: Math.random() * W, y: -4 - Math.random() * 10, vx: (Math.random() - 0.5) * 1.6, vy: 1 + Math.random() * 2, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, s: set[(Math.random() * set.length) | 0]!, a: 1 });
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);
  return <div className="spill" aria-hidden="true"><canvas ref={ref} /></div>;
}
