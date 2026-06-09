import { z } from "zod";

export const discoveryStateSchema = z.enum(["discovered", "authorized", "scanned", "excluded", "blocked"]);
export const authorizationStateSchema = z.enum(["pending", "authorized", "denied"]);
export const sourceKindSchema = z.enum([
  "codex_memory",
  "codex_agents_md",
  "codex_skill",
  "claude_memory",
  "claude_md",
  "claude_rule",
  "claude_skill",
  "git_repository",
  "git_commit",
  "git_diff",
  "test_log",
  "manual_file",
  "synthetic_fixture"
]);

export const sourceDescriptorSchema = z.object({
  id: z.string().min(1),
  kind: sourceKindSchema,
  displayName: z.string().min(1),
  path: z.string().min(1),
  discoveryState: discoveryStateSchema,
  authorizationState: authorizationStateSchema,
  contentRead: z.boolean(),
  estimatedFileCount: z.number().int().nonnegative(),
  estimatedBytes: z.number().int().nonnegative(),
  repositoryId: z.string().nullable(),
  platform: z.string().min(1),
  sensitivity: z.enum(["unknown", "public", "private", "secret"]),
  discoveredAt: z.string().datetime()
});

export const evidenceTypeSchema = z.enum([
  "demonstrated",
  "inferred",
  "preferred",
  "aspirational",
  "negative",
  "stale",
  "conflicted",
  "unsafe"
]);

export const evidenceRecordSchema = z.object({
  id: z.string().min(1),
  developerProfileId: z.string().min(1),
  evidenceType: evidenceTypeSchema,
  domain: z.string().min(1),
  capability: z.string().min(1),
  claim: z.string().min(1),
  normalizedStatement: z.string().min(1),
  source: z.object({
    sourceId: z.string().min(1),
    sourceKind: sourceKindSchema,
    repositoryAlias: z.string().nullable(),
    relativePath: z.string().min(1),
    revision: z.string().nullable(),
    lineRange: z.object({ start: z.number().int().positive(), end: z.number().int().positive() }),
    contentDigest: z.string().min(1)
  }),
  timestamps: z.object({
    observedAt: z.string().datetime(),
    firstSeenAt: z.string().datetime(),
    lastSeenAt: z.string().datetime()
  }),
  confidence: z.number().min(0).max(1),
  frequency: z.number().int().nonnegative(),
  recencyWeight: z.number().min(0).max(1),
  sensitivity: z.enum(["public", "private", "secret"]),
  containsSecret: z.boolean(),
  promptInjectionRisk: z.enum(["none", "low", "medium", "high"]),
  uploadEligible: z.boolean(),
  conflictsWith: z.array(z.string()),
  supersedes: z.array(z.string()),
  tags: z.array(z.string()),
  rawExcerptLocalRef: z.string().min(1),
  createdBy: z.object({
    method: z.enum(["deterministic", "llm", "manual"]),
    compilerVersion: z.string().min(1)
  })
});

export const skillIrSchema = z.object({
  schema_version: z.literal("1.0"),
  profile_id: z.string().min(1),
  compiler: z.object({ name: z.string().min(1), version: z.string().min(1) }),
  token_budget: z.number().int().positive(),
  identity: z.object({
    primary_domains: z.array(z.string()).min(1),
    secondary_domains: z.array(z.string())
  }),
  workflows: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      trigger: z.object({ include: z.array(z.string()), exclude: z.array(z.string()) }),
      procedure: z.array(z.string()).min(1),
      constraints: z.array(z.string()),
      evidence_refs: z.array(z.string()).min(1),
      confidence: z.number().min(0).max(1)
    })
  ),
  preferences: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string().min(1),
      scope: z.string().min(1),
      confidence: z.number().min(0).max(1),
      evidence_refs: z.array(z.string()).min(1)
    })
  ),
  known_pitfalls: z.array(
    z.object({
      id: z.string().min(1),
      statement: z.string().min(1),
      evidence_refs: z.array(z.string()).min(1)
    })
  ),
  stale_items: z.array(
    z.object({
      statement: z.string().min(1),
      superseded_by: z.string().optional(),
      include_in_skill: z.boolean()
    })
  ),
  safety: z.object({
    scripts_allowed: z.boolean(),
    network_required: z.boolean(),
    secret_refs: z.array(z.string())
  })
});

export const skillManifestSchema = z.object({
  schemaVersion: z.literal("1.0"),
  skillId: z.string().min(1),
  profileId: z.string().min(1),
  target: z.enum(["universal", "codex", "claude-code"]),
  compilerName: z.string().min(1),
  compilerVersion: z.string().min(1),
  createdAt: z.string().datetime(),
  skillHash: z.string().startsWith("sha256:"),
  canonicalizationVersion: z.literal("1"),
  tokenCount: z.number().int().nonnegative(),
  fileCount: z.number().int().positive(),
  scriptsIncluded: z.boolean(),
  networkRequired: z.boolean(),
  sourceStatistics: z.object({
    repositories: z.number().int().nonnegative(),
    commits: z.number().int().nonnegative(),
    memoryFiles: z.number().int().nonnegative(),
    evidenceRecords: z.number().int().nonnegative()
  }),
  rawSourceUploaded: z.boolean(),
  redactionReportHash: z.string().startsWith("sha256:"),
  evidenceCoverage: z.record(z.string(), z.number().int().nonnegative())
});

export const scoreConditionSchema = z.enum([
  "vanilla",
  "generic",
  "personalized",
  "cross_user",
  "oracle",
  "full_history"
]);

export type SourceDescriptor = z.infer<typeof sourceDescriptorSchema>;
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;
export type SkillIR = z.infer<typeof skillIrSchema>;
export type SkillManifest = z.infer<typeof skillManifestSchema>;
export type ScoreCondition = z.infer<typeof scoreConditionSchema>;

export interface RedactionFinding {
  type: string;
  sourceAlias: string;
  relativePath: string;
  line: number;
  maskedPreview: string;
  action: "removed" | "review" | "block-upload";
}

export interface PromptInjectionFinding {
  category: string;
  risk: "low" | "medium" | "high";
  excerpt: string;
}

export interface EvidenceGraph {
  nodes: Array<{ id: string; kind: string; label: string }>;
  edges: Array<{
    from: string;
    to: string;
    kind: string;
    evidenceRefs: string[];
    confidence: number;
  }>;
}
