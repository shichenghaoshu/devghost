# ADR 0003: JSON Schema as Contract Source

## Context

DevGhost needs consistent TypeScript types, Python models, fixtures, and CI
validation for benchmark artifacts.

## Decision

Use JSON Schema files under `datasets/schemas` as the canonical contract source.
TypeScript and Python exports must stay compatible with those schemas.

## Alternatives

- Generate JSON Schema from TypeScript: convenient for CLI code, but weak for
  Python ownership.
- Generate all contracts from Pydantic: convenient for API code, but weak for
  frontend and CLI packages.

## Consequences

Schema changes require explicit fixture and test updates.

## Security impact

Schema validation rejects malformed skill packages, evidence records, and run
manifests before they reach sensitive code paths.

## Migration path

Automated code generation can be added later once the manual contract surface is
stable.
