import { describe, expect, it } from "vitest";
import { makeReference, REFERENCE_PATTERN } from "@/lib/reference";

describe("makeReference", () => {
  it("formats prefix, New York date and a 5-character code", () => {
    const ref = makeReference("ETH", new Date("2026-10-27T03:00:00Z"), () => new Uint8Array([0, 1, 2, 3, 4]));
    expect(ref).toBe("ETH-261026-ABCDE"); // 03:00 UTC is still Oct 26 in New York
    expect(REFERENCE_PATTERN.test(ref)).toBe(true);
  });
  it("matches the database check constraint format", () => {
    for (let i = 0; i < 200; i++) {
      expect(makeReference("ETH")).toMatch(/^ETH-[0-9]{6}-[A-Z0-9]{5}$/);
      expect(makeReference("WHL")).toMatch(/^WHL-[0-9]{6}-[A-Z0-9]{5}$/);
    }
  });
  it("never uses ambiguous characters", () => {
    for (let i = 0; i < 200; i++) expect(makeReference("ETH").slice(-5)).not.toMatch(/[01IOL]/);
  });
});
