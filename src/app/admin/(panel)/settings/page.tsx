import { requireAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/forms";
import { PageTitle } from "../ui";

export const metadata = { title: "Website content" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("key, value");
  const get = <K extends keyof typeof DEFAULT_SETTINGS>(k: K) => ({ ...DEFAULT_SETTINGS[k], ...((data ?? []).find((r) => r.key === k)?.value ?? {}) }) as (typeof DEFAULT_SETTINGS)[K];
  const c = get("contact"), a = get("announcement"), h = get("home.hero"), s = get("about.story");
  return (
    <>
      <PageTitle title="Website content" sub="Business details and text shown across the website." />
      <Card><CardContent>
        <SettingsForm values={{ company: c.company, city: c.city, state: c.state, email: c.email ?? "", phone: c.phone ?? "", hours: c.hours ?? "", announcementEnabled: a.enabled, announcementText: a.text, heroLede: h.lede, aboutBody: s.body, heroLedeAm: h.ledeAm ?? "", aboutBodyAm: s.bodyAm ?? "" }} />
      </CardContent></Card>
    </>
  );
}
