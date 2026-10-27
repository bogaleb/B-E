import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  new: "bg-red/10 text-red",
  contacted: "bg-gold/20 text-[#7A5C14]",
  quoted: "bg-gold/20 text-[#7A5C14]",
  replied: "bg-green/10 text-green",
  confirmed: "bg-green/10 text-green",
  won: "bg-green/10 text-green",
  fulfilled: "bg-deep/10 text-deep",
  closed: "bg-muted/15 text-muted",
  lost: "bg-muted/15 text-muted",
  cancelled: "bg-muted/15 text-muted",
  active: "bg-green/10 text-green",
  hidden: "bg-muted/15 text-muted",
  actual: "bg-green/10 text-green",
  concept: "bg-gold/20 text-[#7A5C14]",
};

export function Badge({ tone, children, className }: { tone: string; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", TONES[tone] ?? "bg-cream text-ink", className)}>
    <span className="size-1.5 rounded-full bg-current" />{children}
  </span>;
}
