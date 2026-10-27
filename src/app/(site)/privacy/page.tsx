import type { Metadata } from "next";
import { Legal } from "@/components/site/Legal";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <Legal title="Privacy policy">
      <h2>What we collect</h2>
      <p>When you send an order request, wholesale inquiry or message, we collect the details you enter: name, email, phone, delivery ZIP code, business details and notes, plus the products and quantities you choose. We also keep a one-way hash of your IP address to prevent spam and abuse.</p>
      <h2>How we use it</h2>
      <ul><li>To reply to your request and confirm price, availability and delivery.</li><li>To keep a record of requests and orders.</li><li>To protect our forms from spam and abuse.</li></ul>
      <h2>What we don&apos;t do</h2>
      <p>We don&apos;t sell your information. We don&apos;t take card payments on this site.</p>
      <h2>Who we share it with</h2>
      <p>Only with service providers that help us run the site (hosting, database and email delivery), and only to provide those services.</p>
      <h2>Your browser</h2>
      <p>Your inquiry list is stored in your browser until you send it or clear it. We don&apos;t use advertising or tracking cookies.</p>
      <h2>Your choices</h2>
      <p>You can ask us to update or delete the information you sent us by contacting B&amp;E Wholesale LLC.</p>
    </Legal>
  );
}
