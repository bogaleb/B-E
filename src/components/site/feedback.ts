"use client";
import { soundOn } from "./prefs";

let ctx: AudioContext | null = null;

/** A soft rattle of grains, synthesized (no audio file), plus a short buzz on phones. */
export function addFeedback() {
  try { navigator.vibrate?.([10, 40, 14]); } catch { /* not supported */ }
  if (!soundOn()) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    for (let i = 0; i < 9; i++) {
      const t = now + i * 0.018 + Math.random() * 0.012;
      const len = 0.02;
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / d.length, 3);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2200 + Math.random() * 2600;
      bp.Q.value = 4;
      const g = ctx.createGain();
      g.gain.value = 0.9 - i * 0.08;
      src.connect(bp).connect(g).connect(master);
      src.start(t);
    }
  } catch { /* audio unavailable */ }
}
