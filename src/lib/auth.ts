import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export type Role = "admin" | "editor" | "viewer";
export interface AdminContext {
  userId: string;
  email: string | null;
  role: Role;
  supabase: Awaited<ReturnType<typeof createSessionClient>>;
}

/** Verifies the session with Supabase Auth (getUser hits the auth server) and loads the role. */
export async function getAdmin(): Promise<AdminContext | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single();
  const role = (profile?.role ?? "viewer") as Role;
  if (role !== "admin" && role !== "editor") return null;
  return { userId: user.id, email: user.email ?? null, role, supabase };
}

export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdmin();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

/** For server actions and route handlers: throw instead of redirecting. */
export async function assertAdmin(opts?: { ownerOnly?: boolean }): Promise<AdminContext> {
  const ctx = await getAdmin();
  if (!ctx) throw new Error("Not authorized");
  if (opts?.ownerOnly && ctx.role !== "admin") throw new Error("Only an admin can do this");
  return ctx;
}

export async function logActivity(ctx: AdminContext, action: string, entityType: string, entityId?: string | null, details?: Record<string, unknown>) {
  const { error } = await ctx.supabase.from("admin_activity_logs").insert({ actor_id: ctx.userId, action, entity_type: entityType, entity_id: entityId ?? null, details: details ?? null });
  if (error) console.error("[audit] failed to log", action, error.message);
}
