import type { CartLine } from "./types";

/** Pure cart operations — unit tested. */
export const MAX_QTY = 999;
export const clampQty = (n: number) => (Number.isFinite(n) ? Math.max(1, Math.min(MAX_QTY, Math.floor(n))) : 1);

export function addLine(lines: CartLine[], add: CartLine): CartLine[] {
  const i = lines.findIndex((l) => l.slug === add.slug && l.variant === add.variant && l.buyer === add.buyer);
  if (i === -1) return [...lines, { ...add, qty: clampQty(add.qty) }];
  return lines.map((l, j) => (j === i ? { ...l, qty: clampQty(l.qty + add.qty) } : l));
}
export const setQty = (lines: CartLine[], index: number, qty: number) => lines.map((l, i) => (i === index ? { ...l, qty: clampQty(qty) } : l));
export const removeLine = (lines: CartLine[], index: number) => lines.filter((_, i) => i !== index);
export const totalQty = (lines: CartLine[]) => lines.reduce((a, l) => a + l.qty, 0);

export function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l): l is CartLine => !!l && typeof l === "object" && typeof (l as CartLine).slug === "string" && typeof (l as CartLine).variant === "string")
    .map((l) => ({ slug: l.slug.slice(0, 80), variant: l.variant.slice(0, 60), buyer: (l.buyer === "business" ? "business" : "household") as CartLine["buyer"], qty: clampQty(Number(l.qty)) }))
    .slice(0, 50);
}
