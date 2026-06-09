# Security Policy

Report security issues privately. Do not open public issues for vulnerabilities
that involve secrets, upload bypasses, path traversal, prompt injection bypasses,
or sandbox escape.

## Supported Version

v0.1 is experimental and local-first. It is not a production verified benchmark
service.

## Security Model

- Raw local source content is treated as untrusted data.
- Skill packages are instruction-only in v0.1.
- Raw source upload is not supported.
- Logs and reports must not contain raw secrets or private local paths.
