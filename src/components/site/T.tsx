import type { ReactNode } from "react";
import { D, type Key } from "@/lib/i18n";

/**
 * Renders English and Amharic side by side; CSS shows the one matching <html data-lang>.
 * This keeps pages statically rendered, avoids a flash of the wrong language, and
 * works in both server and client components.
 */
export function T({ k, en, am }: { k?: Key; en?: ReactNode; am?: ReactNode }) {
  const e = k ? D[k].en : en;
  const a = k ? D[k].am : am;
  if (a === undefined || a === null || a === "" || a === e) return <>{e}</>;
  return (
    <>
      <span className="l-en">{e}</span>
      <span className="l-am" lang="am">{a}</span>
    </>
  );
}
