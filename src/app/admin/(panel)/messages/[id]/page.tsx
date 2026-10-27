import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { MESSAGE_STATUSES, TOPICS } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusForm } from "@/components/admin/forms";
import { PageTitle } from "../../ui";

type Props = { params: Promise<{ id: string }> };

export default async function MessageDetail({ params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: m } = await supabase.from("contact_messages").select("*").eq("id", id).single();
  if (!m) notFound();
  return (
    <>
      <Link href="/admin/messages" className="text-sm font-semibold text-green">← Messages</Link>
      <PageTitle title={m.name} sub={`${TOPICS[m.topic as keyof typeof TOPICS]} · ${formatDate(m.created_at)}`} actions={<Badge tone={m.status}>{m.status}</Badge>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card><CardHeader><CardTitle>Message</CardTitle><span className="text-sm"><span className="select-all">{m.email}</span>{m.phone ? <> · <span className="select-all">{m.phone}</span></> : null}</span></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p></CardContent></Card>
        <Card className="h-fit"><CardHeader><CardTitle>Follow-up</CardTitle></CardHeader><CardContent>
          <StatusForm kind="message" id={m.id} statuses={MESSAGE_STATUSES} status={m.status} notes={m.internal_notes} />
        </CardContent></Card>
      </div>
    </>
  );
}
