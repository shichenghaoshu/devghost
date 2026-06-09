export interface DevGhostConfig {
  scanner: {
    maxFileBytes: number;
    maxCommitsPerRepo: number;
    defaultMonths: number;
    followSymlinks: boolean;
  };
  compiler: {
    type: "deterministic" | "llm";
    tokenBudget: number;
    maxChildSkills: number;
  };
  privacy: {
    uploadRawSources: false;
    redactEmails: boolean;
    redactPaths: boolean;
  };
  arena: {
    network: "none" | "limited";
    defaultAgent: "mock" | "codex" | "claude-code";
    repetitions: number;
  };
}

export const defaultConfig: DevGhostConfig = {
  scanner: {
    maxFileBytes: 2_097_152,
    maxCommitsPerRepo: 500,
    defaultMonths: 24,
    followSymlinks: false
  },
  compiler: {
    type: "deterministic",
    tokenBudget: 4000,
    maxChildSkills: 3
  },
  privacy: {
    uploadRawSources: false,
    redactEmails: true,
    redactPaths: true
  },
  arena: {
    network: "none",
    defaultAgent: "mock",
    repetitions: 1
  }
};

export const defaultDenylist = [
  ".ssh",
  ".gnupg",
  ".aws",
  ".azure",
  ".config/gcloud",
  ".kube",
  "node_modules",
  ".venv",
  "venv",
  "dist",
  "build",
  "target",
  ".git/objects"
] as const;

export function assertSafeRelativePath(input: string): string {
  if (input.includes("\u0000")) {
    throw new Error("Unsafe path: null byte is not allowed");
  }
  const normalized = input.replaceAll("\\", "/");
  if (normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized)) {
    throw new Error("Unsafe path: absolute paths are not allowed");
  }
  const parts = normalized.split("/");
  if (parts.includes("..")) {
    throw new Error("Unsafe path: path traversal is not allowed");
  }
  if (parts.some((part) => part.length === 0 || part === ".")) {
    throw new Error("Unsafe path: empty or current-directory segments are not allowed");
  }
  return normalized;
}
