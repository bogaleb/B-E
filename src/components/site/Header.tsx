"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { totalQty } from "@/lib/cart";
import { drawer, useCart } from "./store";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const path = usePathname();
  const lines = useCart();
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
            <Link key={l.href} href={l.href} aria-current={path.startsWith(l.href) ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
        <button className="menubtn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="navlinks" onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
        <button className="bagbtn" id="bagbtn" aria-label={`Open inquiry list, ${count} bags`} onClick={drawer.open}>
          <ShoppingBag strokeWidth={1.8} /><span className="lbl">Inquiry</span><span className="count" suppressHydrationWarning>{count}</span>
        </button>
      </div>
    </header>
  );
}
