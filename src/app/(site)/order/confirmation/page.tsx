import type { Metadata } from "next";
import { Confirmation } from "@/components/site/Confirmation";

export const metadata: Metadata = { title: "Request received", robots: { index: false } };
type Props = { searchParams: Promise<{ ref?: string }> };

export default async function ConfirmationPage({ searchParams }: Props) {
  const ref = String((await searchParams).ref ?? "").slice(0, 20);
  return <section className="sec"><div className="wrap"><Confirmation reference={ref} /></div></section>;
}
