import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Setup check: reports which settings are present (never their values) and whether the database answers. */
export async function GET() {
  const checks = {
    supabaseUrl: Boolean(publicEnv.supabaseUrl),
    anonKey: Boolean(publicEnv.supabaseAnonKey),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    ipHashSalt: Boolean(process.env.IP_HASH_SALT),
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    adminNotificationEmail: Boolean(process.env.ADMIN_NOTIFICATION_EMAIL),
    database: "not checked" as string,
  };
  const sb = createServiceClient();
  if (sb) {
    const { error } = await sb.from("products").select("id", { count: "exact", head: true });
    checks.database = error ? `error: ${error.message.slice(0, 120)}` : "ok";
  }
  const ready = checks.supabaseUrl && checks.anonKey && checks.serviceRoleKey && checks.database === "ok";
  return NextResponse.json({ ready, formsAccepting: ready, emails: checks.resendApiKey && checks.adminNotificationEmail, checks }, { headers: { "Cache-Control": "no-store" } });
}
