import type { Metadata } from "next";
import { Legal } from "@/components/site/Legal";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <Legal title="Terms of use">
      <h2>Requests are not orders</h2>
      <p>Submitting an order request or wholesale inquiry does not create a sale. Prices, availability and delivery are confirmed by B&amp;E Wholesale LLC before an order is final.</p>
      <h2>Product information</h2>
      <p>We try to keep product details accurate. The package label is the authoritative source for ingredients, allergens and nutrition facts. Some images are package design concepts and are labeled as such.</p>
      <h2>Use of the site</h2>
      <p>Don&apos;t misuse the forms, send spam or try to access parts of the site that aren&apos;t meant for you.</p>
      <h2>Brand</h2>
      <p>The ETHIO name and logo belong to B&amp;E Wholesale LLC.</p>
      <h2>Contact</h2>
      <p>B&amp;E Wholesale LLC, Sterling, Virginia.</p>
    </Legal>
  );
}
