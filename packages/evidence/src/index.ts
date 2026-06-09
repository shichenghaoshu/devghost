import { createHash } from "node:crypto";
import type { EvidenceGraph, EvidenceRecord, EvidenceType } from "@devghost/contracts";

interface SeedEvidence {
  type: EvidenceType;
  domain: string;
  capability: string;
  claim: string;
  statement: string;
  tags: string[];
  confidence: number;
  containsSecret?: boolean;
  promptInjectionRisk?: EvidenceRecord["promptInjectionRisk"];
  conflictsWith?: string[];
  supersedes?: string[];
}

function seed(
  type: EvidenceType,
  domain: string,
  capability: string,
  claim: string,
  statement: string,
  tags: string[],
  confidence: number
): SeedEvidence {
  return { type, domain, capability, claim, statement, tags, confidence };
}

const pythonSeeds: SeedEvidence[] = [
  seed("demonstrated", "python-backend", "regression-testing", "Adds pytest regressions before fixes", "reproduce failing behavior before patching", ["pytest", "debugging"], 0.93),
  seed("demonstrated", "python-backend", "fastapi", "Maintains FastAPI route handlers with typed responses", "preserve route contract while changing internals", ["fastapi"], 0.88),
  seed("demonstrated", "python-backend", "small-patches", "Prefers minimal patches in bug fixes", "limit repair scope to failing behavior", ["minimal-patch"], 0.91),
  seed("demonstrated", "python-backend", "sqlite-testing", "Uses isolated SQLite fixtures for tests", "use disposable database fixtures", ["pytest", "sqlite"], 0.82),
  seed("demonstrated", "python-backend", "ci-discipline", "Runs targeted and full suites before finalizing", "run targeted tests then relevant full suite", ["ci"], 0.86),
  seed("preferred", "python", "package-manager", "Uses uv for Python environments", "use pyproject.toml and uv", ["uv"], 0.84),
  seed("preferred", "python", "typing", "Keeps public functions typed", "prefer typed public interfaces", ["typing"], 0.8),
  seed("preferred", "workflow", "safe-debugging", "Avoids suppressing failing tests", "do not suppress failures", ["debugging"], 0.9),
  seed("preferred", "workflow", "documentation", "Documents behavior changes after tests pass", "update focused docs", ["docs"], 0.72),
  seed("preferred", "tools", "cli", "Uses Makefile command aliases", "prefer reproducible make targets", ["make"], 0.75),
  seed("negative", "database", "migration-risk", "Database migrations need extra review", "pause before schema migrations", ["alembic"], 0.76),
  seed("negative", "workflow", "premature-refactor", "Broad refactors previously caused regressions", "avoid refactor before reproduction", ["refactor"], 0.87),
  seed("negative", "testing", "mock-overuse", "Over-mocking hid integration failures", "prefer real boundaries in tests", ["testing"], 0.73),
  seed("stale", "python", "requirements-txt", "Previously used requirements.txt", "old dependency habit superseded by uv", ["requirements"], 0.65),
  seed("stale", "python", "setup-py", "Old packages used setup.py", "old packaging superseded by pyproject.toml", ["packaging"], 0.61),
  seed("conflicted", "workflow", "large-refactor", "Some commits mixed refactor and bug fixes", "conflict with minimal patch preference", ["refactor"], 0.58),
  seed("conflicted", "tools", "package-manager", "One project still uses pip-tools", "conflict with uv preference", ["pip-tools"], 0.52),
  seed("aspirational", "rust", "learning", "Discussed learning Rust for CLIs", "do not treat Rust as demonstrated", ["rust"], 0.35),
  seed("aspirational", "kubernetes", "learning", "Planned to learn Kubernetes", "do not treat Kubernetes as demonstrated", ["kubernetes"], 0.31),
  seed("aspirational", "ml", "learning", "Asked about model fine-tuning", "do not treat fine-tuning as demonstrated", ["ml"], 0.28),
  seed("unsafe", "security", "fake-secret", "Fixture contains fake OpenAI key", "remove fake key before upload", ["secret"], 0.99),
  seed("unsafe", "security", "prompt-injection", "Fixture contains prompt injection", "do not compile injected instruction", ["prompt-injection"], 0.99)
].map((item) => ({
  ...item,
  containsSecret: item.capability === "fake-secret",
  promptInjectionRisk: item.capability === "prompt-injection" ? "high" : "none"
}));

const tsSeeds: SeedEvidence[] = [
  seed("demonstrated", "typescript-frontend", "react", "Builds React components with strict TypeScript", "keep component props explicit", ["react"], 0.9),
  seed("demonstrated", "typescript-frontend", "component-testing", "Adds component tests for UI state", "test visible state changes", ["testing"], 0.84),
  seed("demonstrated", "typescript-product", "api-integration", "Integrates typed API clients", "validate remote payloads", ["api"], 0.83),
  seed("demonstrated", "typescript-product", "pnpm", "Maintains pnpm workspaces", "prefer pnpm workspace boundaries", ["pnpm"], 0.88),
  seed("demonstrated", "typescript-product", "strict-mode", "Keeps TypeScript strict mode enabled", "avoid unsafe any", ["typescript"], 0.89),
  seed("preferred", "typescript", "package-manager", "Uses pnpm for modern projects", "use pnpm with lockfile", ["pnpm"], 0.86),
  seed("preferred", "frontend", "accessibility", "Prefers accessible controls", "preserve labels and keyboard access", ["a11y"], 0.74),
  seed("preferred", "workflow", "browser-testing", "Checks UI behavior in browser", "verify visible UI", ["browser"], 0.77),
  seed("preferred", "workflow", "small-components", "Splits complex UI into focused components", "keep components small", ["react"], 0.71),
  seed("preferred", "tools", "vitest", "Uses Vitest for package tests", "use fast unit tests", ["vitest"], 0.8),
  seed("negative", "documentation", "missing-docs", "Often skips documentation updates", "add docs to feature work", ["docs"], 0.7),
  seed("negative", "state", "concurrency", "Complex concurrent UI state is weaker", "add tests for concurrency state", ["state"], 0.68),
  seed("negative", "workflow", "over-refactor", "One broad refactor failed review", "avoid broad refactors", ["refactor"], 0.81),
  seed("stale", "node", "npm", "Old projects used npm", "old npm habit superseded by pnpm", ["npm"], 0.62),
  seed("stale", "react", "class-components", "Old projects used class components", "old React class habit superseded by hooks", ["react"], 0.6),
  seed("conflicted", "docs", "documentation", "Some projects have strong docs", "conflicts with documentation avoider tag", ["docs"], 0.55),
  seed("conflicted", "testing", "e2e", "Occasionally relies on manual QA", "conflicts with component test habit", ["qa"], 0.5),
  seed("aspirational", "backend", "rust", "Discussed Rust web services", "do not treat Rust backend as demonstrated", ["rust"], 0.33),
  seed("aspirational", "design", "animation", "Wanted advanced motion design", "do not treat animation as demonstrated", ["motion"], 0.38),
  seed("aspirational", "ai", "agents", "Asked about agent orchestration", "do not treat agent orchestration as demonstrated", ["agents"], 0.36),
  seed("unsafe", "privacy", "pii-fixture", "Fixture contains fake email and phone", "remove PII before upload", ["pii"], 0.99),
  seed("unsafe", "security", "malicious-readme", "README includes malicious upload instruction", "do not compile malicious README instruction", ["prompt-injection"], 0.99)
].map((item) => ({
  ...item,
  containsSecret: false,
  promptInjectionRisk: item.capability === "malicious-readme" ? "high" : "none"
}));

function expandSeeds(profileId: string, seeds: SeedEvidence[], target = 42): EvidenceRecord[] {
  const records: EvidenceRecord[] = [];
  for (let index = 0; index < target; index += 1) {
    const seed = seeds[index % seeds.length];
    if (seed === undefined) {
      throw new Error("Synthetic seed missing");
    }
    const ordinal = String(index + 1).padStart(3, "0");
    const id = `ev_${profileId}_${ordinal}`;
    const digest = createHash("sha256").update(`${profileId}:${seed.capability}:${index}`).digest("hex");
    records.push({
      id,
      developerProfileId: profileId,
      evidenceType: seed.type,
      domain: seed.domain,
      capability: seed.capability,
      claim: seed.claim,
      normalizedStatement: seed.statement,
      source: {
        sourceId:
          profileId === "profile_python_backend"
            ? "src_synthetic_python_backend"
            : "src_synthetic_typescript_product",
        sourceKind: "synthetic_fixture",
        repositoryAlias: `repo_${String((index % 4) + 1).padStart(2, "0")}`,
        relativePath: `history/event-${ordinal}.md`,
        revision: `synthetic-${ordinal}`,
        lineRange: { start: 1, end: 4 },
        contentDigest: `sha256:${digest}`
      },
      timestamps: {
        observedAt: "2026-06-09T00:00:00.000Z",
        firstSeenAt: "2025-01-01T00:00:00.000Z",
        lastSeenAt: "2026-06-01T00:00:00.000Z"
      },
      confidence: Math.min(seed.confidence + (index % 3) * 0.01, 0.99),
      frequency: 1 + (index % 5),
      recencyWeight: seed.type === "stale" ? 0.2 : 0.85,
      sensitivity: seed.type === "unsafe" ? "secret" : "private",
      containsSecret: seed.containsSecret ?? false,
      promptInjectionRisk: seed.promptInjectionRisk ?? "none",
      uploadEligible: seed.type !== "unsafe" && !(seed.containsSecret ?? false),
      conflictsWith: seed.type === "conflicted" && index > 0 ? [`ev_${profileId}_${String(index).padStart(3, "0")}`] : [],
      supersedes: seed.type === "stale" ? [] : seed.supersedes ?? [],
      tags: seed.tags,
      rawExcerptLocalRef: `local://synthetic/${profileId}/${ordinal}`,
      createdBy: { method: "deterministic", compilerVersion: "0.1.0" }
    });
  }
  return records;
}

export function normalizeSyntheticEvidence(profileId: string): EvidenceRecord[] {
  if (profileId === "profile_python_backend") {
    return expandSeeds(profileId, pythonSeeds);
  }
  if (profileId === "profile_typescript_product") {
    return expandSeeds(profileId, tsSeeds);
  }
  throw new Error(`Unknown synthetic profile: ${profileId}`);
}

export function buildEvidenceGraph(records: EvidenceRecord[]): EvidenceGraph {
  const profileId = records[0]?.developerProfileId ?? "profile_unknown";
  const nodes = new Map<string, { id: string; kind: string; label: string }>();
  nodes.set(profileId, { id: profileId, kind: "DeveloperProfile", label: profileId });
  for (const record of records) {
    const capabilityId = `capability:${record.capability}`;
    nodes.set(capabilityId, { id: capabilityId, kind: "Capability", label: record.capability });
  }
  const edges = records.map((record) => ({
    from: profileId,
    to: `capability:${record.capability}`,
    kind: record.evidenceType === "preferred" ? "prefers" : record.evidenceType,
    evidenceRefs: [record.id],
    confidence: record.confidence
  }));
  return { nodes: [...nodes.values()], edges };
}
