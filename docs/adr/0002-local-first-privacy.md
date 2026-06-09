# ADR 0002: Local-First Privacy

## Context

The product compiles developer memory into agent skills. Raw memory, private
paths, repository history, and credentials are high-risk data.

## Decision

v0.1 defaults to local processing. Discovery records metadata only until the
user authorizes content reads. Reports and logs use aliases and sanitized
metadata. Raw source upload is not supported in v0.1.

## Alternatives

- Cloud-first scanning: easier onboarding, but violates the core privacy model.
- Upload full history after consent: useful for research, but too risky for the
  first release.

## Consequences

The local CLI owns the primary flow. Verified Arena is limited to sanitized skill
packages and metadata.

## Security impact

This reduces blast radius if a service, queue, object store, or benchmark worker
is compromised.

## Migration path

Future versions may add explicitly reviewed upload flows, but raw upload remains
outside normal settings.
