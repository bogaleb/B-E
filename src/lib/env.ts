/** Environment helpers. Never import server-only secrets from client code. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, ""),
};

export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
}

/** Accept form submissions without a database (local development / design previews only). */
export function demoSubmissionsAllowed(): boolean {
  if (process.env.ALLOW_DEMO_SUBMISSIONS === "true") return true;
  if (process.env.ALLOW_DEMO_SUBMISSIONS === "false") return false;
  return process.env.NODE_ENV !== "production";
}
