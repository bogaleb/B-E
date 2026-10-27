import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Toast } from "@/components/site/Toast";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { publicEnv } from "@/lib/env";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const c = settings.contact;
  const org = {
    "@context": "https://schema.org", "@type": "Organization", name: "ETHIO Foods", legalName: c.company, url: publicEnv.siteUrl,
    logo: `${publicEnv.siteUrl}/images/logo-color.webp`,
    address: { "@type": "PostalAddress", addressLocality: c.city, addressRegion: c.state, addressCountry: "US" },
    ...(c.email ? { email: c.email } : {}), ...(c.phone ? { telephone: c.phone } : {}),
  };
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {settings.announcement.enabled && settings.announcement.text && (
        <div className="preview" role="note"><div className="wrap"><span>{settings.announcement.text}</span></div></div>
      )}
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer contact={c} />
      <CartDrawer products={products} />
      <Toast />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org).replace(/</g, "\\u003c") }} />
    </>
  );
}
