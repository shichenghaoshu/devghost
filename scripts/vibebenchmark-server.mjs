import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { URL } from "node:url";

const scoreBreakdown = [
  [
    "ACM",
    "递归煎饼摊",
    "递归、边界条件、复杂度估算。看 agent 会不会把 O(n log n) 炒成糊。",
    88,
  ],
  [
    "ACM",
    "并查集相亲角",
    "集合合并、路径压缩、反直觉样例。重点考察抽象能力。",
    83,
  ],
  [
    "ACM",
    "动态规划修脚店",
    "状态定义、转移方程、空间压缩。拒绝玄学 if-else。",
    80,
  ],
  [
    "ACM",
    "贪心小卖部找零危机",
    "贪心证明、反例识别、测试覆盖。便宜但不能乱找。",
    85,
  ],
  [
    "Engineering",
    "祖传屎山考古局",
    "多文件调用链、最小补丁、回归测试。别把文物拆成废墟。",
    84,
  ],
  [
    "Engineering",
    "凌晨三点线上锅炉房",
    "故障定位、日志判断、安全回滚。先止血，再解释人生。",
    82,
  ],
  [
    "Engineering",
    "产品经理许愿池",
    "小功能交付、兼容性、文档同步。愿望可以实现，接口不能爆炸。",
    86,
  ],
  [
    "Engineering",
    "依赖升级打地鼠",
    "老依赖迁移、锁文件审计、测试矩阵。升一个，冒三个。",
    84,
  ],
].map(([track, world, description, score]) => ({
  track,
  world,
  description,
  score,
}));

const seedLeaderboard = [
  {
    name: "NullPointer仙人",
    github: "null-pointer-sage",
    score: 91,
    title: "边界条件法师",
  },
  {
    name: "咖啡因编译器",
    github: "caffeine-compiler",
    score: 88,
    title: "凌晨锅炉守夜人",
  },
  {
    name: "递归鸳鸯锅",
    github: "recursive-hotpot",
    score: 79,
    title: "DP 修脚学徒",
  },
];

function average(items) {
  return Number(
    (items.reduce((sum, item) => sum + item.score, 0) / items.length).toFixed(
      2,
    ),
  );
}

function buildScorecard(now = new Date().toISOString()) {
  const overallScore = average(scoreBreakdown);
  return {
    productName: "VibeBenchmark",
    runId: `server_run_${now.replace(/[^0-9]/g, "").slice(0, 14)}`,
    label: "Server Run",
    verification: "Server Run / Unverified",
    serverVerified: false,
    model: "mock-model",
    agent: "mock",
    harnessVersion: "0.1.0",
    taskSetVersion: "public-v0.2",
    overallScore,
    finalScore: overallScore,
    personalizationLift: 12.04,
    skillLift: 20.79,
    transferRadius: 3.7,
    negativeTransferRate: 0,
    safetyGrade: "A",
    scoreBreakdown,
    worldScores: scoreBreakdown,
    environment: {
      network: "none",
      cpuLimit: 2,
      memoryMb: 4096,
      runner: "vibebenchmark-server",
    },
    createdAt: now,
  };
}

function b64url(input) {
  return Buffer.from(input).toString("base64url");
}

function fromB64url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function signSessionCookie(session, secret) {
  const payload = b64url(JSON.stringify(session));
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifySessionCookie(cookieValue, secret) {
  if (!cookieValue || !cookieValue.includes(".")) {
    return null;
  }
  const [payload, signature] = cookieValue.split(".");
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    return JSON.parse(fromB64url(payload));
  } catch {
    return null;
  }
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [
          part.slice(0, index),
          decodeURIComponent(part.slice(index + 1)),
        ];
      }),
  );
}

function writeJson(res, status, value, headers = {}) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers,
  });
  res.end(`${JSON.stringify(value, null, 2)}\n`);
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, { location, ...headers });
  res.end();
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function readLeaderboard(dataDir) {
  try {
    const data = JSON.parse(
      await readFile(join(dataDir, "leaderboard.json"), "utf8"),
    );
    return Array.isArray(data.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

async function writeLeaderboard(dataDir, entries) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    join(dataDir, "leaderboard.json"),
    `${JSON.stringify({ entries }, null, 2)}\n`,
  );
}

function rankedEntries(entries) {
  return [...seedLeaderboard, ...entries]
    .sort(
      (left, right) =>
        right.score - left.score || left.name.localeCompare(right.name),
    )
    .map((entry, index) => ({ rank: index + 1, ...entry }));
}

function sanitizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 40);
}

function titleFor(score) {
  if (score >= 90) return "Vibe 仙人";
  if (score >= 84) return "祖传项目保安";
  if (score >= 75) return "能跑就行工程师";
  return "递归入门摊主";
}

function renderPage({
  scorecard,
  leaderboard,
  session,
  oauthConfigured,
  basePath,
}) {
  const canRun = Boolean(session);
  const breakdownRows = scorecard.scoreBreakdown
    .map(
      (item) =>
        `<tr><td><strong>${escapeHtml(item.world)}</strong><br><span>${escapeHtml(item.track)} · ${escapeHtml(item.description)}</span></td><td>${item.score}</td></tr>`,
    )
    .join("");
  const leaderboardRows = leaderboard
    .map(
      (item) =>
        `<tr><td>${item.rank}</td><td><strong>${escapeHtml(item.name)}</strong><br><span>@${escapeHtml(item.github)} · ${escapeHtml(item.title)}</span></td><td>${item.score}</td></tr>`,
    )
    .join("");
  const sessionText = session
    ? `GitHub @${escapeHtml(session.githubLogin)} 已连接，可以填写名字跑分。`
    : "请先完成 GitHub OAuth 登录，再填写名字并上传成绩。";
  const statusLabel = session
    ? `已登录 @${escapeHtml(session.githubLogin)}`
    : "GitHub 未登录";
  const oauthNotice = oauthConfigured
    ? ""
    : `<p class="warning">服务器尚未配置 GitHub OAuth Client ID/Secret；授权码流程已接通，填入密钥后即可正式登录。</p>`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VibeBenchmark</title>
  <style>
    :root { color-scheme: light; --bg:#ffffff; --soft:#f3fbff; --paper:#ffffff; --ink:#172033; --muted:#607087; --line:#dbe7f1; --accent:#0f9f8f; --blue:#2563eb; --sun:#ffd166; --danger:#b42318; --ok:#0f7b4a; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); background:linear-gradient(180deg,#fff 0%,#f3fbff 47%,#f6fff9 100%); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    body::before { content:""; position:fixed; inset:0; pointer-events:none; background-image:linear-gradient(rgba(37,99,235,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(15,159,143,.07) 1px,transparent 1px); background-size:40px 40px; mask-image:linear-gradient(180deg,#000 0%,transparent 78%); }
    main { position:relative; max-width:1120px; margin:0 auto; padding:24px 20px 70px; }
    h1 { margin:0; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:clamp(44px,6.1vw,78px); line-height:.96; letter-spacing:0; overflow-wrap:anywhere; }
    h2 { margin:0 0 14px; font-size:28px; }
    p { line-height:1.7; }
    .site-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:56px; }
    .brand { display:flex; align-items:center; gap:10px; font-weight:900; }
    .brand-mark { display:grid; place-items:center; width:34px; height:34px; border-radius:8px; background:var(--ink); color:#fff; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:13px; }
    .hero { min-height:56svh; display:grid; grid-template-columns:minmax(0,1fr) minmax(300px,424px); align-items:center; gap:34px; }
    .score-card { border:1px solid var(--line); border-radius:8px; background:rgba(255,255,255,.9); box-shadow:0 24px 80px rgba(37,99,235,.12); padding:24px; }
    .score-label { color:var(--muted); font-weight:800; font-size:14px; }
    .score { color:var(--accent); font-size:clamp(74px,12vw,136px); font-weight:950; letter-spacing:0; margin:4px 0 0; }
    .score-unit { color:var(--muted); font-weight:900; margin-top:-8px; }
    .muted { color:var(--muted); max-width:760px; }
    .status { display:inline-flex; align-items:center; gap:8px; margin-top:22px; padding:8px 10px; border:1px solid var(--line); border-radius:999px; color:var(--muted); font-weight:800; font-size:14px; }
    .status::before { content:""; width:8px; height:8px; border-radius:999px; background:var(--danger); }
    .status.ok::before { background:var(--ok); }
    .summary { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:1px; border:1px solid var(--line); background:var(--line); margin:36px 0 42px; border-radius:8px; overflow:hidden; }
    .metric { background:rgba(255,255,255,.92); padding:18px; }
    .metric span { display:block; color:var(--muted); font-size:13px; margin-bottom:8px; }
    .metric strong { font-size:25px; }
    details { border:1px solid var(--line); background:rgba(255,255,255,.76); border-radius:8px; padding:18px; margin:26px 0 42px; }
    summary { cursor:pointer; color:var(--blue); font-weight:900; }
    summary:focus-visible, button:focus-visible, .button:focus-visible, input:focus-visible { outline:3px solid rgba(37,99,235,.22); outline-offset:3px; }
    table { width:100%; border-collapse:collapse; margin-top:18px; }
    td { border-bottom:1px solid var(--line); padding:14px 0; vertical-align:top; }
    td:last-child { text-align:right; font-weight:900; }
    td span { color:var(--muted); font-size:14px; }
    .section-head { display:flex; align-items:end; justify-content:space-between; gap:18px; margin-top:34px; }
    .panel { border:1px solid var(--line); background:rgba(255,255,255,.9); border-radius:8px; padding:20px; margin-top:32px; box-shadow:0 18px 54px rgba(15,159,143,.08); }
    label { display:block; margin:14px 0 6px; color:var(--muted); font-size:14px; }
    input { width:100%; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:6px; padding:12px; font-size:16px; }
    input:disabled { color:#98a4b3; background:#f7fafc; }
    button, .button { display:inline-flex; align-items:center; justify-content:center; gap:8px; margin-top:14px; border:1px solid var(--accent); background:var(--accent); color:#fff; border-radius:6px; padding:12px 15px; font-weight:900; text-decoration:none; cursor:pointer; }
    button.secondary, .button.secondary { background:transparent; color:var(--ink); border-color:var(--line); margin-left:8px; }
    button:disabled { cursor:not-allowed; opacity:.55; }
    .warning { color:var(--danger); font-weight:700; }
    .notice { min-height:24px; color:var(--accent); margin-top:10px; }
    @media (max-width:760px) {
      .site-header { align-items:flex-start; flex-direction:column; margin-bottom:34px; }
      .hero { grid-template-columns:1fr; min-height:auto; }
      .score-card { padding:18px; }
      .section-head { display:block; }
      button.secondary, .button.secondary { margin-left:0; }
    }
  </style>
</head>
<body>
<main>
  <header class="site-header">
    <div class="brand"><span class="brand-mark">VB</span><span>VibeBenchmark</span></div>
    <a class="button" href="${basePath}/auth/github"><span aria-hidden="true">GH</span> GitHub 登录</a>
  </header>

  <section class="hero">
    <div>
      <h1>VibeBenchmark</h1>
      <p class="muted">首页只显示一个综合评分。展开后可以看到 ACM 传统题和工程情境细则；跑分与上传前必须先完成 GitHub OAuth 登录并输入展示名。</p>
    </div>
    <div class="score-card" aria-label="综合评分">
      <div class="score-label">综合评分</div>
      <div class="score">${scorecard.overallScore}</div>
      <div class="score-unit">/ 100</div>
      <div class="status ${session ? "ok" : ""}">${statusLabel}</div>
    </div>
  </section>

  <section class="summary">
    <div class="metric"><span>Personalization Lift</span><strong>+${scorecard.personalizationLift}</strong></div>
    <div class="metric"><span>Skill Lift</span><strong>+${scorecard.skillLift}</strong></div>
    <div class="metric"><span>Safety Grade</span><strong>${escapeHtml(scorecard.safetyGrade)}</strong></div>
    <div class="metric"><span>Verification</span><strong>${scorecard.serverVerified ? "Verified" : "Unverified"}</strong></div>
  </section>

  <details>
    <summary>展开细化分数和 benchmark 细则</summary>
    <table>${breakdownRows}</table>
  </details>

  <div class="section-head">
    <div>
      <h2>VibeLeaderboard</h2>
      <p class="muted">每个人都在这里跑分。榜单按综合分排序；正式提交要求 GitHub 身份和展示名。</p>
    </div>
  </div>
  <table id="leaderboard"><tbody>${leaderboardRows}</tbody></table>

  <section class="panel">
    <h2>跑我的 VibeBenchmark</h2>
    <p class="muted">${sessionText}</p>
    ${oauthNotice}
    <a class="button" href="${basePath}/auth/github"><span aria-hidden="true">GH</span> 用 GitHub OAuth 登录</a>
    ${session ? `<a class="button secondary" href="${basePath}/auth/logout">退出登录</a>` : ""}
    <label for="display-name">你的名字</label>
    <input id="display-name" placeholder="例如：凌晨修 bug 的阿强" autocomplete="name" ${canRun ? "" : "disabled"}>
    <button id="run-button" type="button" ${canRun ? "" : "disabled"}>${canRun ? "跑分并上传榜单" : "先登录 GitHub"}</button>
    <div class="notice" id="notice"></div>
  </section>
</main>
<script>
  const isLoggedIn = ${canRun ? "true" : "false"};
  const runButton = document.getElementById("run-button");
  const nameInput = document.getElementById("display-name");
  const notice = document.getElementById("notice");
  runButton.addEventListener("click", async () => {
    if (!isLoggedIn) {
      notice.textContent = "请先用 GitHub OAuth 登录。";
      return;
    }
    notice.textContent = "正在检查 GitHub 登录并跑分...";
    const response = await fetch("${basePath}/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName: nameInput.value })
    });
    const payload = await response.json();
    if (!response.ok) {
      notice.textContent = payload.error === "github_login_required" ? "请先用 GitHub OAuth 登录。" : (payload.error || "跑分失败。");
      return;
    }
    notice.textContent = "已完成跑分并写入榜单：" + payload.entry.name + " · " + payload.entry.score;
    setTimeout(() => location.reload(), 700);
  });
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

function cookieHeader(name, value, options = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/benchmark",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

function oauthConfigured(config) {
  return Boolean(config.githubClientId && config.githubClientSecret);
}

async function exchangeGitHubCode({ code, config }) {
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "user-agent": "VibeBenchmark",
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: `${config.publicBaseUrl}/auth/github/callback`,
      }),
    },
  );
  const tokenPayload = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw new Error("GitHub token exchange failed");
  }
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${tokenPayload.access_token}`,
      "user-agent": "VibeBenchmark",
    },
  });
  if (!userResponse.ok) {
    throw new Error("GitHub user fetch failed");
  }
  const user = await userResponse.json();
  return {
    githubId: user.id,
    githubLogin: user.login,
    name: user.name ?? user.login,
  };
}

export function createVibeBenchmarkServer(input = {}) {
  const config = {
    basePath: input.basePath ?? "/benchmark",
    publicBaseUrl: input.publicBaseUrl ?? "http://127.0.0.1:18084/benchmark",
    sessionSecret: input.sessionSecret ?? "development-only-change-me",
    dataDir: input.dataDir ?? "/var/lib/vibebenchmark",
    githubClientId: input.githubClientId ?? "",
    githubClientSecret: input.githubClientSecret ?? "",
  };
  let httpServer;

  async function currentLeaderboard() {
    return rankedEntries(await readLeaderboard(config.dataDir));
  }

  async function handler(req, res) {
    const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");
    const path = requestUrl.pathname;
    const cookies = parseCookies(req.headers.cookie);
    const session = verifySessionCookie(
      cookies.vb_session,
      config.sessionSecret,
    );

    try {
      if (
        req.method === "GET" &&
        (path === config.basePath || path === `${config.basePath}/`)
      ) {
        const html = renderPage({
          scorecard: buildScorecard(),
          leaderboard: await currentLeaderboard(),
          session,
          oauthConfigured: oauthConfigured(config),
          basePath: config.basePath,
        });
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        });
        res.end(html);
        return;
      }

      if (
        req.method === "GET" &&
        path === `${config.basePath}/scorecard.json`
      ) {
        writeJson(res, 200, buildScorecard());
        return;
      }

      if (req.method === "GET" && path === `${config.basePath}/api/me`) {
        writeJson(res, 200, { authenticated: Boolean(session), user: session });
        return;
      }

      if (
        req.method === "GET" &&
        path === `${config.basePath}/api/leaderboard`
      ) {
        writeJson(res, 200, { entries: await currentLeaderboard() });
        return;
      }

      if (req.method === "POST" && path === `${config.basePath}/api/run`) {
        if (!session) {
          writeJson(res, 401, { error: "github_login_required" });
          return;
        }
        const body = await readJsonBody(req);
        const displayName = sanitizeName(body.displayName);
        if (!displayName) {
          writeJson(res, 400, { error: "display_name_required" });
          return;
        }
        const scorecard = buildScorecard();
        const entries = await readLeaderboard(config.dataDir);
        const entry = {
          name: displayName,
          github: session.githubLogin,
          score: scorecard.overallScore,
          title: titleFor(scorecard.overallScore),
          createdAt: scorecard.createdAt,
        };
        entries.push(entry);
        await writeLeaderboard(config.dataDir, entries);
        writeJson(res, 200, {
          scorecard,
          entry,
          leaderboard: rankedEntries(entries),
        });
        return;
      }

      if (req.method === "GET" && path === `${config.basePath}/auth/github`) {
        if (!oauthConfigured(config)) {
          writeJson(res, 503, { error: "github_oauth_not_configured" });
          return;
        }
        const state = randomBytes(18).toString("base64url");
        const authUrl = new URL("https://github.com/login/oauth/authorize");
        authUrl.searchParams.set("client_id", config.githubClientId);
        authUrl.searchParams.set(
          "redirect_uri",
          `${config.publicBaseUrl}/auth/github/callback`,
        );
        authUrl.searchParams.set("scope", "read:user");
        authUrl.searchParams.set("state", state);
        redirect(res, authUrl.toString(), {
          "set-cookie": cookieHeader("vb_oauth_state", state, {
            maxAge: 600,
            secure: config.publicBaseUrl.startsWith("https://"),
          }),
        });
        return;
      }

      if (
        req.method === "GET" &&
        path === `${config.basePath}/auth/github/callback`
      ) {
        if (!oauthConfigured(config)) {
          writeJson(res, 503, { error: "github_oauth_not_configured" });
          return;
        }
        const state = requestUrl.searchParams.get("state");
        const code = requestUrl.searchParams.get("code");
        if (!state || !code || state !== cookies.vb_oauth_state) {
          writeJson(res, 400, { error: "invalid_oauth_state" });
          return;
        }
        const user = await exchangeGitHubCode({ code, config });
        redirect(res, `${config.basePath}/`, {
          "set-cookie": [
            cookieHeader(
              "vb_session",
              signSessionCookie(user, config.sessionSecret),
              {
                maxAge: 60 * 60 * 24 * 14,
                secure: config.publicBaseUrl.startsWith("https://"),
              },
            ),
            cookieHeader("vb_oauth_state", "", { maxAge: 0 }),
          ],
        });
        return;
      }

      if (req.method === "GET" && path === `${config.basePath}/auth/logout`) {
        redirect(res, `${config.basePath}/`, {
          "set-cookie": cookieHeader("vb_session", "", { maxAge: 0 }),
        });
        return;
      }

      writeJson(res, 404, { error: "not_found" });
    } catch (error) {
      writeJson(res, 500, {
        error: "internal_error",
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return {
    get port() {
      const address = httpServer?.address();
      return typeof address === "object" && address ? address.port : 0;
    },
    listen(port) {
      return new Promise((resolve) => {
        httpServer = createServer((req, res) => {
          void handler(req, res);
        });
        httpServer.listen(port, "127.0.0.1", resolve);
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        if (!httpServer) {
          resolve();
          return;
        }
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

async function main() {
  const server = createVibeBenchmarkServer({
    basePath: process.env.VB_BASE_PATH ?? "/benchmark",
    publicBaseUrl:
      process.env.VB_PUBLIC_BASE_URL ?? "http://127.0.0.1:18084/benchmark",
    sessionSecret: process.env.VB_SESSION_SECRET ?? "",
    dataDir: process.env.VB_DATA_DIR ?? "/var/lib/vibebenchmark",
    githubClientId: process.env.GITHUB_CLIENT_ID ?? "",
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
  });
  const port = Number.parseInt(process.env.PORT ?? "18084", 10);
  await server.listen(port);
  console.log(`VibeBenchmark server listening on 127.0.0.1:${port}`);
}

if (process.argv[1]?.endsWith("vibebenchmark-server.mjs")) {
  await main();
}
