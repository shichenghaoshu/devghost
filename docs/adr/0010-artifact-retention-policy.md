# ADR 0010: Artifact Retention Policy

## Context

Verified runs process user-provided skill packages that may still contain
sensitive metadata despite client-side review.

## Decision

v0.1 server skeleton models deletion after run completion. Long-term retention is
limited to hashes, scores, non-sensitive statistics, and sanitized audit events.

## Alternatives

- Retain all artifacts for debugging: convenient, but high risk.
- Delete all records immediately: safer, but undermines reproducibility.

## Consequences

Debugging failed verified runs may require explicit short-lived retention.

## Security impact

Reduces exposure of uploaded artifacts and worker logs.

## Migration path

Production deployments can add configurable retention windows with strict
defaults and user-triggered immediate deletion.
