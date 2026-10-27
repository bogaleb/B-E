import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { clientIp, hashIp, HttpError, isSameOrigin, rateLimit, readJson } from "@/lib/security";
import { fieldErrors } from "@/lib/validation";

/**
 * Shared pipeline for public form endpoints:
 * same-origin check → rate limit → JSON size/type → Zod → honeypot → handler.
 */
export function formEndpoint<S extends z.ZodType>(opts: {
  name: string;
  schema: S;
  limit: { max: number; windowSec: number };
  handle: (input: z.infer<S>, ctx: { ipHash: string; userAgent: string }) => Promise<Record<string, unknown>>;
}) {
  return async function POST(req: Request) {
    try {
      if (!isSameOrigin(req)) throw new HttpError(403, "This request was blocked. Reload the page and try again.");
      const ip = clientIp(req);
      const ipHash = hashIp(ip);
      if (!(await rateLimit(`${opts.name}:${ipHash}`, opts.limit.max, opts.limit.windowSec)))
        throw new HttpError(429, "Too many requests from your connection. Wait a few minutes and try again.");
      const body = await readJson(req);
      // Honeypot: bots fill every field. Pretend success, store nothing.
      if (body && typeof body === "object" && "website" in body && (body as { website?: string }).website) {
        return NextResponse.json({ ok: true, reference: null }, { status: 200 });
      }
      const parsed = opts.schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ ok: false, error: "Check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
      }
      const out = await opts.handle(parsed.data, { ipHash, userAgent: req.headers.get("user-agent") ?? "" });
      return NextResponse.json({ ok: true, ...out }, { status: 201, headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
      console.error(`[${opts.name}] unexpected error`, e);
      return NextResponse.json({ ok: false, error: "Something went wrong on our side. Your request was not saved. Please try again." }, { status: 500 });
    }
  };
}
