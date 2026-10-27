import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { MESSAGE_STATUSES, TOPICS } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Empty, ExportButton, PageTitle, searchTerm, StatusFilter } from "../ui";

export const metadata = { title: "Messages" };
type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { status, q } = await searchParams;
  let query = supabase.from("contact_messages").select("id, name, email, topic, message, status, created_at").order("created_at", { ascending: false }).limit(200);
  if (status && (MESSAGE_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const term = searchTerm(q);
  if (term) query = query.or(`name.ilike.${term},email.ilike.${term},message.ilike.${term}`);
  const { data, error } = await query;
  return (
    <>
      <PageTitle title="Messages" sub="Questions sent from the contact page." actions={<ExportButton type="messages" />} />
      <StatusFilter base="/admin/messages" statuses={MESSAGE_STATUSES} current={status} q={q} />
      {error ? <Empty>Couldn&apos;t load messages: {error.message}</Empty> : !data?.length ? <Empty>No messages match this filter.</Empty> : (
        <ul className="grid gap-3">
          {data.map((m) => (
            <li key={m.id}><Link href={`/admin/messages/${m.id}`} className="grid gap-1 rounded-2xl border border-line bg-white p-4 hover:border-deep">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{m.name} <span className="text-xs font-normal text-muted">· {m.email} · {TOPICS[m.topic as keyof typeof TOPICS]}</span></span><span className="flex items-center gap-3 text-xs text-muted">{formatDate(m.created_at)}<Badge tone={m.status}>{m.status}</Badge></span></div>
              <p className="line-clamp-2 text-sm text-muted">{m.message}</p>
            </Link></li>
          ))}
        </ul>
      )}
    </>
  );
}
