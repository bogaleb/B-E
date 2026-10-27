import Image from "next/image";
import Link from "next/link";
import type { SiteContact } from "@/lib/types";
import { T } from "./T";
import { SoundToggle } from "./SoundToggle";

export function Footer({ contact }: { contact: SiteContact }) {
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Image src="/images/logo-white-gold.webp" alt="ETHIO" width={127} height={56} />
            <p style={{ maxWidth: "34ch" }}><T k="foot.blurb" /> <T k="foot.brandOf" /> {contact.company}, {contact.city}, {contact.state}.</p>
            {(contact.email || contact.phone) && (
              <p style={{ marginTop: 12 }}>{contact.email}{contact.email && contact.phone ? " · " : ""}{contact.phone}</p>
            )}
          </div>
          <div><h2 className="fh"><T k="foot.shop" /></h2><ul><li><Link href="/products"><T k="cta.allProducts" /></Link></li><li><Link href="/inquiry"><T k="foot.inquiry" /></Link></li><li><Link href="/order"><T k="foot.order" /></Link></li></ul></div>
          <div><h2 className="fh"><T k="foot.business" /></h2><ul><li><Link href="/wholesale"><T k="nav.wholesale" /></Link></li><li><Link href="/about"><T k="foot.aboutUs" /></Link></li><li><Link href="/contact"><T k="nav.contact" /></Link></li></ul></div>
          <div><h2 className="fh"><T k="foot.help" /></h2><ul><li><Link href="/faq"><T k="foot.faq" /></Link></li><li><Link href="/privacy"><T k="foot.privacy" /></Link></li><li><Link href="/terms"><T k="foot.terms" /></Link></li><li><SoundToggle /></li></ul></div>
        </div>
        <div className="fbase">
          <span>© {new Date().getFullYear()} {contact.company}. ETHIO is a brand of {contact.company}.</span>
          <span><T k="foot.concepts" /></span>
        </div>
      </div>
    </footer>
  );
}
