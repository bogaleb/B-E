import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { INQUIRY_STATUSES } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Empty, ExportButton, PageTitle, searchTerm, StatusFilter } from "../ui";

export const metadata = { title: "Order requests" };
type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function InquiriesPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { status, q } = await searchParams;
  let query = supabase.from("inquiries").select("id, reference, name, email, phone, delivery_zip, buyer_type, status, created_at, inquiry_items(quantity)").order("created_at", { ascending: false }).limit(200);
  if (status && (INQUIRY_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const term = searchTerm(q);
  if (term) query = query.or(`name.ilike.${term},email.ilike.${term},reference.ilike.${term}`);
  const { data, error } = await query;
  return (
    <>
      <PageTitle title="Order requests" sub="Requests from the inquiry list. Contact the customer to confirm price and delivery." actions={<ExportButton type="inquiries" />} />
      <StatusFilter base="/admin/inquiries" statuses={INQUIRY_STATUSES} current={status} q={q} />
      {error ? <Empty>Couldn&apos;t load order requests: {error.message}</Empty> : !data?.length ? <Empty>No order requests match this filter.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs text-muted"><tr><th className="px-4 py-3 font-semibold">Reference</th><th className="px-4 py-3 font-semibold">Customer</th><th className="px-4 py-3 font-semibold">ZIP</th><th className="px-4 py-3 font-semibold">Bags</th><th className="px-4 py-3 font-semibold">Received</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3 font-semibold tabular-nums"><Link className="text-green hover:underline" href={`/admin/inquiries/${r.id}`}>{r.reference}</Link></td>
                  <td className="px-4 py-3"><div className="font-medium">{r.name} <span className="text-xs text-muted">· {r.buyer_type}</span></div><div className="text-xs text-muted">{r.email} · {r.phone}</div></td>
                  <td className="px-4 py-3 tabular-nums">{r.delivery_zip}</td>
                  <td className="px-4 py-3 tabular-nums">{(r.inquiry_items as { quantity: number }[]).reduce((a, i) => a + i.quantity, 0)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3"><Badge tone={r.status}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
