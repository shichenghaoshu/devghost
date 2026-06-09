# ADR 0001: Monorepo and Language Boundaries

## Context

DevGhost needs a local CLI, shared contracts, report generation, a web surface,
and a benchmark API/worker skeleton. The approved specification requires a
TypeScript and Python mixed monorepo.

## Decision

Use a pnpm workspace with Turborepo for TypeScript packages and apps. Keep API,
worker, and evaluator code in Python packages managed by uv. JSON Schema is the
contract boundary between TypeScript and Python.

## Alternatives

- Single-language TypeScript repository: simpler, but weaker fit for Python
  evaluation and FastAPI services.
- Polyrepo: cleaner ownership boundaries, but too heavy for v0.1 iteration.

## Consequences

The monorepo keeps v0.1 runnable from one checkout. Package boundaries must stay
strict so shared behavior is not duplicated across apps.

## Security impact

Security-sensitive scanner and redaction code is isolated from UI code and
service orchestration code.

## Migration path

If the project grows, Python services can be split into independent repos while
preserving JSON Schema contracts.
