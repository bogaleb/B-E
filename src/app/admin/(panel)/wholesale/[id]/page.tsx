import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { BUSINESS_TYPES, FREQUENCIES, WHOLESALE_STATUSES } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusForm } from "@/components/admin/forms";
import { PageTitle } from "../../ui";

type Props = { params: Promise<{ id: string }> };

export default async function WholesaleDetail({ params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: r } = await supabase.from("wholesale_inquiries").select("*, wholesale_inquiry_items(id, product_name, quantity_text)").eq("id", id).single();
  if (!r) notFound();
  const items = r.wholesale_inquiry_items as { id: string; product_name: string; quantity_text: string | null }[];
  const rows: [string, React.ReactNode][] = [
    ["Business", r.business_name], ["Contact", r.contact_name], ["Email", <span key="e" className="select-all">{r.email}</span>], ["Phone", <span key="p" className="select-all">{r.phone}</span>],
    ["Business type", BUSINESS_TYPES[r.business_type as keyof typeof BUSINESS_TYPES]], ["Location", r.location],
    ["Order frequency", FREQUENCIES[r.order_frequency as keyof typeof FREQUENCIES]], ["Received", formatDate(r.created_at)],
  ];
  return (
    <>
      <Link href="/admin/wholesale" className="text-sm font-semibold text-green">← Wholesale inquiries</Link>
      <PageTitle title={r.reference} sub={`Wholesale inquiry from ${r.business_name}`} actions={<Badge tone={r.status}>{r.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <Card><CardHeader><CardTitle>Business</CardTitle></CardHeader><CardContent>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[150px_1fr]">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-sm text-muted">{k}</dt><dd className="text-sm font-medium">{v}</dd></div>)}</dl>
            {r.notes && <div className="mt-5 rounded-xl bg-cream p-4 text-sm"><p className="mb-1 font-semibold">Notes from the business</p><p className="whitespace-pre-wrap">{r.notes}</p></div>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Requested products</CardTitle></CardHeader><CardContent className="p-0"><table className="w-full text-sm"><tbody className="divide-y divide-line">
            {items.map((i) => <tr key={i.id}><td className="px-5 py-3 font-medium">{i.product_name}</td><td className="px-5 py-3 text-right text-muted">{i.quantity_text || "Quantity to discuss"}</td></tr>)}
          </tbody></table></CardContent></Card>
        </div>
        <Card className="h-fit"><CardHeader><CardTitle>Follow-up</CardTitle></CardHeader><CardContent>
          <StatusForm kind="wholesale" id={r.id} statuses={WHOLESALE_STATUSES} status={r.status} notes={r.internal_notes} />
        </CardContent></Card>
      </div>
    </>
  );
}
