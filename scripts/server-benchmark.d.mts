export interface ServerBenchmarkScorecard {
  productName: "VibeBenchmark";
  runId: string;
  label: "Server Run";
  verification: "Server Run / Unverified";
  serverVerified: boolean;
  model: string;
  agent: string;
  harnessVersion: string;
  taskSetVersion: string;
  overallScore: number;
  finalScore: number;
  personalizationLift: number;
  skillLift: number;
  transferRadius: number;
  negativeTransferRate: number;
  safetyGrade: string;
  scoreBreakdown: Array<{ track: "ACM" | "Engineering"; world: string; description: string; score: number }>;
  worldScores: Array<{ track: "ACM" | "Engineering"; world: string; description: string; score: number }>;
  leaderboard: Array<{ rank: number; name: string; github: string; score: number; title: string }>;
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
