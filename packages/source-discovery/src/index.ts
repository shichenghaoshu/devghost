import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { SourceDescriptor } from "@devghost/contracts";

export interface LocalAccountDiscoveryInput {
  homeDir: string;
  cwd: string;
  discoveredAt?: string;
}

async function countFilesAndBytes(root: string): Promise<{ fileCount: number; bytes: number }> {
  try {
    const rootStat = await stat(root);
    if (!rootStat.isDirectory()) {
      return { fileCount: 0, bytes: 0 };
    }
  } catch {
    return { fileCount: 0, bytes: 0 };
  }

  let fileCount = 0;
  let bytes = 0;
  const pending = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === undefined) {
      continue;
    }
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
        continue;
      }
      if (entry.isFile()) {
        const fileStat = await stat(fullPath);
        fileCount += 1;
        bytes += fileStat.size;
      }
    }
  }
  return { fileCount, bytes };
}

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

export async function discoverLocalAccountSources(
  input: LocalAccountDiscoveryInput
): Promise<SourceDescriptor[]> {
  const discoveredAt = input.discoveredAt ?? new Date().toISOString();
  const codexPath = join(input.homeDir, ".codex", "memories");
  const claudePath = join(input.homeDir, ".claude", "projects");
  const gitPath = input.cwd;
  const [codex, claude, git] = await Promise.all([
    countFilesAndBytes(codexPath),
    countFilesAndBytes(claudePath),
    countFilesAndBytes(join(gitPath, ".git"))
  ]);

  return [
    {
      id: "src_local_codex_memories",
      kind: "codex_memory",
      displayName: "Local Codex memories",
      path: "~/.codex/memories",
      discoveryState: codex.fileCount > 0 ? "discovered" : "excluded",
      authorizationState: "pending",
      contentRead: false,
      estimatedFileCount: codex.fileCount,
      estimatedBytes: codex.bytes,
      repositoryId: null,
      platform: "codex",
      sensitivity: "private",
      discoveredAt
    },
    {
      id: "src_local_claude_projects",
      kind: "claude_memory",
      displayName: "Local Claude Code projects",
      path: "~/.claude/projects",
      discoveryState: claude.fileCount > 0 ? "discovered" : "excluded",
      authorizationState: "pending",
      contentRead: false,
      estimatedFileCount: claude.fileCount,
      estimatedBytes: claude.bytes,
      repositoryId: null,
      platform: "claude-code",
      sensitivity: "private",
      discoveredAt
    },
    {
      id: "src_local_git_repository",
      kind: "git_repository",
      displayName: "Current Git repository",
      path: "repo_current",
      discoveryState: git.fileCount > 0 ? "discovered" : "excluded",
      authorizationState: "pending",
      contentRead: false,
      estimatedFileCount: git.fileCount,
      estimatedBytes: git.bytes,
      repositoryId: "repo_current",
      platform: "git",
      sensitivity: "private",
      discoveredAt
    }
  ];
}
