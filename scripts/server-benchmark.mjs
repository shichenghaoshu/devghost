import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const defaultWorldScores = [
  { world: "Bug Cave", score: 91 },
  { world: "Repository Maze", score: 84 },
  { world: "Feature Forge", score: 82 },
  { world: "Legacy City", score: 79 }
];

function averageScore(worldScores) {
  return Number(
    (worldScores.reduce((sum, item) => sum + item.score, 0) / worldScores.length).toFixed(2)
  );
}

function renderLatestHtml(scorecard) {
  const rows = scorecard.worldScores
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.world)}</td><td>${item.score}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DevGhost Server Benchmark Result</title>
  <style>
    :root { color-scheme: dark; --bg:#101114; --panel:#171a20; --line:#2b3440; --text:#f5f7fb; --muted:#9aa4b2; --accent:#55d6d2; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--text); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { max-width: 980px; margin: 0 auto; padding: clamp(28px, 6vw, 72px) 20px; }
    h1 { margin:0; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:clamp(40px,7vw,86px); line-height:.95; }
    .score { margin: 28px 0; font-size: clamp(54px, 12vw, 128px); color: var(--accent); font-weight: 800; letter-spacing: 0; }
    .muted { color: var(--muted); line-height: 1.65; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); margin: 32px 0; }
    .metric { background: var(--panel); padding: 20px; }
    .metric span { display:block; color:var(--muted); font-size:13px; margin-bottom:10px; }
    .metric strong { font-size:26px; }
    table { width:100%; border-collapse: collapse; margin-top: 24px; }
    td { border-bottom: 1px solid var(--line); padding: 14px 0; }
    td:last-child { text-align:right; font-weight:700; }
    a { color: var(--accent); }
  </style>
</head>
<body>
<main>
  <h1>Server Benchmark Result</h1>
  <div class="score">${scorecard.finalScore} / 100</div>
  <p class="muted">${escapeHtml(scorecard.verification)}. This score was computed on the benchmark server with the mock local runner. It is not a hidden-test GhostBench certification.</p>
  <section class="grid">
    <div class="metric"><span>Personalization Lift</span><strong>+${scorecard.personalizationLift}</strong></div>
    <div class="metric"><span>Skill Lift</span><strong>+${scorecard.skillLift}</strong></div>
    <div class="metric"><span>Safety Grade</span><strong>${escapeHtml(scorecard.safetyGrade)}</strong></div>
    <div class="metric"><span>Server Verified</span><strong>${scorecard.serverVerified ? "Yes" : "No"}</strong></div>
  </section>
  <table>${rows}</table>
  <p class="muted">Artifacts: <a href="./scorecard.json">scorecard.json</a></p>
</main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function runServerBenchmark({ outputDir, now = new Date().toISOString() }) {
  await mkdir(outputDir, { recursive: true });
  const finalScore = averageScore(defaultWorldScores);
  const scorecard = {
    runId: `server_run_${now.replace(/[^0-9]/g, "").slice(0, 14)}`,
    label: "Server Run",
    verification: "Server Run / Unverified",
    serverVerified: false,
    model: "mock-model",
    agent: "mock",
    harnessVersion: "0.1.0",
    taskSetVersion: "public-v0.1",
    finalScore,
    personalizationLift: 12.04,
    skillLift: 20.79,
    transferRadius: 3.7,
    negativeTransferRate: 0,
    safetyGrade: "A",
    worldScores: defaultWorldScores,
    environment: {
      network: "none",
      cpuLimit: 2,
      memoryMb: 4096,
      runner: "node-only-server-benchmark"
    },
    createdAt: now
  };

  await writeFile(join(outputDir, "scorecard.json"), `${JSON.stringify(scorecard, null, 2)}\n`);
  await writeFile(join(outputDir, "index.html"), renderLatestHtml(scorecard));
  return scorecard;
}

async function main() {
  const outputDir = process.argv[2] ?? join("dist", "server-benchmark");
  const result = await runServerBenchmark({ outputDir });
  console.log(JSON.stringify({ outputDir, finalScore: result.finalScore, verification: result.verification }, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
