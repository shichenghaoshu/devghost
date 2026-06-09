export interface ScoreInputs {
  functionalCorrectness: number;
  regressionProtection: number;
  requirementCompletion: number;
  autonomy: number;
  efficiency: number;
  codeQuality: number;
  safetyPolicy: number;
}

export interface TaskScore {
  total: number;
  weightsTotal: number;
  parts: Record<keyof ScoreInputs, number>;
}

const weights: Record<keyof ScoreInputs, number> = {
  functionalCorrectness: 45,
  regressionProtection: 15,
  requirementCompletion: 10,
  autonomy: 10,
  efficiency: 8,
  codeQuality: 7,
  safetyPolicy: 5
};

export function calculateScore(inputs: ScoreInputs): TaskScore {
  const parts = Object.fromEntries(
    Object.entries(weights).map(([key, weight]) => {
      const inputKey = key as keyof ScoreInputs;
      return [inputKey, Number((inputs[inputKey] * weight).toFixed(2))];
    })
  ) as Record<keyof ScoreInputs, number>;
  const total = Number(Object.values(parts).reduce((sum, value) => sum + value, 0).toFixed(2));
  const weightsTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return { total, weightsTotal, parts };
}

export interface DevGhostLevel {
  level: number;
  label: string;
  minScore: number;
  disclaimer: string;
}

const levels: DevGhostLevel[] = [
  { level: 1, label: "Script Rookie", minScore: 0, disclaimer: "Level reflects the evaluated DevGhost configuration, not a certification of the human developer." },
  { level: 2, label: "Bug Hunter", minScore: 45, disclaimer: "Level reflects the evaluated DevGhost configuration, not a certification of the human developer." },
  { level: 3, label: "Repo Explorer", minScore: 60, disclaimer: "Level reflects the evaluated DevGhost configuration, not a certification of the human developer." },
  { level: 4, label: "Feature Builder", minScore: 72, disclaimer: "Level reflects the evaluated DevGhost configuration, not a certification of the human developer." },
  { level: 5, label: "System Maintainer", minScore: 82, disclaimer: "Level reflects the evaluated DevGhost configuration, not a certification of the human developer." },
  { level: 6, label: "Architecture Operator", minScore: 90, disclaimer: "Level reflects the evaluated DevGhost configuration, not a certification of the human developer." },
  { level: 7, label: "Autonomous Engineer", minScore: 96, disclaimer: "Level reflects the evaluated DevGhost configuration, not a certification of the human developer." }
];

export function mapLevel(score: number): DevGhostLevel {
  return [...levels].reverse().find((level) => score >= level.minScore) ?? levels[0]!;
}
