import { describe, expect, it } from "vitest";
import { runLocalArena } from "../src/index.js";

describe("runLocalArena", () => {
  it("runs vanilla, generic, and personalized mock conditions", () => {
    const result = runLocalArena({
      agent: "mock",
      conditions: ["vanilla", "generic", "personalized"],
      profileId: "profile_python_backend"
    });

    expect(result.label).toBe("Local Run");
    expect(result.verification).toBe("Unverified");
    expect(result.conditions.map((condition) => condition.condition)).toEqual([
      "vanilla",
      "generic",
      "personalized"
    ]);
    expect(result.personalizationLift).toBeGreaterThan(0);
  });
});
