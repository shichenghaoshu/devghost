import { describe, expect, it } from "vitest";
import { buildEvidenceGraph, normalizeSyntheticEvidence } from "../src/index.js";

describe("evidence normalization", () => {
  it("normalizes synthetic evidence and excludes unsafe records from upload eligibility", () => {
    const evidence = normalizeSyntheticEvidence("profile_python_backend");

    expect(evidence.length).toBeGreaterThanOrEqual(40);
    expect(evidence.some((record) => record.evidenceType === "demonstrated")).toBe(true);
    expect(evidence.some((record) => record.evidenceType === "aspirational")).toBe(true);
    expect(evidence.filter((record) => record.evidenceType === "unsafe")).toEqual(
      expect.arrayContaining([expect.objectContaining({ uploadEligible: false })])
    );
  });

  it("builds a minimal graph with evidence-backed edges", () => {
    const graph = buildEvidenceGraph(normalizeSyntheticEvidence("profile_python_backend"));

    expect(graph.nodes.some((node) => node.kind === "DeveloperProfile")).toBe(true);
    expect(graph.edges.every((edge) => edge.evidenceRefs.length > 0)).toBe(true);
  });
});
