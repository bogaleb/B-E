import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Empty, PageTitle } from "../ui";

export const metadata = { title: "Activity log" };

export default async function ActivityPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("admin_activity_logs").select("id, actor_id, action, entity_type, entity_id, details, created_at").order("created_at", { ascending: false }).limit(200);
  const ids = [...new Set((data ?? []).map((r) => r.actor_id).filter(Boolean))];
  const { data: people } = ids.length ? await supabase.from("user_profiles").select("id, full_name").in("id", ids) : { data: [] };
  const who = (id: string | null) => people?.find((p) => p.id === id)?.full_name ?? (id ? id.slice(0, 8) : "System");
  return (
    <>
      <PageTitle title="Activity log" sub="Every change made in the dashboard, newest first." />
      {!data?.length ? <Empty>No activity yet.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-cream/60 text-xs text-muted"><tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Who</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Record</th></tr></thead>
            <tbody className="divide-y divide-line">{data.map((r) => (
              <tr key={r.id}><td className="px-4 py-2.5 text-muted">{formatDate(r.created_at)}</td><td className="px-4 py-2.5">{who(r.actor_id)}</td><td className="px-4 py-2.5">{String(r.action).replace(/_/g, " ")}</td><td className="px-4 py-2.5 text-xs text-muted">{r.entity_type}{r.entity_id ? ` · ${String(r.entity_id).slice(0, 8)}` : ""}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
