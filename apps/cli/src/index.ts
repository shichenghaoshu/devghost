#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Command } from "commander";
import { defaultConfig } from "@devghost/config";
import { runLocalArena } from "@devghost/arena-core";
import { generateHtmlReport, generateShareCardSvg, type LocalReportData } from "@devghost/report";
import { runSyntheticScan } from "@devghost/scanner";
import { renderSkillPackage, type SkillTarget } from "@devghost/skill-adapters";
import { compileDeterministicSkill } from "@devghost/skill-compiler";
import {
  discoverClaudeMetadata,
  discoverCodexMetadata,
  discoverSyntheticSources
} from "@devghost/source-discovery";

const program = new Command();

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function toReportData(
  scan: ReturnType<typeof runSyntheticScan>,
  compiled: ReturnType<typeof compileDeterministicSkill>,
  arena: Awaited<ReturnType<typeof runLocalArena>>
): LocalReportData {
  return {
    runId: arena.runId,
    profileId: arena.profileId,
    label: arena.label,
    verification: arena.verification,
    model: arena.model,
    agent: arena.agent,
    skillHash: compiled.hash,
    skillTokenCount: compiled.manifest.tokenCount,
    personalizationLift: arena.personalizationLift,
    skillLift: arena.skillLift,
    transferRadius: 3.7,
    negativeTransferRate: 0,
    safetyGrade: scan.redactionReport.some((finding) => finding.action === "block-upload") ? "B" : "A",
    worldScores: arena.worldScores,
    evidenceCoverage: compiled.manifest.evidenceCoverage,
    environment: {
      network: defaultConfig.arena.network,
      cpuLimit: 2,
      memoryMb: 4096
    }
  };
}

async function runDemo(): Promise<void> {
  const outputRoot = join(".devghost", "output", new Date().toISOString().replace(/[:.]/g, "-"));
  const skillRoot = join(outputRoot, "devghost-profile");
  await mkdir(skillRoot, { recursive: true });

  const scan = runSyntheticScan({
    profileId: "profile_python_backend",
    authorizedSourceIds: ["src_synthetic_python_backend"]
  });
  const compiled = compileDeterministicSkill({
    evidence: scan.evidence,
    profileId: "profile_python_backend",
    tokenBudget: defaultConfig.compiler.tokenBudget
  });
  const rendered = renderSkillPackage(compiled, "universal");
  const arena = runLocalArena({
    agent: "mock",
    conditions: ["vanilla", "generic", "personalized"],
    profileId: "profile_python_backend"
  });
  const reportData = toReportData(scan, compiled, arena);
  const html = generateHtmlReport(reportData);
  const svg = generateShareCardSvg(reportData);

  await writeJson(join(outputRoot, "sources.json"), scan.sources);
  await writeJson(join(outputRoot, "evidence.json"), scan.evidence);
  await writeJson(join(outputRoot, "redaction-report.json"), scan.redactionReport);
  await writeJson(join(outputRoot, "skill-ir.json"), compiled.skillIr);
  await writeJson(join(outputRoot, "scorecard.json"), reportData);
  await writeFile(join(outputRoot, "report.html"), html, "utf8");
  await writeFile(join(outputRoot, "share-card.svg"), svg, "utf8");

  for (const file of rendered.files) {
    const target = join(skillRoot, file.path);
    await mkdir(target.split("/").slice(0, -1).join("/"), { recursive: true });
    await writeFile(target, file.content, "utf8");
  }

  printJson({
    status: "ok",
    output: outputRoot,
    label: reportData.label,
    verification: reportData.verification,
    skillHash: compiled.hash,
    evidenceRecords: scan.evidence.length,
    redactionFindings: scan.redactionReport.length,
    personalizationLift: arena.personalizationLift
  });
}

program
  .name("devghost")
  .description("Compile developer memory into an evidence-backed AI coding ghost")
  .version("0.1.0");

program
  .command("doctor")
  .option("--json", "print JSON")
  .action((options: { json?: boolean }) => {
    const result = {
      node: process.version,
      git: "required",
      docker: "optional-for-local-demo",
      python: "required-for-api-worker",
      uv: "required-for-python-workspace",
      codexCli: "optional",
      claudeCode: "optional",
      network: defaultConfig.arena.network,
      rawUploadSupported: false
    };
    if (options.json) {
      printJson(result);
      return;
    }
    console.log("DevGhost doctor");
    console.log(`Node: ${result.node}`);
    console.log("Raw upload: disabled");
  });

program
  .command("discover")
  .option("--json", "print JSON")
  .action((options: { json?: boolean }) => {
    const sources = [
      ...discoverSyntheticSources("2026-06-09T00:00:00.000Z"),
      ...discoverCodexMetadata("2026-06-09T00:00:00.000Z"),
      ...discoverClaudeMetadata("2026-06-09T00:00:00.000Z")
    ];
    if (options.json) {
      printJson(sources);
      return;
    }
    console.log("Detected sources:");
    for (const source of sources) {
      console.log(`- ${source.displayName}: ${source.discoveryState}, contentRead=${source.contentRead}`);
    }
  });

program
  .command("scan")
  .option("--source <source>", "source kind", "synthetic")
  .option("--dry-run", "do not read file bodies")
  .option("--json", "print JSON")
  .action((options: { source: string; dryRun?: boolean; json?: boolean }) => {
    if (options.dryRun) {
      const discovered = discoverSyntheticSources("2026-06-09T00:00:00.000Z");
      printJson({ dryRun: true, contentRead: false, sources: discovered });
      return;
    }
    if (options.source !== "synthetic") {
      throw new Error("v0.1 only scans synthetic fixtures in this initial vertical slice");
    }
    const result = runSyntheticScan({
      profileId: "profile_python_backend",
      authorizedSourceIds: ["src_synthetic_python_backend"]
    });
    if (options.json) {
      printJson(result);
      return;
    }
    console.log(`Evidence records: ${result.evidence.length}`);
    console.log(`Redaction findings: ${result.redactionReport.length}`);
  });

program
  .command("compile")
  .option("--target <target>", "universal, codex, or claude-code", "universal")
  .option("--token-budget <budget>", "token budget", "4000")
  .action((options: { target: SkillTarget; tokenBudget: string }) => {
    const scan = runSyntheticScan({
      profileId: "profile_python_backend",
      authorizedSourceIds: ["src_synthetic_python_backend"]
    });
    const compiled = compileDeterministicSkill({
      evidence: scan.evidence,
      profileId: "profile_python_backend",
      tokenBudget: Number.parseInt(options.tokenBudget, 10)
    });
    const rendered = renderSkillPackage(compiled, options.target);
    printJson({ skillHash: compiled.hash, files: rendered.files.map((file) => file.path) });
  });

program
  .command("play")
  .option("--agent <agent>", "mock, codex, or claude-code", "mock")
  .option("--json", "print JSON")
  .action((options: { agent: "mock" | "codex" | "claude-code"; json?: boolean }) => {
    const result = runLocalArena({
      agent: options.agent,
      conditions: ["vanilla", "generic", "personalized"],
      profileId: "profile_python_backend"
    });
    if (options.json) {
      printJson(result);
      return;
    }
    console.log(`${result.label} - ${result.verification}`);
    console.log(`Personalization Lift: +${result.personalizationLift}`);
  });

program
  .command("report")
  .option("--format <format>", "html or json", "html")
  .action((options: { format: "html" | "json" }) => {
    const scan = runSyntheticScan({
      profileId: "profile_python_backend",
      authorizedSourceIds: ["src_synthetic_python_backend"]
    });
    const compiled = compileDeterministicSkill({
      evidence: scan.evidence,
      profileId: "profile_python_backend",
      tokenBudget: defaultConfig.compiler.tokenBudget
    });
    const arena = runLocalArena({
      agent: "mock",
      conditions: ["vanilla", "generic", "personalized"],
      profileId: "profile_python_backend"
    });
    const reportData = toReportData(scan, compiled, arena);
    if (options.format === "json") {
      printJson(reportData);
      return;
    }
    console.log(generateHtmlReport(reportData));
  });

program.command("review").action(() => {
  console.log("Review uses synthetic authorized sources in v0.1. Raw upload is disabled.");
});

program.command("redact").action(() => {
  const scan = runSyntheticScan({
    profileId: "profile_python_backend",
    authorizedSourceIds: ["src_synthetic_python_backend"]
  });
  printJson(scan.redactionReport);
});

program.command("inspect").action(() => {
  const scan = runSyntheticScan({
    profileId: "profile_python_backend",
    authorizedSourceIds: ["src_synthetic_python_backend"]
  });
  const compiled = compileDeterministicSkill({
    evidence: scan.evidence,
    profileId: "profile_python_backend",
    tokenBudget: defaultConfig.compiler.tokenBudget
  });
  printJson({
    skillHash: compiled.hash,
    tokenCount: compiled.manifest.tokenCount,
    evidenceCoverage: compiled.manifest.evidenceCoverage,
    rawSourceUploaded: false
  });
});

program.command("submit").action(() => {
  throw new Error("v0.1 does not submit raw sources. Use a reviewed instruction-only skill package.");
});

program.command("demo").action(async () => {
  await runDemo();
});

await program.parseAsync(process.argv);
