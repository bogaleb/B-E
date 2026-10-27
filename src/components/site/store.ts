"use client";
import { useSyncExternalStore } from "react";
import { addLine, removeLine, sanitize, setQty } from "@/lib/cart";
import type { CartLine } from "@/lib/types";

const KEY = "ethio-inquiry";
let lines: CartLine[] = [];
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { lines = sanitize(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { lines = []; }
}
function commit(next: CartLine[]) {
  lines = next;
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* storage unavailable */ }
  subs.forEach((f) => f());
}
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => { if (e.key === KEY) { loaded = false; load(); subs.forEach((f) => f()); } });
}

const EMPTY: CartLine[] = [];
export function useCart() {
  const value = useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => { load(); return lines; },
    () => EMPTY,
  );
  return value;
}
export const cart = {
  add: (l: CartLine) => { load(); commit(addLine(lines, l)); },
  setQty: (i: number, q: number) => commit(setQty(lines, i, q)),
  remove: (i: number) => commit(removeLine(lines, i)),
  clear: () => commit([]),
  get: () => { load(); return lines; },
};

// ---- toast ------------------------------------------------------------------
export interface ToastMsg { id: number; text: string; href?: string; linkText?: string }
let toastMsg: ToastMsg | null = null;
const toastSubs = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
export function toast(text: string, link?: { href: string; text: string }) {
  toastMsg = { id: Date.now(), text, href: link?.href, linkText: link?.text };
  toastSubs.forEach((f) => f());
  clearTimeout(timer);
  timer = setTimeout(() => { toastMsg = null; toastSubs.forEach((f) => f()); }, 3400);
}
export function useToast() {
  return useSyncExternalStore((f) => { toastSubs.add(f); return () => toastSubs.delete(f); }, () => toastMsg, () => null);
}

// ---- drawer -----------------------------------------------------------------
let drawerOpen = false;
const drawerSubs = new Set<() => void>();
export const drawer = { open: () => { drawerOpen = true; drawerSubs.forEach((f) => f()); }, close: () => { drawerOpen = false; drawerSubs.forEach((f) => f()); } };
export function useDrawer() {
  return useSyncExternalStore((f) => { drawerSubs.add(f); return () => drawerSubs.delete(f); }, () => drawerOpen, () => false);
}

// ---- add-to-inquiry flight ----------------------------------------------------
export function flyToBag(from: Element, colors: string[]) {
  const bag = document.getElementById("bagbtn");
  const bump = () => { if (!bag) return; bag.classList.remove("bump"); void (bag as HTMLElement).offsetWidth; bag.classList.add("bump"); };
  if (!bag || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return bump();
  const a = from.getBoundingClientRect(), z = bag.getBoundingClientRect();
  const sx = a.left + a.width / 2, sy = a.top + a.height / 2, ex = z.left + z.width / 2, ey = z.top + z.height / 2;
  for (let i = 0; i < 7; i++) {
    const d = document.createElement("div");
    d.className = "fly";
    d.style.background = colors[i % colors.length]!;
    d.style.width = d.style.height = `${8 + Math.random() * 7}px`;
    document.body.appendChild(d);
    const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 120, my = Math.min(sy, ey) - 80 - Math.random() * 80;
    d.animate(
      [
        { transform: `translate(${sx}px,${sy}px) scale(1)`, opacity: 1 },
        { transform: `translate(${mx}px,${my}px) scale(1.1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${ex}px,${ey}px) scale(.4)`, opacity: 0.2 },
      ],
      { duration: 700 + i * 45, easing: "cubic-bezier(.4,.1,.3,1)", delay: i * 30 },
    ).onfinish = () => d.remove();
  }
  setTimeout(bump, 760);
}
