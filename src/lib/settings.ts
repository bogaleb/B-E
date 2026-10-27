import "server-only";
import { cache } from "react";
import { createAnonClient } from "@/lib/supabase/admin";
import type { SiteContact } from "@/lib/types";

export const DEFAULT_CONTACT: SiteContact = { company: "B&E Wholesale LLC", city: "Sterling", state: "Virginia", email: null, phone: null, hours: null };
export const DEFAULT_SETTINGS = {
  contact: DEFAULT_CONTACT,
  announcement: { enabled: false, text: "" },
  "home.hero": {
    lede: "ETHIO packs everyday pulses, grains and seeds for home kitchens, grocery shelves and restaurants. Pick what you need and send a request. We confirm price, stock and delivery with you directly.",
    ledeAm: "ኢትዮ ለቤት ኩሽናዎች፣ ለሱቅ መደርደሪያዎችና ለምግብ ቤቶች የዕለት ተዕለት ጥራጥሬዎችን፣ እህሎችንና ዘሮችን ያሽጋል። የሚፈልጉትን ይምረጡና ጥያቄ ይላኩ። ዋጋ፣ ክምችትና ማድረሻን በቀጥታ ከእርስዎ ጋር እናረጋግጣለን።",
  },
  "about.story": {
    body: "ETHIO is the packaged-food brand of B&E Wholesale LLC, based in Sterling, Virginia. We pack the lentils, beans, seeds and grains that families cook with every week and supply them to households, stores and restaurants.",
    bodyAm: "ኢትዮ በስተርሊንግ፣ ቨርጂኒያ የሚገኘው የቢ ኤንድ ኢ ሆልሴል ኤልኤልሲ የታሸጉ ምግቦች ብራንድ ነው። ቤተሰቦች በየሳምንቱ የሚያበስሉባቸውን ምስር፣ ባቄላ፣ ዘሮችና እህሎች አሽገን ለቤተሰቦች፣ ለሱቆችና ለምግብ ቤቶች እናቀርባለን።",
  },
};
export type Settings = typeof DEFAULT_SETTINGS;

export const getSettings = cache(async (): Promise<Settings> => {
  const sb = createAnonClient();
  if (!sb) return DEFAULT_SETTINGS;
  const { data, error } = await sb.from("site_settings").select("key, value").eq("is_public", true);
  if (error || !data) return DEFAULT_SETTINGS;
  const out = structuredClone(DEFAULT_SETTINGS) as Record<string, unknown>;
  for (const row of data) if (row.key in out) out[row.key] = { ...(out[row.key] as object), ...(row.value as object) };
  return out as Settings;
});
