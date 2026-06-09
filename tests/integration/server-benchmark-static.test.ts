import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { runServerBenchmark } from "../../scripts/server-benchmark.mjs";

describe("runServerBenchmark", () => {
  it("writes a server benchmark scorecard and static latest page", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "devghost-server-benchmark-"));

    const result = await runServerBenchmark({ outputDir, now: "2026-06-09T00:00:00.000Z" });

    expect(result.productName).toBe("VibeBenchmark");
    expect(result.overallScore).toBe(84);
    expect(result.verification).toBe("Server Run / Unverified");
    expect(result.serverVerified).toBe(false);
    expect(result.scoreBreakdown).toHaveLength(8);
    expect(result.scoreBreakdown.some((item) => item.track === "ACM")).toBe(true);
    expect(result.scoreBreakdown.some((item) => item.track === "Engineering")).toBe(true);
    expect(result.leaderboard.length).toBeGreaterThan(1);

    const scorecard = JSON.parse(await readFile(join(outputDir, "scorecard.json"), "utf8")) as {
      productName: string;
      overallScore: number;
      serverVerified: boolean;
    };
    const html = await readFile(join(outputDir, "index.html"), "utf8");

    expect(scorecard.productName).toBe("VibeBenchmark");
    expect(scorecard.overallScore).toBe(84);
    expect(scorecard.serverVerified).toBe(false);
    expect(html).toContain("VibeBenchmark");
    expect(html).toContain("84 / 100");
    expect(html).toContain("综合评分");
    expect(html).toContain("<details");
    expect(html).toContain("递归煎饼摊");
    expect(html).toContain("祖传屎山考古局");
    expect(html).toContain("VibeLeaderboard");
    expect(html).toContain("GitHub");
    expect(html).toContain("你的名字");
  });
});
