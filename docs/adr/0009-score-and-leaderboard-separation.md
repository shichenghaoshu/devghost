# ADR 0009: Score and Leaderboard Separation

## Context

GhostBench scores depend on model, agent, harness, skill hash, task set, budget,
and runtime constraints.

## Decision

Scorecards record full run context. Leaderboards are partitioned by comparable
run configuration and never merge incompatible models or harnesses into one
global ranking.

## Alternatives

- One global score: easier to market, but misleading.
- Per-task-only reporting: rigorous, but weaker for users.

## Consequences

Reports display multiple metrics instead of one undifferentiated rank.

## Security impact

Run manifests make tampering and incomparable submissions easier to detect.

## Migration path

Leaderboard partitions can become more granular as task sets and harnesses
stabilize.
