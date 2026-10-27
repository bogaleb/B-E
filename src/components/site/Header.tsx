"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { totalQty } from "@/lib/cart";
import type { Key } from "@/lib/i18n";
import { drawer, useCart } from "./store";
import { setLang, setTheme, useLang, useT, useTheme } from "./prefs";
import { T } from "./T";

const LINKS: { href: string; k: Key }[] = [
  { href: "/products", k: "nav.products" },
  { href: "/wholesale", k: "nav.wholesale" },
  { href: "/about", k: "nav.about" },
  { href: "/contact", k: "nav.contact" },
];

export function LangSwitch() {
  const lang = useLang();
  const t = useT();
  return (
    <div className="langsw" role="group" aria-label={t("lang.label")}>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">EN</button>
      <button type="button" aria-pressed={lang === "am"} onClick={() => setLang("am")} lang="am">አማ</button>
    </div>
  );
}

export function ThemeToggle() {
  const theme = useTheme();
  const t = useT();
  const dark = theme === "dark";
  return (
    <button type="button" className="iconbtn themebtn" aria-label={t(dark ? "theme.toLight" : "theme.toDark")} title={t(dark ? "theme.toLight" : "theme.toDark")}
      onClick={() => {
        const next = dark ? "light" : "dark";
        const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
        if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(() => setTheme(next));
        else setTheme(next);
      }}>
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}

export function Header() {
  const path = usePathname();
  const lines = useCart();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const count = totalQty(lines);
  return (
    <header className={`nav${scrolled ? " scrolled" : ""}`}>
      <div className="wrap">
        <Link className="brand" href="/" aria-label="ETHIO Foods home">
          <Image src="/images/logo-color.webp" alt="ETHIO" width={104} height={46} priority />
        </Link>
        <nav className={`navlinks${open ? " open" : ""}`} id="navlinks" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? "page" : undefined}><T k={l.k} /></Link>
          ))}
        </nav>
        <div className="navtools">
          <LangSwitch />
          <ThemeToggle />
          <button className="menubtn" aria-label={t(open ? "nav.menuClose" : "nav.menuOpen")} aria-expanded={open} aria-controls="navlinks" onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </button>
          <button className="bagbtn" id="bagbtn" aria-label={`${t("nav.inquiry")}: ${count}`} onClick={drawer.open}>
            <ShoppingBag strokeWidth={1.8} /><span className="lbl"><T k="nav.inquiry" /></span><span className="count" suppressHydrationWarning>{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
