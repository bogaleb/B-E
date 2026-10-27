import Image from "next/image";
import Link from "next/link";
import type { SiteContact } from "@/lib/types";

export function Footer({ contact }: { contact: SiteContact }) {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Image src="/images/logo-white-gold.webp" alt="ETHIO" width={127} height={56} />
            <p style={{ maxWidth: "34ch" }}>Pantry staples for home kitchens, grocery shelves and restaurants. A brand of {contact.company}, {contact.city}, {contact.state}.</p>
            {(contact.email || contact.phone) && (
              <p style={{ marginTop: 12 }}>{contact.email}{contact.email && contact.phone ? " · " : ""}{contact.phone}</p>
            )}
          </div>
          <div><h2 className="fh">Shop</h2><ul><li><Link href="/products">All products</Link></li><li><Link href="/inquiry">Inquiry list</Link></li><li><Link href="/order">Order request</Link></li></ul></div>
          <div><h2 className="fh">Business</h2><ul><li><Link href="/wholesale">Wholesale</Link></li><li><Link href="/about">About us</Link></li><li><Link href="/contact">Contact</Link></li></ul></div>
          <div><h2 className="fh">Help</h2><ul><li><Link href="/faq">FAQ</Link></li><li><Link href="/privacy">Privacy policy</Link></li><li><Link href="/terms">Terms</Link></li></ul></div>
        </div>
        <div className="fbase">
          <span>© {new Date().getFullYear()} {contact.company}. ETHIO is a brand of {contact.company}.</span>
          <span>Some images show package design concepts and are labeled as such.</span>
        </div>
      </div>
    </footer>
  );
}
