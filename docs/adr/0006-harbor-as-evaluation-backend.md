# ADR 0006: Harbor as Evaluation Backend

## Context

The specification calls for a pluggable benchmark execution backend compatible
with Harbor-style tasks.

## Decision

Define a Harbor adapter interface in v0.1 while using a mock worker and mock
agent for local deterministic tests.

## Alternatives

- Implement full Harbor integration immediately: higher fidelity, but delays the
  local vertical slice.
- Ignore Harbor until later: simpler, but risks an incompatible task format.

## Consequences

Public task manifests and runner interfaces are shaped for future Harbor
integration from the first release.

## Security impact

Mock local runs avoid granting broad container privileges during early
development.

## Migration path

Replace the mock bridge with a real Harbor adapter behind the same interface.
