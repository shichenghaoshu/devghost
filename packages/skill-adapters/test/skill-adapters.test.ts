import { describe, expect, it } from "vitest";
import { normalizeSyntheticEvidence } from "@devghost/evidence";
import { compileDeterministicSkill } from "@devghost/skill-compiler";
import { renderSkillPackage } from "../src/index.js";

describe("renderSkillPackage", () => {
  it("renders an instruction-only universal skill package", () => {
    const compiled = compileDeterministicSkill({
      evidence: normalizeSyntheticEvidence("profile_python_backend"),
      profileId: "profile_python_backend",
      tokenBudget: 4000
    });
    const rendered = renderSkillPackage(compiled, "universal");

    expect(rendered.files.map((file) => file.path)).toContain("SKILL.md");
    expect(rendered.files.map((file) => file.path)).toContain("skill-manifest.json");
    expect(rendered.files.every((file) => !file.executable)).toBe(true);
    expect(rendered.files.find((file) => file.path === "SKILL.md")?.content).toMatch(
      /^---\nname: devghost-profile/m
    );
  });
});
