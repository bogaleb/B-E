"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { tr, type Key, type Lang } from "@/lib/i18n";
import { useLang } from "./prefs";
import { T } from "./T";

type HeroGrain = "lentil" | "fava" | "flax";
const ORDER: HeroGrain[] = ["lentil", "fava", "flax"];
const NAME: Record<HeroGrain, Key> = { lentil: "hero.name.lentil", fava: "hero.name.fava", flax: "hero.name.flax" };
const BAGS: Record<HeroGrain, { src: string; alt: string; name: string; kind: "actual" | "concept"; tilt: string }> = {
  lentil: { src: "/images/lentils-photo.webp", alt: "ETHIO Football Red Lentils, 2 lb bag", name: "Football Red Lentils · 2 LB", kind: "actual", tilt: "rotate(-4deg)" },
  fava: { src: "/images/fava-concept.webp", alt: "Package design concept for ETHIO split fava beans", name: "Split Fava Beans · 2 LB", kind: "concept", tilt: "rotate(-2.5deg) translateY(-4px)" },
  flax: { src: "/images/flax-photo.webp", alt: "ETHIO Brown Flax Seeds, 2 lb bag", name: "Brown Flax Seeds · 2 LB", kind: "actual", tilt: "rotate(-5.5deg)" },
};
/** Grain colors per product: [r, g, b] base tones, mixed with random light/dark jitter per grain. */
const PALETTE: Record<HeroGrain, [number, number, number][]> = {
  lentil: [[229, 122, 53], [238, 138, 67], [217, 106, 42], [240, 154, 85], [205, 95, 38]],
  fava: [[214, 179, 90], [201, 162, 71], [224, 194, 115], [191, 150, 64], [180, 160, 80]],
  flax: [[123, 63, 34], [142, 77, 43], [106, 52, 27], [154, 87, 51], [94, 46, 24]],
};
const CYCLE_MS = 8000;

/**
 * The landing view: the product name is drawn as hollow glass letters that fill with grains
 * (a small falling-sand simulation clipped to the letter shapes). Visitors can stir the grains
 * by moving across the letters, pour more by pressing, and switch products with the chips.
 */
export function Hero({ lede, ledeAm }: { lede: string; ledeAm?: string }) {
  const lang = useLang();
  const wordRef = useRef<HTMLHeadingElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<{ setWord: (g: HeroGrain, text: string) => void } | null>(null);
  const activeRef = useRef<HeroGrain>("lentil");
  const autoRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [active, setActive] = useState<HeroGrain>("lentil");
  const [live, setLive] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);
  const [autoOn, setAutoOn] = useState(true);
  const [seen, setSeen] = useState<HeroGrain[]>(["lentil"]);
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;

  const choose = useCallback((g: HeroGrain, user?: boolean) => {
    activeRef.current = g;
    setActive(g);
    setSeen((s) => (s.includes(g) ? s : [...s, g]));
    setCycleKey((k) => k + 1);
    engine.current?.setWord(g, tr(NAME[g], langRef.current));
    if (user) { clearInterval(autoRef.current); setAutoOn(false); }
  }, []);

  // Re-draw the word when the language changes.
  useEffect(() => { engine.current?.setWord(activeRef.current, tr(NAME[activeRef.current], lang)); }, [lang]);

  useEffect(() => {
    const cv = cvRef.current, host = wordRef.current;
    if (!cv || !host) return;
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let CS = 3; // cell size in CSS px (finer on small screens)
    let W = 0, H = 0, cols = 0, rows = 0, raf = 0, alive = true, visible = true;
    let mask = new Uint8Array(0), cells = new Uint8Array(0), moved = new Uint8Array(0), topRow = new Int16Array(0);
    let maskCount = 0, count = 0, target = 0, frame = 0;
    let mode: "fill" | "drain" = "fill";
    let grain: HeroGrain = activeRef.current, word = tr(NAME[grain], langRef.current);
    let pending: { g: HeroGrain; text: string } | null = null;
    let drainUntil = 0;
    const lut = new Uint8ClampedArray(256 * 3);
    const small = document.createElement("canvas"), sctx = small.getContext("2d")!;
    const glass = document.createElement("canvas"), gctx = glass.getContext("2d")!;
    const rim = document.createElement("canvas"), rctx = rim.getContext("2d")!;
    let img: ImageData | null = null;
    const pointer = { on: false, down: false, x: 0, y: 0 };
    const fontFamily = () => getComputedStyle(host).fontFamily || "Georgia, serif";
    let layout = { size: 100, lines: [{ text: "", x: 0, y: 0 }] };

    const buildLut = (g: HeroGrain) => {
      const pal = PALETTE[g];
      for (let v = 1; v < 256; v++) {
        const base = pal[v % pal.length]!, j = ((v * 73) % 41) - 20; // stable jitter per value
        lut[v * 3] = base[0] + j; lut[v * 3 + 1] = base[1] + j * 0.8; lut[v * 3 + 2] = base[2] + j * 0.6;
      }
    };
    const fitText = (text: string) => {
      // On narrow screens two-word names stack onto two lines so the letters stay big.
      const words = text.split(" ");
      let parts = [text];
      if (W < 640 && words.length > 1) {
        let best = 1, diff = Infinity;
        for (let k = 1; k < words.length; k++) {
          const a = words.slice(0, k).join(" ").length, b = words.slice(k).join(" ").length;
          if (Math.abs(a - b) < diff) { diff = Math.abs(a - b); best = k; }
        }
        parts = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      }
      ctx.font = `400 100px ${fontFamily()}`;
      const w100 = Math.max(...parts.map((s) => ctx.measureText(s).width)) || 1;
      const lineH = 1.02;
      const size = Math.max(24, Math.min(240, H / (parts.length * lineH + 0.06), (W * 0.97 / w100) * 100));
      ctx.font = `400 ${size}px ${fontFamily()}`;
      const ms = parts.map((s) => ctx.measureText(s));
      const asc = ms[0]!.actualBoundingBoxAscent || size * 0.72;
      const desc = ms[ms.length - 1]!.actualBoundingBoxDescent || size * 0.2;
      const block = asc + (parts.length - 1) * size * lineH + desc;
      const top = (H - block) / 2 + asc;
      layout = { size, lines: parts.map((s, i) => ({ text: s, x: (W - ms[i]!.width) / 2, y: top + i * size * lineH })) };
    };
    const drawText = (c: CanvasRenderingContext2D, scale: number, fill: string | null, stroke: string | null, lw = 0) => {
      c.save(); c.scale(scale, scale);
      c.font = `400 ${layout.size}px ${fontFamily()}`;
      c.textBaseline = "alphabetic";
      for (const l of layout.lines) {
        if (fill) { c.fillStyle = fill; c.fillText(l.text, l.x, l.y); }
        if (stroke) { c.lineWidth = lw; c.lineJoin = "round"; c.strokeStyle = stroke; c.strokeText(l.text, l.x, l.y); }
      }
      c.restore();
    };
    const loadFont = (text: string) => document.fonts?.load(`400 100px ${fontFamily()}`, text).catch(() => []) ?? Promise.resolve([]);
    const buildMask = () => {
      fitText(word);
      cols = Math.ceil(W / CS); rows = Math.ceil(H / CS);
      small.width = cols; small.height = rows;
      sctx.clearRect(0, 0, cols, rows);
      drawText(sctx, 1 / CS, "#000", null);
      const data = sctx.getImageData(0, 0, cols, rows).data;
      mask = new Uint8Array(cols * rows); maskCount = 0;
      for (let i = 0; i < cols * rows; i++) if (data[i * 4 + 3]! > 110) { mask[i] = 1; maskCount++; }
      topRow = new Int16Array(cols).fill(-1);
      for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) if (mask[y * cols + x]) { topRow[x] = y; break; }
      cells = new Uint8Array(cols * rows); moved = new Uint8Array(cols * rows); count = 0;
      target = Math.floor(maskCount * 0.8);
      img = sctx.createImageData(cols, rows);
      buildLayers();
      buildLut(grain);
    };
    const buildLayers = () => {
      // static layers: frosted glass fill + rim highlight
      const css = getComputedStyle(document.documentElement);
      const ink = css.getPropertyValue("--heading").trim() || "#103F2D";
      for (const [c, cx] of [[glass, gctx], [rim, rctx]] as const) { c.width = W * dpr; c.height = H * dpr; cx.clearRect(0, 0, c.width, c.height); }
      gctx.globalAlpha = 0.08; drawText(gctx, dpr, ink, null); gctx.globalAlpha = 1;
      drawText(rctx, dpr, null, ink, Math.max(1.1, layout.size * 0.012));
      rctx.globalAlpha = 0.35; rctx.globalCompositeOperation = "source-over";
      // glossy streak clipped to the letters
      const sheen = document.createElement("canvas"); sheen.width = rim.width; sheen.height = rim.height;
      const sh = sheen.getContext("2d")!;
      drawText(sh, dpr, "#fff", null); sh.globalCompositeOperation = "source-in";
      const gr = sh.createLinearGradient(0, 0, 0, H * dpr);
      gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(0.28, "rgba(255,255,255,.08)"); gr.addColorStop(0.29, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      sh.fillStyle = gr; sh.fillRect(0, 0, sheen.width, sheen.height);
      rctx.drawImage(sheen, 0, 0); rctx.globalAlpha = 1;
    };
    const size = () => {
      const r = host.getBoundingClientRect();
      if (r.width < 20 || r.height < 20) return;
      W = r.width; H = r.height;
      CS = W < 640 ? 2 : 3;
      cv.width = W * dpr; cv.height = H * dpr;
      buildMask();
      if (RM) instantFill();
    };
    const instantFill = () => {
      // Reduced motion: settle grains straight into the bottom of each letter.
      for (let x = 0; x < cols; x++) {
        let filled = 0;
        const colCells: number[] = [];
        for (let y = rows - 1; y >= 0; y--) if (mask[y * cols + x]) colCells.push(y);
        const n = Math.floor(colCells.length * 0.8);
        for (const y of colCells) { if (filled++ >= n) break; cells[y * cols + x] = 1 + ((Math.random() * 254) | 0); count++; }
      }
      render();
    };
    const pass = (i: number) => (mode === "drain" ? true : mask[i] === 1);
    let movedCount = 0;
    const step = () => {
      moved.fill(0);
      movedCount = 0;
      const ltr = frame++ % 2 === 0;
      for (let y = rows - 1; y >= 0; y--) {
        for (let k = 0; k < cols; k++) {
          const x = ltr ? k : cols - 1 - k, i = y * cols + x, v = cells[i]!;
          if (!v || moved[i]) continue;
          if (y === rows - 1) { if (mode === "drain") { cells[i] = 0; count--; } continue; }
          const b = i + cols;
          if (pass(b) && !cells[b]) { cells[b] = v; cells[i] = 0; moved[b] = 1; movedCount++; continue; }
          const first = Math.random() < 0.5 ? -1 : 1;
          for (const dx of [first, -first]) {
            const nx = x + dx;
            if (nx < 0 || nx >= cols) continue;
            const d = b + dx;
            if (pass(d) && !cells[d] && (mode === "drain" || pass(i + dx) || Math.random() < 0.5)) { cells[d] = v; cells[i] = 0; moved[d] = 1; movedCount++; break; }
          }
        }
      }
    };
    const spawn = () => {
      if (mode !== "fill" || count >= target) return;
      const n = Math.max(4, Math.round(cols * 0.12));
      for (let k = 0; k < n; k++) {
        const x = (Math.random() * cols) | 0, y = topRow[x]!;
        if (y < 0) continue;
        const i = y * cols + x;
        if (!cells[i]) { cells[i] = 1 + ((Math.random() * 254) | 0); count++; }
      }
    };
    const stir = () => {
      if (!pointer.on || mode !== "fill") return;
      const cx = Math.round(pointer.x / CS), cy = Math.round(pointer.y / CS), r = Math.round(21 / CS);
      if (pointer.down) {
        // pour extra grains where the visitor presses
        for (let k = 0; k < 10; k++) {
          const x = cx + ((Math.random() * 7) | 0) - 3, y = cy + ((Math.random() * 5) | 0) - 2;
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const i = y * cols + x;
          if (mask[i] && !cells[i]) { cells[i] = 1 + ((Math.random() * 254) | 0); count++; }
        }
        return;
      }
      // brush: lift grains near the pointer so they tumble back down
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r || Math.random() > 0.3) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 1 || x >= cols || y >= rows) continue;
        const i = y * cols + x, v = cells[i];
        if (!v) continue;
        const up = Math.max(1, Math.min(y, 4 + ((Math.random() * 8) | 0)));
        const j = (y - up) * cols + x + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
        if (j >= 0 && j < cells.length && mask[j] && !cells[j]) { cells[j] = v; cells[i] = 0; }
      }
    };
    const render = () => {
      if (!img) return;
      const d = img.data;
      d.fill(0);
      for (let i = 0; i < cells.length; i++) {
        const v = cells[i];
        if (!v) continue;
        const top = i < cols || !cells[i - cols];
        const boost = top ? 28 : 0, o = i * 4;
        d[o] = lut[v * 3]! + boost; d[o + 1] = lut[v * 3 + 1]! + boost; d[o + 2] = lut[v * 3 + 2]! + boost; d[o + 3] = 255;
      }
      sctx.putImageData(img, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(glass, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, cols * CS * dpr, rows * CS * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(rim, 0, 0);
    };
    const loop = (now: number) => {
      if (!alive) return;
      if (mode === "drain" && (count <= 0 || now > drainUntil) && pending) {
        mode = "fill"; grain = pending.g; word = pending.text; pending = null; buildMask();
      }
      spawn(); stir();
      step(); if (mode === "fill" && count < target) step(); // faster fill
      render();
      // Once everything has settled and nobody is touching the letters, stop animating to save battery.
      const settled = mode === "fill" && count >= target && movedCount === 0 && !pointer.on && !pending;
      raf = visible && !settled ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => { if (started && visible && !RM && !raf) raf = requestAnimationFrame(loop); };
    const setWord = (g: HeroGrain, text: string) => {
      if (g === grain && text === word && mode === "fill") return;
      void loadFont(text);
      if (RM) { void loadFont(text).then(() => { grain = g; word = text; buildMask(); instantFill(); }); return; }
      pending = { g, text };
      mode = "drain"; drainUntil = performance.now() + 900;
      wake();
    };
    engine.current = { setWord };

    const pos = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; };
    const onMove = (e: PointerEvent) => { pointer.on = true; pos(e); wake(); };
    const onLeave = () => { pointer.on = false; pointer.down = false; };
    const onDown = (e: PointerEvent) => { pos(e); pointer.on = true; pointer.down = true; wake(); };
    const onUp = () => { pointer.down = false; if (matchMedia("(hover: none)").matches) pointer.on = false; };
    cv.addEventListener("pointermove", onMove); cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("pointerdown", onDown); window.addEventListener("pointerup", onUp);

    let started = false;
    const begin = async () => {
      if (started || !alive) return;
      started = true;
      try { await document.fonts.ready; await loadFont(word); } catch { /* ignore */ }
      if (!alive) return;
      size();
      setLive(true);
      if (!RM) raf = requestAnimationFrame(loop);
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) ric(() => void begin(), { timeout: 900 }); else setTimeout(() => void begin(), 300);

    const ro = new ResizeObserver(() => {
      if (!started) return;
      const r = host.getBoundingClientRect();
      if (Math.abs(r.width - W) > 4 || Math.abs(r.height - H) > 4) { size(); wake(); }
    });
    ro.observe(host);
    const io = new IntersectionObserver(([en]) => {
      visible = !!en?.isIntersecting && !document.hidden;
      if (visible && started && !RM && !raf) raf = requestAnimationFrame(loop);
      if (!visible) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(host);
    const onVis = () => { visible = !document.hidden; if (visible && started && !RM && !raf) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", onVis);
    // re-tint the glass when the theme changes
    const onPrefs = () => { if (started) { buildLayers(); render(); } };
    window.addEventListener("ethio:prefs", onPrefs);
    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); engine.current = null;
      cv.removeEventListener("pointermove", onMove); cv.removeEventListener("pointerleave", onLeave); cv.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("ethio:prefs", onPrefs);
    };
  }, []);

  // auto-cycle through products until the visitor picks one
  useEffect(() => {
    if (!autoOn || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    autoRef.current = setInterval(() => choose(ORDER[(ORDER.indexOf(activeRef.current) + 1) % 3]!), CYCLE_MS);
    const preload = setTimeout(() => setSeen(ORDER), 3500);
    return () => { clearInterval(autoRef.current); clearTimeout(preload); };
  }, [autoOn, choose]);

  const bag = BAGS[active];
  return (
    <section className="hero hero2" aria-label="Welcome">
      <div className="wrap">
        <h1 className={`heroword${live ? " live" : ""}`} ref={wordRef} style={{ "--g": `var(--${active})` } as React.CSSProperties}>
          <span className="hw-text"><T k={NAME[active]} /></span>
          <canvas ref={cvRef} aria-hidden="true" />
        </h1>
        <div className="hw-chips" role="group" aria-label="ETHIO">
          {ORDER.map((g) => (
            <button key={g} type="button" className={`hw-chip${autoOn && g === active ? " timing" : ""}`} aria-pressed={g === active} onClick={() => choose(g, true)}
              style={{ "--g": `var(--${g})`, "--cycle": `${CYCLE_MS}ms` } as React.CSSProperties}>
              <i aria-hidden="true" /><T k={NAME[g]} />{g === active && autoOn && <b key={cycleKey} className="hw-bar" aria-hidden="true" />}
            </button>
          ))}
        </div>
        <div className="hero-row">
          <div className="hero-copy">
            <p className="lede"><T en={lede} am={ledeAm} /></p>
            <div className="hero-actions">
              <Link className="btn red" href="/products"><T k="cta.browse" /> <ArrowRight /></Link>
              <Link className="btn ghost" href="/wholesale"><T k="cta.wholesale" /></Link>
            </div>
            <p className="hero-hint" aria-hidden="true"><span className="hint-dot" /><T k="hero.hint" /></p>
          </div>
          <div className="hero-bag" aria-live="polite">
            <div className="bagframe" style={{ transform: bag.tilt }}>
              <div className="ph">
                {ORDER.filter((g) => seen.includes(g)).map((g) => (
                  <Image key={g} className={g === active ? "on" : ""} src={BAGS[g].src} alt={g === active ? BAGS[g].alt : ""} fill sizes="(max-width: 900px) 88vw, 460px" quality={70} priority={g === "lentil"} fetchPriority={g === "lentil" ? "high" : "low"} />
                ))}
              </div>
              <div className="bagcap"><b>{bag.name}</b><span className={`tag${bag.kind === "concept" ? " concept" : ""}`}><T k={bag.kind === "actual" ? "tag.actual" : "tag.concept"} /></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
