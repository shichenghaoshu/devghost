import { describe, expect, it } from "vitest";
import { assertSafeRelativePath } from "@devghost/config";

describe("path safety", () => {
  it("rejects path traversal and null bytes", () => {
    expect(() => assertSafeRelativePath("../../etc/passwd")).toThrow(/path traversal/i);
    expect(() => assertSafeRelativePath("safe\u0000name.md")).toThrow(/null byte/i);
  });

  it("allows normal relative paths", () => {
    expect(assertSafeRelativePath("references/provenance-map.json")).toBe(
      "references/provenance-map.json"
    );
  });
});
