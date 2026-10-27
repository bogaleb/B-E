import { describe, expect, it } from "vitest";
import { csvCell, toCSV } from "@/lib/csv";

describe("csv", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('He said "hi", then left\nbye')).toBe('"He said ""hi"", then left\nbye"');
  });
  it("neutralizes spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"http://x\")")).toBe("\"'=HYPERLINK(\"\"http://x\"\")\"");
    expect(csvCell("+1 555")).toBe("'+1 555");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
  });
  it("joins arrays and handles nulls", () => {
    expect(csvCell(["a", "b"])).toBe("a; b");
    expect(csvCell(null)).toBe("");
    expect(toCSV(["A", "B"], [[1, null]])).toBe("A,B\r\n1,\r\n");
  });
});
