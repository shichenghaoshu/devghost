# ADR 0008: Instruction-Only Skills for v0.1

## Context

Skill packages compiled from developer memory may otherwise carry scripts,
symlinks, binaries, or dynamic behavior.

## Decision

v0.1 skill packages are instruction-only markdown plus JSON metadata and reports.
Scripts, binaries, symlinks, executable bits, and network-required instructions
are rejected.

## Alternatives

- Allow helper scripts: powerful, but creates execution and supply-chain risk.
- Allow arbitrary package contents after scan: still too broad for v0.1.

## Consequences

Some advanced workflows cannot be encoded yet, but packages are easier to audit.

## Security impact

This blocks the most direct path from malicious memory content to code execution.

## Migration path

Future package formats may add signed, sandboxed helpers after a stricter policy
review.
