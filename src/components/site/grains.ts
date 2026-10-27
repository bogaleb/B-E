import type { GrainStyle } from "@/lib/types";

export const GRAIN: Record<GrainStyle, { colors: string[]; w: number; h: number; t: number }> = {
  lentil: { colors: ["#E57A35", "#EE8A43", "#D96A2A", "#F09A55", "#E3803F"], w: 9, h: 8, t: 3.1 },
  flax: { colors: ["#7B3F22", "#8E4D2B", "#6A341B", "#9A5733", "#5E2E18"], w: 8, h: 4.2, t: 2.4 },
  fava: { colors: ["#D6B35A", "#C9A247", "#E0C273", "#BF9640", "#D9BC6A"], w: 12, h: 9, t: 4.2 },
  bulgur: { colors: ["#C7984B", "#D4A85C", "#B98940", "#DDB46C"], w: 4.4, h: 3.6, t: 1.8 },
  bean: { colors: ["#8C4A35", "#A35A41", "#7A3D2B", "#E9DCC2", "#B46A4C"], w: 11, h: 7, t: 4 },
};

export interface Sprite { c: HTMLCanvasElement; w: number; h: number }
const cache = new Map<string, Sprite[]>();

export function sprites(type: GrainStyle, dpr: number): Sprite[] {
  const key = `${type}@${dpr}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const g = GRAIN[type];
  const out: Sprite[] = [];
  for (let i = 0; i < 14; i++) {
    const s = 0.82 + Math.random() * 0.36, w = g.w * s, h = g.h * s, pad = 3;
    const c = document.createElement("canvas");
    c.width = Math.ceil((w + pad * 2) * dpr);
    c.height = Math.ceil((h + pad * 2) * dpr);
    const x = c.getContext("2d")!;
    x.scale(dpr, dpr);
    x.translate(w / 2 + pad, h / 2 + pad);
    const col = g.colors[i % g.colors.length]!;
    x.fillStyle = col;
    x.beginPath();
    if (type === "flax") {
      x.moveTo(-w / 2, 0); x.quadraticCurveTo(-w / 2, -h / 2, w * 0.1, -h / 2); x.quadraticCurveTo(w / 2, -h * 0.3, w / 2, 0);
      x.quadraticCurveTo(w / 2, h * 0.3, w * 0.1, h / 2); x.quadraticCurveTo(-w / 2, h / 2, -w / 2, 0);
    } else if (type === "fava") {
      x.moveTo(-w / 2, h * 0.05); x.bezierCurveTo(-w / 2, -h * 0.6, w * 0.45, -h * 0.62, w / 2, -h * 0.05);
      x.bezierCurveTo(w * 0.52, h * 0.5, -w * 0.1, h * 0.6, -w / 2, h * 0.05);
    } else if (type === "bulgur") {
      x.moveTo(-w / 2, -h * 0.2); x.lineTo(-w * 0.1, -h / 2); x.lineTo(w / 2, -h * 0.25); x.lineTo(w * 0.35, h / 2); x.lineTo(-w * 0.35, h * 0.4);
    } else if (type === "bean") {
      x.moveTo(-w / 2, 0); x.bezierCurveTo(-w / 2, -h * 0.65, w / 2, -h * 0.65, w / 2, 0); x.bezierCurveTo(w / 2, h * 0.55, w * 0.12, h * 0.5, 0, h * 0.25);
      x.bezierCurveTo(-w * 0.12, h * 0.5, -w / 2, h * 0.55, -w / 2, 0);
    } else {
      x.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    }
    x.closePath();
    x.fill();
    const gr = x.createLinearGradient(0, -h / 2, 0, h / 2);
    gr.addColorStop(0, "rgba(255,255,255,.32)"); gr.addColorStop(0.55, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(60,20,0,.22)");
    x.fillStyle = gr; x.fill();
    x.lineWidth = 0.6; x.strokeStyle = "rgba(60,25,5,.25)"; x.stroke();
    if (type === "fava") { x.beginPath(); x.moveTo(-w * 0.3, h * 0.05); x.quadraticCurveTo(0, -h * 0.12, w * 0.32, 0); x.strokeStyle = "rgba(120,80,20,.35)"; x.lineWidth = 0.8; x.stroke(); }
    if (type === "flax") { x.beginPath(); x.ellipse(-w * 0.05, -h * 0.18, w * 0.22, h * 0.12, 0, 0, Math.PI * 2); x.fillStyle = "rgba(255,230,200,.45)"; x.fill(); }
    if (type === "bean" && col === "#E9DCC2") { x.beginPath(); x.ellipse(0, -h * 0.05, w * 0.12, h * 0.1, 0, 0, Math.PI * 2); x.fillStyle = "rgba(40,20,10,.5)"; x.fill(); }
    out.push({ c, w: w + pad * 2, h: h + pad * 2 });
  }
  cache.set(key, out);
  return out;
}

export function paintSwatch(canvas: HTMLCanvasElement, type: GrainStyle) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = canvas.getBoundingClientRect();
  const W = Math.max(40, r.width || 300), H = Math.max(40, r.height || 220);
  canvas.width = W * dpr; canvas.height = H * dpr;
  const x = canvas.getContext("2d")!;
  x.scale(dpr, dpr);
  x.fillStyle = "#F3EAD6"; x.fillRect(0, 0, W, H);
  const sp = sprites(type, dpr), g = GRAIN[type];
  const n = Math.floor((W * H) / (g.w * g.h * 0.55));
  for (let i = 0; i < n; i++) {
    const s = sp[(Math.random() * sp.length) | 0]!;
    x.save(); x.translate(Math.random() * W, Math.random() * H); x.rotate(Math.random() * Math.PI * 2);
    x.drawImage(s.c, -s.w / 2, -s.h / 2, s.w, s.h); x.restore();
  }
  const v = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(40,20,5,.28)");
  x.fillStyle = v; x.fillRect(0, 0, W, H);
}
