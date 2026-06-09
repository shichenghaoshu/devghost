import { describe, expect, it } from "vitest";
import { normalizeSyntheticEvidence } from "@devghost/evidence";
import { compileDeterministicSkill } from "../src/index.js";

describe("compileDeterministicSkill", () => {
  it("creates deterministic skill IR and excludes aspirational or unsafe evidence", () => {
    const evidence = normalizeSyntheticEvidence("profile_python_backend");
    const first = compileDeterministicSkill({
      evidence,
      profileId: "profile_python_backend",
      tokenBudget: 4000
    });
    const second = compileDeterministicSkill({
      evidence,
      profileId: "profile_python_backend",
      tokenBudget: 4000
    });

    expect(first.hash).toBe(second.hash);
    expect(first.skillIr.workflows.length).toBeGreaterThan(0);
    expect(first.skillIr.workflows.flatMap((workflow) => workflow.evidence_refs)).not.toEqual(
      expect.arrayContaining(
        evidence
          .filter((record) => ["aspirational", "unsafe", "stale"].includes(record.evidenceType))
          .map((record) => record.id)
      )
    );
    expect(first.manifest.rawSourceUploaded).toBe(false);
  });
});
