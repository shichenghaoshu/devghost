import type { SourceDescriptor } from "@devghost/contracts";

export function discoverSyntheticSources(discoveredAt = new Date().toISOString()): SourceDescriptor[] {
  return [
    {
      id: "src_synthetic_python_backend",
      kind: "synthetic_fixture",
      displayName: "Synthetic Profile A: Python Backend Regression Engineer",
      path: "datasets/profiles/python-backend-regression-engineer.json",
      discoveryState: "discovered",
      authorizationState: "pending",
      contentRead: false,
      estimatedFileCount: 1,
      estimatedBytes: 24_000,
      repositoryId: null,
      platform: "synthetic",
      sensitivity: "private",
      discoveredAt
    },
    {
      id: "src_synthetic_typescript_product",
      kind: "synthetic_fixture",
      displayName: "Synthetic Profile B: TypeScript Product Engineer",
      path: "datasets/profiles/typescript-product-engineer.json",
      discoveryState: "discovered",
      authorizationState: "pending",
      contentRead: false,
      estimatedFileCount: 1,
      estimatedBytes: 24_000,
      repositoryId: null,
      platform: "synthetic",
      sensitivity: "private",
      discoveredAt
    }
  ];
}

export function authorizeSources(
  sources: SourceDescriptor[],
  authorizedSourceIds: string[]
): SourceDescriptor[] {
  const authorized = new Set(authorizedSourceIds);
  return sources
    .filter((source) => authorized.has(source.id))
    .map((source) => ({
      ...source,
      discoveryState: "authorized" as const,
      authorizationState: "authorized" as const,
      contentRead: true
    }));
}

export function discoverCodexMetadata(discoveredAt = new Date().toISOString()): SourceDescriptor[] {
  return [
    {
      id: "src_codex_default_memories",
      kind: "codex_memory",
      displayName: "Codex memories",
      path: "${CODEX_HOME:-~/.codex}/memories",
      discoveryState: "discovered",
      authorizationState: "pending",
      contentRead: false,
      estimatedFileCount: 0,
      estimatedBytes: 0,
      repositoryId: null,
      platform: "codex",
      sensitivity: "unknown",
      discoveredAt
    }
  ];
}

export function discoverClaudeMetadata(discoveredAt = new Date().toISOString()): SourceDescriptor[] {
  return [
    {
      id: "src_claude_projects",
      kind: "claude_memory",
      displayName: "Claude Code project memories",
      path: "~/.claude/projects/*/memory",
      discoveryState: "discovered",
      authorizationState: "pending",
      contentRead: false,
      estimatedFileCount: 0,
      estimatedBytes: 0,
      repositoryId: null,
      platform: "claude-code",
      sensitivity: "unknown",
      discoveredAt
    }
  ];
}
