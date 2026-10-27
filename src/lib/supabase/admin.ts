import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS — use only on the server, only for
 * inserting public submissions and calling the rate-limit function.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!publicEnv.supabaseUrl || !key) return null;
  return createClient(publicEnv.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Public anon client without cookies, for cached catalog reads. */
export function createAnonClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) return null;
  return createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
