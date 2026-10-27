import "server-only";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/admin";

/**
 * CSRF defence for JSON endpoints: require same-origin Origin (or Referer) header.
 * Combined with SameSite cookies and JSON-only bodies this blocks cross-site form posts.
 */
export function isSameOrigin(req: Request): boolean {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!host || !origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

/** Store only a salted hash of the IP — enough for abuse review, not identification. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "ethio-default-salt";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}

const memory = new Map<string, { start: number; hits: number }>();
export function memoryRateLimit(key: string, max: number, windowSec: number, now = Date.now()): boolean {
  const w = Math.floor(now / (windowSec * 1000));
  const k = `${key}:${w}`;
  const entry = memory.get(k) ?? { start: w, hits: 0 };
  entry.hits += 1;
  memory.set(k, entry);
  if (memory.size > 5000) for (const [mk, v] of memory) if (v.start < w) memory.delete(mk);
  return entry.hits <= max;
}

/** Shared limit via Postgres when configured; per-instance memory otherwise. */
export async function rateLimit(bucket: string, max: number, windowSec: number): Promise<boolean> {
  const sb = createServiceClient();
  if (!sb) return memoryRateLimit(bucket, max, windowSec);
  const { data, error } = await sb.rpc("check_rate_limit", { p_bucket: bucket, p_max: max, p_window_seconds: windowSec });
  if (error) {
    console.error("[rate-limit] falling back to memory", error.message);
    return memoryRateLimit(bucket, max, windowSec);
  }
  return data === true;
}

export async function readJson(req: Request, maxBytes = 32_000): Promise<unknown> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new HttpError(415, "Send the form as JSON.");
  const raw = await req.text();
  if (raw.length > maxBytes) throw new HttpError(413, "The request is too large.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "The request could not be read.");
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
