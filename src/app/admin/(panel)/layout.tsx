import Image from "next/image";
import Link from "next/link";
import { Boxes, FileText, Inbox, LayoutDashboard, ListTree, LogOut, MessageSquare, ScrollText, Store } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "Order requests", icon: Inbox },
  { href: "/admin/wholesale", label: "Wholesale", icon: Store },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: ListTree },
  { href: "/admin/settings", label: "Website content", icon: FileText },
  { href: "/admin/activity", label: "Activity log", icon: ScrollText },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-deep px-4 py-5 text-white lg:sticky lg:top-0 lg:h-dvh lg:border-b-0">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href="/admin" className="block"><Image src="/images/logo-white-gold.webp" alt="ETHIO" width={110} height={49} /></Link>
          <p className="text-xs text-white/60 lg:mt-3">{ctx.email} · {ctx.role}</p>
        </div>
        <nav className="mt-5 flex gap-1 overflow-x-auto lg:grid" aria-label="Admin">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white">
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 hidden gap-2 lg:grid">
          <Link href="/" className="text-sm text-white/70 hover:text-white">View website</Link>
          <form action={signOut}><Button variant="ghost" size="sm" className="px-0 text-white/70 hover:bg-transparent hover:text-white"><LogOut />Sign out</Button></form>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
