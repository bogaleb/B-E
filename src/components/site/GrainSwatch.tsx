"use client";
import { useEffect, useRef } from "react";
import type { GrainStyle } from "@/lib/types";
import { paintSwatch } from "./grains";

export function GrainSwatch({ grain, className }: { grain: GrainStyle; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let w = 0, painted = false;
    const paint = () => { painted = true; w = c.getBoundingClientRect().width; paintSwatch(c, grain); };
    // Paint only when the swatch scrolls near the viewport, during idle time.
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting || painted) return;
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (ric) ric(paint, { timeout: 600 }); else setTimeout(paint, 50);
    }, { rootMargin: "200px" });
    io.observe(c);
    const ro = new ResizeObserver(() => {
      if (!painted) return;
      const nw = c.getBoundingClientRect().width;
      if (Math.abs(nw - w) > 8) paint();
    });
    ro.observe(c);
    return () => { io.disconnect(); ro.disconnect(); };
  }, [grain]);
  return <canvas ref={ref} className={className} aria-hidden="true" style={{ width: "100%", height: "100%", display: "block", background: "#F3EAD6" }} />;
}
