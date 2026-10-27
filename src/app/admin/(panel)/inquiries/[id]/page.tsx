import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { INQUIRY_STATUSES } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusForm } from "@/components/admin/forms";
import { PageTitle } from "../../ui";

type Props = { params: Promise<{ id: string }> };

export default async function InquiryDetail({ params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: r } = await supabase.from("inquiries").select("*, inquiry_items(id, product_name, variant_label, buyer_type, quantity)").eq("id", id).single();
  if (!r) notFound();
  const items = r.inquiry_items as { id: string; product_name: string; variant_label: string | null; buyer_type: string; quantity: number }[];
  const rows: [string, React.ReactNode][] = [
    ["Name", r.name], ["Email", <span key="e" className="select-all">{r.email}</span>], ["Phone", <span key="p" className="select-all">{r.phone}</span>],
    ["Delivery ZIP", r.delivery_zip], ["Buying for", r.buyer_type], ...(r.business_name ? [["Business", r.business_name] as [string, string]] : []),
    ["Received", formatDate(r.created_at)], ["Last updated", formatDate(r.updated_at)],
  ];
  return (
    <>
      <Link href="/admin/inquiries" className="text-sm font-semibold text-green">← Order requests</Link>
      <PageTitle title={r.reference} sub={`Order request from ${r.name}`} actions={<Badge tone={r.status}>{r.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Card><CardHeader><CardTitle>Customer</CardTitle></CardHeader><CardContent>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[140px_1fr]">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-sm text-muted">{k}</dt><dd className="text-sm font-medium">{v}</dd></div>)}</dl>
            {r.notes && <div className="mt-5 rounded-xl bg-cream p-4 text-sm"><p className="mb-1 font-semibold">Customer notes</p><p className="whitespace-pre-wrap">{r.notes}</p></div>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Products</CardTitle><span className="text-sm text-muted tabular-nums">{items.reduce((a, i) => a + i.quantity, 0)} bags</span></CardHeader>
            <CardContent className="p-0"><table className="w-full text-sm"><tbody className="divide-y divide-line">
              {items.map((i) => <tr key={i.id}><td className="px-5 py-3 font-medium">{i.product_name}</td><td className="px-5 py-3 text-muted">{i.variant_label}</td><td className="px-5 py-3 text-muted capitalize">{i.buyer_type}</td><td className="px-5 py-3 text-right font-semibold tabular-nums">{i.quantity}</td></tr>)}
            </tbody></table></CardContent>
          </Card>
        </div>
        <Card className="h-fit"><CardHeader><CardTitle>Follow-up</CardTitle></CardHeader><CardContent>
          <StatusForm kind="inquiry" id={r.id} statuses={INQUIRY_STATUSES} status={r.status} notes={r.internal_notes} />
        </CardContent></Card>
      </div>
    </>
  );
}
