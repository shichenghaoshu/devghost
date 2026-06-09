import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { discoverLocalAccountSources } from "../src/index.js";

describe("discoverLocalAccountSources", () => {
  it("counts local account sources without marking content as read", async () => {
    const root = await mkdtemp(join(tmpdir(), "devghost-discovery-"));
    await mkdir(join(root, ".codex", "memories"), { recursive: true });
    await mkdir(join(root, ".claude", "projects", "proj-a", "memory"), { recursive: true });
    await writeFile(join(root, ".codex", "memories", "MEMORY.md"), "pytest uv regression", "utf8");
    await writeFile(
      join(root, ".claude", "projects", "proj-a", "memory", "MEMORY.md"),
      "typescript react pnpm",
      "utf8"
    );

    const sources = await discoverLocalAccountSources({
      homeDir: root,
      cwd: root,
      discoveredAt: "2026-06-09T00:00:00.000Z"
    });

    expect(sources.map((source) => source.id)).toContain("src_local_codex_memories");
    expect(sources.map((source) => source.id)).toContain("src_local_claude_projects");
    expect(sources.every((source) => source.contentRead === false)).toBe(true);
    expect(sources.find((source) => source.id === "src_local_codex_memories")?.estimatedFileCount).toBe(1);
    expect(JSON.stringify(sources)).not.toContain(root);
  });
});
