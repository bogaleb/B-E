"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Thin branded progress bar while the next page loads. */
export function NavProgress() {
  const path = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("loading"), 80);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  const first = useRef(true);
  useEffect(() => {
    // Replay a short enter animation on the page content after client-side navigation.
    if (first.current) first.current = false;
    else {
      const m = document.getElementById("main");
      if (m) { m.classList.remove("enter"); void m.offsetWidth; m.classList.add("enter"); }
    }
    clearTimeout(timer.current);
    setState((s) => (s === "loading" ? "done" : "idle"));
    const t = setTimeout(() => setState("idle"), 450);
    return () => clearTimeout(t);
  }, [path, search]);
  return <div className={`navprog ${state}`} aria-hidden="true"><span /></div>;
}
