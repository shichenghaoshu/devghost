import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = join("dist", "benchmark-static");
await mkdir(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DevGhost Benchmark</title>
  <meta name="description" content="DevGhost / GhostBench local-first benchmark demo" />
  <style>
    :root {
      color-scheme: dark;
      --bg: #101114;
      --panel: #171a20;
      --text: #f5f7fb;
      --muted: #9aa4b2;
      --line: #2b3440;
      --accent: #55d6d2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    main { min-height: 100svh; display: grid; grid-template-rows: auto 1fr auto; }
    header, footer { padding: 20px clamp(20px, 5vw, 72px); border-color: var(--line); }
    header { border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; gap: 18px; align-items: center; }
    .brand { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--accent); font-weight: 800; letter-spacing: 0; }
    .status { color: var(--muted); font-size: 14px; }
    section { padding: clamp(40px, 8vw, 92px) clamp(20px, 5vw, 72px); }
    .hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 520px); gap: clamp(28px, 5vw, 72px); align-items: center; }
    h1 { margin: 0; font-size: clamp(46px, 8vw, 108px); line-height: .92; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0; }
    .lede { max-width: 720px; color: var(--muted); font-size: clamp(18px, 2vw, 23px); line-height: 1.55; margin: 24px 0 0; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
    a, button { color: inherit; }
    .button { border: 1px solid var(--accent); color: #071010; background: var(--accent); border-radius: 6px; padding: 12px 16px; font-weight: 700; text-decoration: none; }
    .ghost { border: 1px solid var(--line); color: var(--text); background: transparent; }
    .terminal { background: #090b0e; border: 1px solid var(--line); border-radius: 8px; padding: 20px; min-height: 360px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #c9fffa; box-shadow: 0 24px 90px rgb(0 0 0 / .32); }
    .terminal div { margin: 12px 0; }
    .muted { color: var(--muted); }
    .accent { color: var(--accent); }
    .strip { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: #13161b; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1px; background: var(--line); border: 1px solid var(--line); }
    .metric { background: var(--panel); padding: 22px; min-height: 118px; }
    .metric span { display: block; color: var(--muted); font-size: 13px; margin-bottom: 12px; }
    .metric strong { font-size: 30px; }
    .flow { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 18px; }
    .step { border-top: 1px solid var(--line); padding-top: 16px; }
    footer { border-top: 1px solid var(--line); color: var(--muted); }
    @media (max-width: 820px) {
      header { align-items: flex-start; flex-direction: column; }
      .hero { grid-template-columns: 1fr; }
      .terminal { min-height: 280px; }
    }
  </style>
</head>
<body>
<main>
  <header>
    <div class="brand">DevGhost / GhostBench</div>
    <div class="status">Local-first benchmark demo · /benchmark</div>
  </header>

  <section class="hero">
    <div>
      <h1>DevGhost Benchmark</h1>
      <p class="lede">把开发记忆编译成一个可审计的 AI 程序员分身，并用公开关卡比较 vanilla、generic 和 personalized 三种条件。</p>
      <div class="actions">
        <a class="button" href="#quickstart">开始使用</a>
        <a class="button ghost" href="#privacy">隐私边界</a>
      </div>
    </div>
    <div class="terminal" aria-label="benchmark status">
      <div>$ devghost discover</div>
      <div class="muted">No file content has been read.</div>
      <div>$ devghost scan --source synthetic</div>
      <div>EvidenceRecord: 42</div>
      <div>Redaction findings: 3</div>
      <div>$ devghost play --agent mock</div>
      <div class="accent">Local Run — Unverified</div>
    </div>
  </section>

  <section class="strip">
    <div class="metrics">
      <div class="metric"><span>DevGhost Level</span><strong>Lv.5</strong></div>
      <div class="metric"><span>Personalization Lift</span><strong>+16.8</strong></div>
      <div class="metric"><span>Skill Lift</span><strong>+20.1</strong></div>
      <div class="metric"><span>Safety Grade</span><strong>A</strong></div>
    </div>
  </section>

  <section id="quickstart">
    <h2>简单使用</h2>
    <div class="flow">
      <div class="step"><strong>1. 本地发现</strong><p class="muted">只列出数据源元信息，不读取正文。</p></div>
      <div class="step"><strong>2. 授权扫描</strong><p class="muted">用户选择 synthetic / Codex / Claude / Git 来源。</p></div>
      <div class="step"><strong>3. 安全编译</strong><p class="muted">Secret、PII、Prompt Injection 先脱敏和隔离。</p></div>
      <div class="step"><strong>4. 公开关卡</strong><p class="muted">Mock Agent 无 API Key 运行 Local Arena。</p></div>
    </div>
  </section>

  <section id="privacy">
    <h2>隐私边界</h2>
    <p class="lede">v0.1 默认不上传原始记忆、聊天历史、Git diff、私有代码、本地路径、环境变量或 API Key。正式结果只代表 Agent + Model + Harness + Personalized Skill 的组合表现。</p>
  </section>

  <footer>
    DevGhost v0.1 preview. Local Run results are Unverified.
  </footer>
</main>
</body>
</html>`;

await writeFile(join(outDir, "index.html"), html, "utf8");
console.log(`Wrote ${join(outDir, "index.html")}`);
