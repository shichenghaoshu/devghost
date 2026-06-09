# Contributing

DevGhost uses Conventional Commits and small, reviewable changes.

## Development

```bash
make setup
make lint
make typecheck
make test
make demo
```

Do not add real user memories, real tokens, private repository history, or
customer names to fixtures. Use synthetic data only.

## Commit Messages

Examples:

- `feat: add deterministic skill compiler`
- `fix: redact github token previews`
- `docs: record local-first privacy decision`

## Pull Requests

Pull requests should include:

- user-visible behavior change;
- test evidence;
- security or privacy impact;
- documentation updates when behavior changes.
