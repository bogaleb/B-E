import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-display text-3xl text-deep">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function ExportButton({ type }: { type: string }) {
  return <Button asChild variant="outline"><a href={`/admin/export/${type}`}><Download />Export CSV</a></Button>;
}

export function StatusFilter({ base, statuses, current, q }: { base: string; statuses: readonly string[]; current?: string; q?: string }) {
  const href = (s?: string) => { const p = new URLSearchParams(); if (s) p.set("status", s); if (q) p.set("q", q); const qs = p.toString(); return qs ? `${base}?${qs}` : base; };
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {[undefined, ...statuses].map((s) => (
        <Link key={s ?? "all"} href={href(s)} aria-current={current === s ? "page" : undefined}
          className={`rounded-full border px-3 py-1 text-sm font-medium capitalize ${current === s ? "border-deep bg-deep text-white" : "border-line bg-white hover:border-deep"}`}>{s ?? "All"}</Link>
      ))}
      <form className="ml-auto" action={base}>
        {current && <input type="hidden" name="status" value={current} />}
        <input name="q" defaultValue={q} placeholder="Search name, email, reference" aria-label="Search" className="h-9 w-64 rounded-full border border-line bg-white px-4 text-sm focus:border-green focus:outline-none" />
      </form>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center text-sm text-muted">{children}</div>;
}

/** Escape user input before using it inside a PostgREST or() filter. */
export function searchTerm(q?: string) {
  const s = (q ?? "").trim().slice(0, 80).replace(/[,()*%\\]/g, " ").trim();
  return s ? `%${s}%` : null;
}
