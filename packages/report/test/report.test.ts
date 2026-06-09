import { describe, expect, it } from "vitest";
import { generateHtmlReport, generateShareCardSvg } from "../src/index.js";

describe("report generation", () => {
  it("generates sanitized local unverified HTML and SVG reports", () => {
    const report = {
      runId: "run_001",
      profileId: "profile_python_backend",
      label: "Local Run" as const,
      verification: "Unverified" as const,
      model: "mock-model",
      agent: "mock",
      skillHash: "sha256:abc123",
      skillTokenCount: 1200,
      personalizationLift: 16.8,
      skillLift: 20.1,
      transferRadius: 3.7,
      negativeTransferRate: 0,
      safetyGrade: "A",
      worldScores: [
        { world: "Bug Cave", score: 91 },
        { world: "Repository Maze", score: 82 }
      ],
      evidenceCoverage: { demonstrated: 5, preferred: 5, negative: 3 },
      environment: { network: "none", cpuLimit: 2, memoryMb: 4096 }
    };

    const html = generateHtmlReport(report);
    const svg = generateShareCardSvg(report);

    expect(html).toContain("Local Run");
    expect(html).toContain("Unverified");
    expect(html).not.toContain("/Users/");
    expect(html).not.toContain("dev@example.test");
    expect(svg).toContain("MY DEVGHOST");
    expect(svg).not.toContain("dev@example.test");
  });
});
