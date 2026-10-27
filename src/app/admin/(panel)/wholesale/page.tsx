import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { BUSINESS_TYPES, FREQUENCIES, WHOLESALE_STATUSES } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Empty, ExportButton, PageTitle, searchTerm, StatusFilter } from "../ui";

export const metadata = { title: "Wholesale inquiries" };
type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function WholesaleList({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { status, q } = await searchParams;
  let query = supabase.from("wholesale_inquiries").select("id, reference, business_name, contact_name, email, business_type, location, order_frequency, status, created_at").order("created_at", { ascending: false }).limit(200);
  if (status && (WHOLESALE_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const term = searchTerm(q);
  if (term) query = query.or(`business_name.ilike.${term},contact_name.ilike.${term},email.ilike.${term},reference.ilike.${term}`);
  const { data, error } = await query;
  return (
    <>
      <PageTitle title="Wholesale inquiries" sub="Businesses asking about volume pricing and regular supply." actions={<ExportButton type="wholesale" />} />
      <StatusFilter base="/admin/wholesale" statuses={WHOLESALE_STATUSES} current={status} q={q} />
      {error ? <Empty>Couldn&apos;t load inquiries: {error.message}</Empty> : !data?.length ? <Empty>No wholesale inquiries match this filter.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs text-muted"><tr><th className="px-4 py-3 font-semibold">Reference</th><th className="px-4 py-3 font-semibold">Business</th><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 font-semibold">Location</th><th className="px-4 py-3 font-semibold">Frequency</th><th className="px-4 py-3 font-semibold">Received</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3 font-semibold tabular-nums"><Link className="text-green hover:underline" href={`/admin/wholesale/${r.id}`}>{r.reference}</Link></td>
                  <td className="px-4 py-3"><div className="font-medium">{r.business_name}</div><div className="text-xs text-muted">{r.contact_name} · {r.email}</div></td>
                  <td className="px-4 py-3">{BUSINESS_TYPES[r.business_type as keyof typeof BUSINESS_TYPES]}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3">{FREQUENCIES[r.order_frequency as keyof typeof FREQUENCIES]}</td>
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
