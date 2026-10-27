import { describe, expect, it } from "vitest";
import { hashIp, isSameOrigin, memoryRateLimit, readJson, HttpError } from "@/lib/security";
import { sniffImageType } from "@/lib/image-check";

const req = (headers: Record<string, string>, body = "{}") => new Request("https://ethio.example/api/x", { method: "POST", headers, body });

describe("isSameOrigin", () => {
  it("accepts same-host Origin", () => expect(isSameOrigin(req({ host: "ethio.example", origin: "https://ethio.example" }))).toBe(true));
  it("rejects cross-site Origin", () => expect(isSameOrigin(req({ host: "ethio.example", origin: "https://evil.example" }))).toBe(false));
  it("rejects missing Origin and Referer", () => expect(isSameOrigin(req({ host: "ethio.example" }))).toBe(false));
  it("falls back to Referer", () => expect(isSameOrigin(req({ host: "ethio.example", referer: "https://ethio.example/order" }))).toBe(true));
});

describe("memoryRateLimit", () => {
  it("allows up to the limit within a window, then blocks, then resets", () => {
    const t = 1_000_000_000_000;
    for (let i = 0; i < 3; i++) expect(memoryRateLimit("k", 3, 60, t)).toBe(true);
    expect(memoryRateLimit("k", 3, 60, t)).toBe(false);
    expect(memoryRateLimit("k", 3, 60, t + 61_000)).toBe(true);
  });
});

describe("readJson", () => {
  it("requires JSON content type", async () => {
    await expect(readJson(req({ "content-type": "text/plain" }))).rejects.toBeInstanceOf(HttpError);
  });
  it("rejects oversized bodies", async () => {
    await expect(readJson(req({ "content-type": "application/json" }, JSON.stringify({ a: "x".repeat(40_000) })))).rejects.toMatchObject({ status: 413 });
  });
  it("parses JSON", async () => expect(await readJson(req({ "content-type": "application/json" }, '{"a":1}'))).toEqual({ a: 1 }));
});

describe("hashIp", () => {
  it("is stable and does not contain the IP", () => {
    expect(hashIp("1.2.3.4")).toBe(hashIp("1.2.3.4"));
    expect(hashIp("1.2.3.4")).not.toContain("1.2.3.4");
  });
});

describe("sniffImageType", () => {
  it("detects real image signatures and rejects disguised files", () => {
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImageType(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("%PDF-1.7"))).toBeNull();
  });
});
