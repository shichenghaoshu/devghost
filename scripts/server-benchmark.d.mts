export interface ServerBenchmarkScorecard {
  runId: string;
  label: "Server Run";
  verification: "Server Run / Unverified";
  serverVerified: boolean;
  model: string;
  agent: string;
  harnessVersion: string;
  taskSetVersion: string;
  finalScore: number;
  personalizationLift: number;
  skillLift: number;
  transferRadius: number;
  negativeTransferRate: number;
  safetyGrade: string;
  worldScores: Array<{ world: string; score: number }>;
  environment: {
    network: string;
    cpuLimit: number;
    memoryMb: number;
    runner: string;
  };
  createdAt: string;
}

export function runServerBenchmark(input: {
  outputDir: string;
  now?: string;
}): Promise<ServerBenchmarkScorecard>;
