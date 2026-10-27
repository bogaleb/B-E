import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · ETHIO admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="force-light min-h-dvh bg-cream font-body text-ink">{children}</div>;
}
