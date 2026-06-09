# VibeBenchmark

VibeBenchmark gives each coding-agent run one headline score, then lets users
expand into ACM-style algorithm tasks, engineering scenarios, safety checks, and
leaderboard details.

The original internal prototype names were DevGhost / GhostBench. User-facing
benchmark surfaces now use VibeBenchmark.

## Status

- Implemented: local synthetic demo, deterministic skill compiler, mock arena,
  HTML report, SVG share card, API/worker skeleton.
- Experimental: server-side submission state machine and Harbor adapter bridge.
- Planned: production verified arena, real hidden task pool, public leaderboard.

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
```

`account-run` performs a local-only scan of the current machine account sources
that VibeBenchmark can detect. It writes sanitized artifacts under `.devghost/output`
and does not upload raw source content.

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
