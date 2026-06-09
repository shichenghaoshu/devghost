export interface LocalReportData {
  runId: string;
  profileId: string;
  label: "Local Run" | "Verified by GhostBench";
  verification: "Unverified" | "Verified";
  model: string;
  agent: string;
  skillHash: string;
  skillTokenCount: number;
  personalizationLift: number;
  skillLift: number;
  transferRadius: number;
  negativeTransferRate: number;
  safetyGrade: string;
  worldScores: Array<{ world: string; score: number }>;
  evidenceCoverage: Record<string, number>;
  environment: { network: string; cpuLimit: number; memoryMb: number };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sanitize(value: string): string {
  return value
    .replace(/\/Users\/[^\s<"]+/g, "[LOCAL_PATH]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]");
}

export function generateHtmlReport(report: LocalReportData): string {
  const worldRows = report.worldScores
    .map((world) => `<tr><td>${escapeHtml(world.world)}</td><td>${world.score}</td></tr>`)
    .join("");
  const coverage = Object.entries(report.evidenceCoverage)
    .map(([key, value]) => `<li>${escapeHtml(key)}: ${value}</li>`)
    .join("");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DevGhost Local Report</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui; background: #101114; color: #f5f7fb; }
    main { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
    .metric { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
    .box { border: 1px solid #2b3440; padding: 16px; border-radius: 8px; background: #171a20; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    td { border-bottom: 1px solid #2b3440; padding: 10px; }
    .accent { color: #55d6d2; }
  </style>
</head>
<body>
<main>
  <h1>DevGhost Report</h1>
  <p class="accent">${escapeHtml(report.label)} - ${escapeHtml(report.verification)}</p>
  <section class="metric">
    <div class="box">Model<br /><strong>${escapeHtml(report.model)}</strong></div>
    <div class="box">Agent<br /><strong>${escapeHtml(report.agent)}</strong></div>
    <div class="box">Skill Hash<br /><strong>${escapeHtml(report.skillHash.slice(0, 18))}</strong></div>
    <div class="box">Personalization Lift<br /><strong>+${report.personalizationLift}</strong></div>
    <div class="box">Skill Lift<br /><strong>+${report.skillLift}</strong></div>
    <div class="box">Safety Grade<br /><strong>${escapeHtml(report.safetyGrade)}</strong></div>
  </section>
  <h2>World Scores</h2>
  <table>${worldRows}</table>
  <h2>Evidence Coverage</h2>
  <ul>${coverage}</ul>
  <h2>Environment</h2>
  <p>Network: ${escapeHtml(report.environment.network)}; CPU: ${report.environment.cpuLimit}; Memory MB: ${report.environment.memoryMb}</p>
  <p>Level reflects the evaluated DevGhost configuration, not a certification of the human developer.</p>
</main>
</body>
</html>`;
  return sanitize(html);
}

export function generateShareCardSvg(report: LocalReportData): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#101114"/>
  <rect x="48" y="48" width="1104" height="534" rx="8" fill="#171a20" stroke="#55d6d2"/>
  <text x="92" y="130" fill="#55d6d2" font-family="monospace" font-size="34">MY DEVGHOST</text>
  <text x="92" y="200" fill="#f5f7fb" font-family="Arial" font-size="52">SYSTEM MAINTAINER - LV.5</text>
  <text x="92" y="290" fill="#f5f7fb" font-family="Arial" font-size="32">Personalization Lift +${report.personalizationLift}%</text>
  <text x="92" y="350" fill="#f5f7fb" font-family="Arial" font-size="32">Skill Lift +${report.skillLift}%</text>
  <text x="92" y="410" fill="#f5f7fb" font-family="Arial" font-size="32">Transfer Radius ${report.transferRadius}</text>
  <text x="92" y="470" fill="#f5f7fb" font-family="Arial" font-size="32">Safety Grade ${escapeHtml(report.safetyGrade)}</text>
  <text x="92" y="535" fill="#9aa4b2" font-family="Arial" font-size="24">${escapeHtml(report.label)}</text>
</svg>`;
  return sanitize(svg);
}
