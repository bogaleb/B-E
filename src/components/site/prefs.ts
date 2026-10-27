"use client";
import { useSyncExternalStore } from "react";
import { tr, type Key, type Lang } from "@/lib/i18n";

const EVT = "ethio:prefs";
const subscribe = (f: () => void) => {
  window.addEventListener(EVT, f);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", f);
  return () => { window.removeEventListener(EVT, f); mq.removeEventListener("change", f); };
};
const emit = () => window.dispatchEvent(new Event(EVT));
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } };
const load = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

export const getLang = (): Lang => (typeof document !== "undefined" && document.documentElement.dataset.lang === "am" ? "am" : "en");
export function setLang(l: Lang) {
  const d = document.documentElement;
  if (l === "am") d.dataset.lang = "am"; else delete d.dataset.lang;
  d.lang = l;
  save("ethio-lang", l);
  emit();
}
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "en");
}
/** Translate for attributes (placeholders, aria-labels) and toasts. */
export function useT() {
  const lang = useLang();
  return (k: Key) => tr(k, lang);
}

export type Theme = "light" | "dark";
export const getTheme = (): Theme => {
  if (typeof document === "undefined") return "light";
  const t = document.documentElement.dataset.theme;
  if (t === "dark" || t === "light") return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  save("ethio-theme", t);
  emit();
}
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "light");
}

export const soundOn = () => load("ethio-sound") !== "off";
export function setSound(on: boolean) { save("ethio-sound", on ? "on" : "off"); emit(); }
export function useSound(): boolean {
  return useSyncExternalStore(subscribe, () => (typeof window === "undefined" ? true : soundOn()), () => true);
}

