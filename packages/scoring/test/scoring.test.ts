import { describe, expect, it } from "vitest";
import { calculateScore, mapLevel } from "../src/index.js";

describe("scoring", () => {
  it("calculates weighted task scores on a 100 point scale", () => {
    const score = calculateScore({
      functionalCorrectness: 0.8,
      regressionProtection: 1,
      requirementCompletion: 0.7,
      autonomy: 0.9,
      efficiency: 0.75,
      codeQuality: 0.8,
      safetyPolicy: 1
    });

    expect(score.total).toBe(83.6);
    expect(score.weightsTotal).toBe(100);
  });

  it("maps scores to versioned DevGhost levels", () => {
    expect(mapLevel(83.6).label).toBe("System Maintainer");
    expect(mapLevel(83.6).level).toBe(5);
  });
});
