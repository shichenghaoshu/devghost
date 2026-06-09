import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const scoreBreakdown = [
  {
    track: "ACM",
    world: "递归煎饼摊",
    description: "递归、边界条件、复杂度估算。看 agent 会不会把 O(n log n) 炒成糊。",
    score: 88
  },
  {
    track: "ACM",
    world: "并查集相亲角",
    description: "集合合并、路径压缩、反直觉样例。重点考察抽象能力。",
    score: 83
  },
  {
    track: "ACM",
    world: "动态规划修脚店",
    description: "状态定义、转移方程、空间压缩。拒绝玄学 if-else。",
    score: 80
  },
  {
    track: "ACM",
    world: "贪心小卖部找零危机",
    description: "贪心证明、反例识别、测试覆盖。便宜但不能乱找。",
    score: 85
  },
  {
    track: "Engineering",
    world: "祖传屎山考古局",
    description: "多文件调用链、最小补丁、回归测试。别把文物拆成废墟。",
    score: 84
  },
  {
    track: "Engineering",
    world: "凌晨三点线上锅炉房",
    description: "故障定位、日志判断、安全回滚。先止血，再解释人生。",
    score: 82
  },
  {
    track: "Engineering",
    world: "产品经理许愿池",
    description: "小功能交付、兼容性、文档同步。愿望可以实现，接口不能爆炸。",
    score: 86
  },
  {
    track: "Engineering",
    world: "依赖升级打地鼠",
    description: "老依赖迁移、锁文件审计、测试矩阵。升一个，冒三个。",
    score: 84
  }
];

const leaderboardSeed = [
  {
    rank: 1,
    name: "NullPointer仙人",
    github: "null-pointer-sage",
    score: 91,
    title: "边界条件法师"
  },
  {
    rank: 2,
    name: "咖啡因编译器",
    github: "caffeine-compiler",
    score: 88,
    title: "凌晨锅炉守夜人"
  },
  {
    rank: 3,
    name: "你",
    github: "local-server-run",
    score: 84,
    title: "祖传项目保安"
  },
  {
    rank: 4,
    name: "递归鸳鸯锅",
    github: "recursive-hotpot",
    score: 79,
    title: "DP 修脚学徒"
  }
];

function averageScore(items) {
  return Number(
    (items.reduce((sum, item) => sum + item.score, 0) / items.length).toFixed(2)
  );
}

function renderLatestHtml(scorecard) {
  const rows = scorecard.scoreBreakdown
    .map(
      (item) =>
        `<tr><td><strong>${escapeHtml(item.world)}</strong><br /><span>${escapeHtml(item.track)} · ${escapeHtml(item.description)}</span></td><td>${item.score}</td></tr>`
    )
    .join("");
  const leaderboardRows = scorecard.leaderboard
    .map(
      (item) =>
        `<tr><td>${item.rank}</td><td><strong>${escapeHtml(item.name)}</strong><br /><span>@${escapeHtml(item.github)} · ${escapeHtml(item.title)}</span></td><td>${item.score}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VibeBenchmark</title>
  <style>
    :root { color-scheme: dark; --bg:#101114; --panel:#171a20; --line:#2b3440; --text:#f5f7fb; --muted:#9aa4b2; --accent:#55d6d2; --warn:#f6d365; }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--bg); color:var(--text); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    main { max-width: 1060px; margin: 0 auto; padding: clamp(28px, 6vw, 72px) 20px; }
    h1 { margin:0; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:clamp(42px,7vw,92px); line-height:.95; }
    h2 { margin-top: 44px; }
    .score { margin: 28px 0; font-size: clamp(54px, 12vw, 128px); color: var(--accent); font-weight: 800; letter-spacing: 0; }
    .muted { color: var(--muted); line-height: 1.65; }
    .tag { color: var(--warn); font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); margin: 32px 0; }
    .metric { background: var(--panel); padding: 20px; }
    .metric span { display:block; color:var(--muted); font-size:13px; margin-bottom:10px; }
    .metric strong { font-size:26px; }
    details { border-top:1px solid var(--line); border-bottom:1px solid var(--line); padding: 18px 0; margin: 28px 0; }
    summary { cursor:pointer; color:var(--accent); font-weight:800; }
    table { width:100%; border-collapse: collapse; margin-top: 24px; }
    td { border-bottom: 1px solid var(--line); padding: 14px 0; }
    td:last-child { text-align:right; font-weight:700; }
    td span { color: var(--muted); font-size: 14px; }
    .gate { border:1px solid var(--line); background:var(--panel); padding:20px; border-radius:8px; margin-top: 22px; }
    label { display:block; color:var(--muted); font-size:14px; margin: 12px 0 6px; }
    input { width:100%; background:#0b0d10; color:var(--text); border:1px solid var(--line); border-radius:6px; padding:12px; }
    button { margin-top:14px; border:1px solid var(--accent); background:var(--accent); color:#071010; border-radius:6px; padding:12px 14px; font-weight:800; cursor:pointer; }
    button.secondary { background:transparent; color:var(--text); border-color:var(--line); margin-left: 8px; }
    .notice { margin-top: 12px; color: var(--warn); min-height: 24px; }
    a { color: var(--accent); }
  </style>
</head>
<body>
<main>
  <p class="tag">vibebenchmark · ACM x 工程情境</p>
  <h1>VibeBenchmark</h1>
  <div class="score">${scorecard.overallScore} / 100</div>
  <p class="muted">综合评分只显示一个数。点开细则后再看 ACM 传统题、工程事故题、个性化提升和安全边界。${escapeHtml(scorecard.verification)}，不是隐藏测试认证榜。</p>
  <section class="grid">
    <div class="metric"><span>Personalization Lift</span><strong>+${scorecard.personalizationLift}</strong></div>
    <div class="metric"><span>Skill Lift</span><strong>+${scorecard.skillLift}</strong></div>
    <div class="metric"><span>Safety Grade</span><strong>${escapeHtml(scorecard.safetyGrade)}</strong></div>
    <div class="metric"><span>Server Verified</span><strong>${scorecard.serverVerified ? "Yes" : "No"}</strong></div>
  </section>

  <details>
    <summary>展开细化分数和 benchmark 细则</summary>
    <table>${rows}</table>
  </details>

  <h2>VibeLeaderboard</h2>
  <p class="muted">每个人都可以跑自己的 vibebenchmark。上传前需要 GitHub 身份和展示名；当前静态版先在浏览器本地追加，接后端后会写入正式榜单。</p>
  <table id="leaderboard"><tbody>${leaderboardRows}</tbody></table>

  <section class="gate" data-requires="github-login-and-name">
    <h2>上传我的 VibeBenchmark</h2>
    <p class="muted">先用 GitHub 登录，再输入你的名字。没有完成这两步，上传按钮不会通过。</p>
    <button type="button" id="github-login">用 GitHub 登录</button>
    <button type="button" class="secondary" id="clear-login">清除本地身份</button>
    <label for="display-name">你的名字</label>
    <input id="display-name" autocomplete="name" placeholder="例如：凌晨修 bug 的阿强" />
    <label for="github-handle">GitHub 用户名</label>
    <input id="github-handle" autocomplete="username" placeholder="例如：octocat" />
    <button type="button" id="submit-score">上传到本地榜单</button>
    <div class="notice" id="notice"></div>
  </section>

  <p class="muted">Artifacts: <a href="./scorecard.json">scorecard.json</a></p>
</main>
<script>
  const scorecard = ${JSON.stringify({
    overallScore: scorecard.overallScore,
    title: "本地榜单挑战者"
  })};
  const loginButton = document.getElementById("github-login");
  const clearButton = document.getElementById("clear-login");
  const submitButton = document.getElementById("submit-score");
  const nameInput = document.getElementById("display-name");
  const githubInput = document.getElementById("github-handle");
  const notice = document.getElementById("notice");
  const table = document.querySelector("#leaderboard tbody");

  function renderLocalEntries() {
    const entries = JSON.parse(localStorage.getItem("vibebenchmark.entries") || "[]");
    for (const row of document.querySelectorAll("[data-local-entry='true']")) row.remove();
    entries.forEach((entry, index) => {
      const tr = document.createElement("tr");
      tr.dataset.localEntry = "true";
      tr.innerHTML = "<td>local-" + (index + 1) + "</td><td><strong>" + escapeHtml(entry.name) + "</strong><br /><span>@" + escapeHtml(entry.github) + " · " + escapeHtml(entry.title) + "</span></td><td>" + entry.score + "</td>";
      table.appendChild(tr);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  loginButton.addEventListener("click", () => {
    localStorage.setItem("vibebenchmark.githubLogin", "demo");
    notice.textContent = "GitHub 登录 gate 已通过（静态演示）。正式版会跳转 GitHub OAuth。";
  });

  clearButton.addEventListener("click", () => {
    localStorage.removeItem("vibebenchmark.githubLogin");
    notice.textContent = "已清除本地 GitHub 登录状态。";
  });

  submitButton.addEventListener("click", () => {
    const loggedIn = localStorage.getItem("vibebenchmark.githubLogin") === "demo";
    const name = nameInput.value.trim();
    const github = githubInput.value.trim().replace(/^@/, "");
    if (!loggedIn) {
      notice.textContent = "请先用 GitHub 登录。";
      return;
    }
    if (!name || !github) {
      notice.textContent = "请填写你的名字和 GitHub 用户名。";
      return;
    }
    const entries = JSON.parse(localStorage.getItem("vibebenchmark.entries") || "[]");
    entries.push({ name, github, score: scorecard.overallScore, title: scorecard.title });
    localStorage.setItem("vibebenchmark.entries", JSON.stringify(entries));
    notice.textContent = "已加入本地 VibeLeaderboard。";
    renderLocalEntries();
  });

  renderLocalEntries();
</script>
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
  const overallScore = averageScore(scoreBreakdown);
  const scorecard = {
    productName: "VibeBenchmark",
    runId: `server_run_${now.replace(/[^0-9]/g, "").slice(0, 14)}`,
    label: "Server Run",
    verification: "Server Run / Unverified",
    serverVerified: false,
    model: "mock-model",
    agent: "mock",
    harnessVersion: "0.1.0",
    taskSetVersion: "public-v0.1",
    overallScore,
    finalScore: overallScore,
    personalizationLift: 12.04,
    skillLift: 20.79,
    transferRadius: 3.7,
    negativeTransferRate: 0,
    safetyGrade: "A",
    scoreBreakdown,
    worldScores: scoreBreakdown,
    leaderboard: leaderboardSeed,
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
  console.log(JSON.stringify({ outputDir, overallScore: result.overallScore, verification: result.verification }, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
