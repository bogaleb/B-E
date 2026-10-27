import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTitle } from "./ui";

export default async function Overview() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, status?: string) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    return (await q).count ?? 0;
  };
  const [newInq, allInq, newWs, allWs, newMsg, products, recentInq, recentWs] = await Promise.all([
    count("inquiries", "new"), count("inquiries"), count("wholesale_inquiries", "new"), count("wholesale_inquiries"), count("contact_messages", "new"),
    count("products"),
    supabase.from("inquiries").select("id, reference, name, status, created_at, inquiry_items(quantity)").order("created_at", { ascending: false }).limit(6),
    supabase.from("wholesale_inquiries").select("id, reference, business_name, status, created_at").order("created_at", { ascending: false }).limit(6),
  ]);
  const tiles = [
    { label: "New order requests", value: newInq, sub: `${allInq} total`, href: "/admin/inquiries?status=new" },
    { label: "New wholesale inquiries", value: newWs, sub: `${allWs} total`, href: "/admin/wholesale?status=new" },
    { label: "New messages", value: newMsg, sub: "From the contact form", href: "/admin/messages?status=new" },
    { label: "Products", value: products, sub: "In the catalog", href: "/admin/products" },
  ];
  return (
    <>
      <PageTitle title="Overview" sub="What needs your attention today." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-2xl border border-line bg-white p-5 hover:border-deep">
            <p className="text-sm text-muted">{t.label}</p>
            <p className={`mt-1 font-display text-4xl tabular-nums ${t.value && t.label.startsWith("New") ? "text-red" : "text-deep"}`}>{t.value}</p>
            <p className="mt-1 text-xs text-muted">{t.sub}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Latest order requests</CardTitle><Link className="text-sm font-semibold text-green" href="/admin/inquiries">See all</Link></CardHeader>
          <CardContent className="p-0">
            {(recentInq.data ?? []).length === 0 ? <p className="p-5 text-sm text-muted">No order requests yet. They appear here as soon as a customer sends one.</p> :
              <ul className="divide-y divide-line">{(recentInq.data ?? []).map((r) => (
                <li key={r.id}><Link href={`/admin/inquiries/${r.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-cream">
                  <span><b className="font-semibold">{r.name}</b> <span className="text-xs text-muted tabular-nums">{r.reference}</span></span>
                  <span className="flex items-center gap-3 text-xs text-muted">{(r.inquiry_items as { quantity: number }[]).reduce((a, i) => a + i.quantity, 0)} bags · {formatDate(r.created_at)} <Badge tone={r.status}>{r.status}</Badge></span>
                </Link></li>))}</ul>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Latest wholesale inquiries</CardTitle><Link className="text-sm font-semibold text-green" href="/admin/wholesale">See all</Link></CardHeader>
          <CardContent className="p-0">
            {(recentWs.data ?? []).length === 0 ? <p className="p-5 text-sm text-muted">No wholesale inquiries yet.</p> :
              <ul className="divide-y divide-line">{(recentWs.data ?? []).map((r) => (
                <li key={r.id}><Link href={`/admin/wholesale/${r.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-cream">
                  <span><b className="font-semibold">{r.business_name}</b> <span className="text-xs text-muted tabular-nums">{r.reference}</span></span>
                  <span className="flex items-center gap-3 text-xs text-muted">{formatDate(r.created_at)} <Badge tone={r.status}>{r.status}</Badge></span>
                </Link></li>))}</ul>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
