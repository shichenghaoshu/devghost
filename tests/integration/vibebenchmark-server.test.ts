import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  createVibeBenchmarkServer,
  signSessionCookie,
} from "../../scripts/vibebenchmark-server.mjs";

interface RunPayload {
  scorecard: { overallScore: number };
  entry: { name: string; github: string; score: number };
}

interface LeaderboardPayload {
  entries: Array<{ name: string; github: string; score: number }>;
}

const servers: Array<{ close: () => Promise<void> }> = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

async function startTestServer() {
  const dataDir = await mkdtemp(join(tmpdir(), "vibebenchmark-server-"));
  const server = createVibeBenchmarkServer({
    basePath: "/benchmark",
    publicBaseUrl: "http://127.0.0.1:0/benchmark",
    sessionSecret: "test-secret",
    dataDir,
    githubClientId: "test-client",
    githubClientSecret: "test-secret",
  });
  await server.listen(0);
  servers.push(server);
  return { server, url: `http://127.0.0.1:${server.port}` };
}

describe("VibeBenchmark server", () => {
  it("serves a bright page that requires GitHub login before scoring", async () => {
    const { url } = await startTestServer();

    const response = await fetch(`${url}/benchmark/`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("VibeBenchmark");
    expect(html).toContain("GitHub OAuth");
    expect(html).toContain("--bg:#ffffff");
    expect(html).toContain("综合评分");
    expect(html).toContain("递归煎饼摊");
    expect(html).toContain("祖传屎山考古局");
    expect(html).toContain('id="run-button" type="button" disabled');
  });

  it("rejects benchmark runs without a signed GitHub session", async () => {
    const { url } = await startTestServer();

    const response = await fetch(`${url}/benchmark/api/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName: "测试用户" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "github_login_required",
    });
  });

  it("starts a real GitHub OAuth authorization redirect when configured", async () => {
    const { url } = await startTestServer();

    const response = await fetch(`${url}/benchmark/auth/github`, {
      redirect: "manual",
    });
    const location = response.headers.get("location");
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(302);
    expect(location).toContain("https://github.com/login/oauth/authorize");
    expect(location).toContain("client_id=test-client");
    expect(location).toContain(
      "redirect_uri=http%3A%2F%2F127.0.0.1%3A0%2Fbenchmark%2Fauth%2Fgithub%2Fcallback",
    );
    expect(setCookie).toContain("vb_oauth_state=");
  });

  it("runs benchmark and persists leaderboard after GitHub session and name", async () => {
    const { url } = await startTestServer();
    const cookie = signSessionCookie(
      { githubId: 1, githubLogin: "octocat", name: "Octo Cat" },
      "test-secret",
    );

    const runResponse = await fetch(`${url}/benchmark/api/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `vb_session=${cookie}`,
      },
      body: JSON.stringify({ displayName: "章鱼猫" }),
    });
    const run = (await runResponse.json()) as RunPayload;
    const boardResponse = await fetch(`${url}/benchmark/api/leaderboard`);
    const board = (await boardResponse.json()) as LeaderboardPayload;

    expect(runResponse.status).toBe(200);
    expect(run.scorecard.overallScore).toBe(84);
    expect(run.entry).toMatchObject({
      name: "章鱼猫",
      github: "octocat",
      score: 84,
    });
    expect(board.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "章鱼猫", github: "octocat" }),
      ]),
    );
  });
});
