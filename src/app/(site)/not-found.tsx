import Link from "next/link";
import { T } from "@/components/site/T";

export default function NotFound() {
  return (
    <section className="sec"><div className="wrap"><div className="empty">
      <h3><T k="nf.title" /></h3>
      <p className="muted"><T k="nf.help" /></p>
      <Link className="btn" href="/products"><T k="cta.browse" /></Link>
    </div></div></section>
  );
}
