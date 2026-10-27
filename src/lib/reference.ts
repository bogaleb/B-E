const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L to avoid read-back mistakes

/** e.g. ETH-261027-7K3QM. Date part uses America/New_York. */
export function makeReference(prefix: "ETH" | "WHL", now = new Date(), random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const bytes = random(5);
  let code = "";
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${get("year")}${get("month")}${get("day")}-${code}`;
}

export const REFERENCE_PATTERN = /^(ETH|WHL)-\d{6}-[A-Z0-9]{5}$/;
