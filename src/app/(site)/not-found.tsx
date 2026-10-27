import Link from "next/link";

export default function NotFound() {
  return (
    <section className="sec"><div className="wrap"><div className="empty">
      <h3>We couldn&apos;t find that page</h3>
      <p className="muted">It may have moved. Try the product catalog.</p>
      <Link className="btn" href="/products">Browse products</Link>
    </div></div></section>
  );
}
