import { describe, expect, it } from "vitest";
import { addLine, clampQty, removeLine, sanitize, setQty, totalQty } from "@/lib/cart";

const l = { slug: "red-lentils", variant: "2 LB", buyer: "household" as const, qty: 1 };

describe("cart", () => {
  it("merges identical lines and keeps different buyers separate", () => {
    let c = addLine([], l);
    c = addLine(c, { ...l, qty: 2 });
    c = addLine(c, { ...l, buyer: "business" });
    expect(c).toHaveLength(2);
    expect(c[0]!.qty).toBe(3);
    expect(totalQty(c)).toBe(4);
  });
  it("clamps quantities", () => {
    expect(clampQty(0)).toBe(1);
    expect(clampQty(5000)).toBe(999);
    expect(clampQty(NaN)).toBe(1);
    expect(setQty([l], 0, -4)[0]!.qty).toBe(1);
  });
  it("removes lines", () => expect(removeLine([l, { ...l, slug: "beans" }], 0).map((x) => x.slug)).toEqual(["beans"]));
  it("sanitizes untrusted storage data", () => {
    expect(sanitize("nope")).toEqual([]);
    expect(sanitize([{ slug: "a", variant: "b", buyer: "admin", qty: "7" }, { bad: true }])).toEqual([{ slug: "a", variant: "b", buyer: "household", qty: 7 }]);
  });
});
