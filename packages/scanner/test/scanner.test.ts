import { describe, expect, it } from "vitest";
import { runSyntheticScan } from "../src/index.js";

describe("runSyntheticScan", () => {
  it("performs the authorized synthetic scan vertical slice", () => {
    const result = runSyntheticScan({
      profileId: "profile_python_backend",
      authorizedSourceIds: ["src_synthetic_python_backend"]
    });

    expect(result.sources.every((source) => source.authorizationState === "authorized")).toBe(
      true
    );
    expect(result.redactionReport.length).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThanOrEqual(40);
  });
});
