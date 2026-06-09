# ADR 0005: Deterministic Baseline First

## Context

Users must be able to run Quick Scan and Local Arena without API keys. Claims
must be reproducible and evidence-backed.

## Decision

Implement a deterministic baseline compiler before optional LLM compilation.
The compiler excludes aspirational, stale, unsafe, and unresolved-conflict
evidence.

## Alternatives

- LLM-only compiler: more fluent output, but not reproducible and requires API
  keys.
- Template-only output: deterministic, but too weak for meaningful skills.

## Consequences

Initial skills may be conservative, but their provenance and hash are stable.

## Security impact

No untrusted evidence is treated as executable instruction, and no model can
override deterministic safety checks.

## Migration path

LLM providers can later improve wording while validators preserve the same
safety and grounding requirements.
