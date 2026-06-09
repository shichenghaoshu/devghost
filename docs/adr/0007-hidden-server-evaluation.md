# ADR 0007: Hidden Server Evaluation

## Context

Formal GhostBench results must not let agents read hidden tests, reference
solutions, or scoring internals.

## Decision

Verified Arena keeps hidden evaluation server-side. v0.1 exposes only a server
skeleton and mock verified run, marked experimental.

## Alternatives

- Ship hidden tests with public tasks: convenient, but invalidates scores.
- Run all evaluation locally: useful for demos, but not certifiable.

## Consequences

Local Arena results are labeled `Local Run` and `Unverified`.

## Security impact

The architecture separates agent workspaces from evaluator assets.

## Migration path

Future worker implementations can mount hidden tests only after agent execution
freezes.
