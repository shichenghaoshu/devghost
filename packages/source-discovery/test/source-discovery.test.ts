import { describe, expect, it } from "vitest";
import { discoverSyntheticSources } from "../src/index.js";

describe("discoverSyntheticSources", () => {
  it("discovers synthetic fixtures without reading content", () => {
    const sources = discoverSyntheticSources("2026-06-09T00:00:00.000Z");

    expect(sources).toHaveLength(2);
    expect(sources.every((source) => source.contentRead === false)).toBe(true);
    expect(sources.every((source) => source.discoveryState === "discovered")).toBe(true);
    expect(sources.every((source) => source.authorizationState === "pending")).toBe(true);
    expect(sources.map((source) => source.kind)).toEqual([
      "synthetic_fixture",
      "synthetic_fixture"
    ]);
  });
});
