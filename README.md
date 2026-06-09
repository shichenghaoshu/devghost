# VibeBenchmark

VibeBenchmark gives each coding-agent run one headline score, then lets users
expand into ACM-style algorithm tasks, engineering scenarios, safety checks, and
leaderboard details.

The original internal prototype names were DevGhost / GhostBench. User-facing
benchmark surfaces now use VibeBenchmark.

## Status

- Implemented: local synthetic demo, deterministic skill compiler, mock arena,
  HTML report, SVG share card, API/worker skeleton, and the public
  VibeBenchmark page.
- Implemented for `/benchmark`: one headline score, expandable ACM and
  engineering breakdowns, GitHub OAuth authorization-code login gate, display
  name submission, and a persistent VibeLeaderboard.
- Needs deployment secret: a GitHub OAuth App `Client ID` and `Client Secret`
  must be provided through server environment variables before the live login
  button can complete the GitHub round trip. These secrets are not committed.
- Planned beyond the current public demo: production verified arena, real
  hidden task pool, anti-cheat review, and partitioned leaderboards.

## 30 Second Demo

```bash
make setup
make demo
```

The demo uses synthetic fixtures only. It performs metadata discovery, local
authorization, redaction, evidence normalization, deterministic skill
compilation, mock arena scoring, and report generation without API keys.

## Local First

VibeBenchmark does not upload raw Codex memories, Claude Code memories, Git diffs,
chat history, local paths, credentials, or private repository content. v0.1 only
supports instruction-only skill packages and sanitized metadata.

## Quick Start

```bash
devghost doctor
devghost discover --json
devghost scan --source synthetic
devghost compile --target universal
devghost play --agent mock
devghost report --format html
```

During development, use:

```bash
pnpm devghost doctor
pnpm demo
pnpm devghost account-run
node scripts/vibebenchmark-server.mjs
```

`account-run` performs a local-only scan of the current machine account sources
that VibeBenchmark can detect. It writes sanitized artifacts under `.devghost/output`
and does not upload raw source content.

## Public Server App

The dynamic VibeBenchmark server is a Node-only app intended to run behind
Nginx at `/benchmark`.

```bash
PORT=18084 \
VB_BASE_PATH=/benchmark \
VB_PUBLIC_BASE_URL=http://47.100.139.168/benchmark \
VB_SESSION_SECRET=change-me \
VB_DATA_DIR=/var/lib/vibebenchmark \
GITHUB_CLIENT_ID=your-oauth-client-id \
GITHUB_CLIENT_SECRET=your-oauth-client-secret \
node scripts/vibebenchmark-server.mjs
```

GitHub OAuth callback URL:

```text
http://47.100.139.168/benchmark/auth/github/callback
```

An HTTPS sslip Nginx route is also available for later hardening, but the
current public flow stays on the user's requested IP path for simplicity.

## Benchmark Method

Local Arena results are marked `Local Run` and `Unverified`. A formal result
represents:

```text
Agent + Model + Harness + Personalized Skill
```

It is not a certification of the human developer.

## Security Limits

v0.1 rejects raw upload, executable skill content, symlinks, path traversal, and
known secret patterns. Security tests cover synthetic secrets and prompt
injection fixtures; they do not prove production readiness.

## Contributing

See `CONTRIBUTING.md`, `SECURITY.md`, `PRIVACY.md`, and the ADRs under
`docs/adr`.
