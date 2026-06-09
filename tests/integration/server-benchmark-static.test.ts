import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { runServerBenchmark } from "../../scripts/server-benchmark.mjs";

describe("runServerBenchmark", () => {
  it("writes a server benchmark scorecard and static latest page", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "devghost-server-benchmark-"));

    const result = await runServerBenchmark({ outputDir, now: "2026-06-09T00:00:00.000Z" });

    expect(result.finalScore).toBe(84);
    expect(result.verification).toBe("Server Run / Unverified");
    expect(result.serverVerified).toBe(false);
    expect(result.worldScores).toHaveLength(4);

    const scorecard = JSON.parse(await readFile(join(outputDir, "scorecard.json"), "utf8")) as {
      finalScore: number;
      serverVerified: boolean;
    };
    const html = await readFile(join(outputDir, "index.html"), "utf8");

    expect(scorecard.finalScore).toBe(84);
    expect(scorecard.serverVerified).toBe(false);
    expect(html).toContain("Server Benchmark Result");
    expect(html).toContain("84 / 100");
  });
});
