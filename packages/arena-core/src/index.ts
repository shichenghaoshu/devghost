import type { ScoreCondition } from "@devghost/contracts";
import { calculateScore, mapLevel } from "@devghost/scoring";

export interface LocalArenaInput {
  agent: "mock" | "codex" | "claude-code";
  conditions: ScoreCondition[];
  profileId: string;
}

export interface ConditionResult {
  condition: ScoreCondition;
  score: number;
}

export interface LocalArenaResult {
  runId: string;
  label: "Local Run";
  verification: "Unverified";
  agent: string;
  model: string;
  profileId: string;
  conditions: ConditionResult[];
  personalizationLift: number;
  skillLift: number;
  level: ReturnType<typeof mapLevel>;
  worldScores: Array<{ world: string; score: number }>;
}

const conditionInputs: Record<string, Parameters<typeof calculateScore>[0]> = {
  vanilla: {
    functionalCorrectness: 0.62,
    regressionProtection: 0.55,
    requirementCompletion: 0.65,
    autonomy: 0.7,
    efficiency: 0.7,
    codeQuality: 0.68,
    safetyPolicy: 1
  },
  generic: {
    functionalCorrectness: 0.72,
    regressionProtection: 0.7,
    requirementCompletion: 0.74,
    autonomy: 0.75,
    efficiency: 0.74,
    codeQuality: 0.72,
    safetyPolicy: 1
  },
  personalized: {
    functionalCorrectness: 0.86,
    regressionProtection: 0.9,
    requirementCompletion: 0.84,
    autonomy: 0.82,
    efficiency: 0.8,
    codeQuality: 0.8,
    safetyPolicy: 1
  }
};

export function runLocalArena(input: LocalArenaInput): LocalArenaResult {
  const conditions = input.conditions.map((condition) => ({
    condition,
    score: calculateScore(conditionInputs[condition] ?? conditionInputs.vanilla!).total
  }));
  const scoreFor = (condition: ScoreCondition): number =>
    conditions.find((result) => result.condition === condition)?.score ?? 0;
  const personalized = scoreFor("personalized");
  const generic = scoreFor("generic");
  const vanilla = scoreFor("vanilla");
  return {
    runId: "run_local_mock_001",
    label: "Local Run",
    verification: "Unverified",
    agent: input.agent,
    model: "mock-model",
    profileId: input.profileId,
    conditions,
    personalizationLift: Number((personalized - generic).toFixed(2)),
    skillLift: Number((personalized - vanilla).toFixed(2)),
    level: mapLevel(personalized),
    worldScores: [
      { world: "Bug Cave", score: 91 },
      { world: "Repository Maze", score: 84 },
      { world: "Feature Forge", score: 82 },
      { world: "Legacy City", score: 79 }
    ]
  };
}
