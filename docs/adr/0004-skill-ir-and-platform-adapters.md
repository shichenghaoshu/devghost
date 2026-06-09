# ADR 0004: SkillIR and Platform Adapters

## Context

DevGhost must output a universal skill and platform-specific Codex and Claude
Code variants without coupling the core compiler to any one agent.

## Decision

Compile evidence into a platform-neutral SkillIR first. Adapters render SkillIR
to universal, Codex, or Claude Code output directories.

## Alternatives

- Render each platform directly from evidence: faster for v0.1, but duplicates
  grounding and safety logic.
- Use one markdown prompt only: simple, but not extensible or auditable.

## Consequences

The compiler has one safety gate, while adapters handle formatting differences.

## Security impact

Adapters cannot reintroduce unsafe evidence because they receive filtered
SkillIR, not raw source data.

## Migration path

Additional platforms can implement the adapter interface without changing
evidence normalization.
