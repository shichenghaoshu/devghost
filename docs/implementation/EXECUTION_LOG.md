# DevGhost Execution Log

This log records implementation steps for the initial repository build. It avoids
local absolute paths, raw secrets, and private source content.

## 2026-06-09

1. Read `prompt.md` and treated it as the approved project specification.
2. Checked the local repository state. The repository had no commits on `main`
   and only `prompt.md` plus an ignored macOS metadata file.
3. Checked GitHub CLI authentication. The active GitHub account is
   `shichenghaoshu`.
4. Checked that `shichenghaoshu/devghost` did not already exist.
5. Created public GitHub repository:
   `https://github.com/shichenghaoshu/devghost`.
6. Bound the local repository remote `origin` to the GitHub repository.
7. Recorded the active local toolchain versions:
   Node.js `v24.9.0`, pnpm `10.21.0`, Python `3.14.0`, uv `0.9.9`.
8. Copied the approved specification from `prompt.md` to
   `docs/architecture/PROJECT_SPEC.md`.
9. Built a static benchmark landing page with
   `pnpm build:benchmark-static`.
10. Connected to the deployment server over SSH using one-time interactive
    credentials supplied by the user. The credential was not written to project
    files.
11. Detected Alibaba Cloud Linux 3 and Nginx `1.20.1`.
12. Uploaded the static benchmark page to `/var/www/benchmark/`.
13. Backed up the remote Nginx config and inserted a `/benchmark/` static
    location into the existing IP default server block.
14. Ran `nginx -t`, reloaded Nginx, and verified:
    `http://47.100.139.168/benchmark` redirects to
    `http://47.100.139.168/benchmark/`.
15. Added `devghost account-run` for a local-only account scan with anonymized
    source aliases and lockfile/tool-output filtering.
16. Ran `devghost account-run` against the current local account. The latest
    sanitized output was written to
    `.devghost/output/account-2026-06-09T08-32-15-724Z`.
17. Checked that the account output did not contain the local absolute user path,
    server password, or raw fake-token fixtures.
18. Added a Node-only server benchmark runner for environments without pnpm or
    Python 3.12.
19. Deployed the runner package to the benchmark server because the server could
    not clone GitHub directly (`Empty reply from server`).
20. Ran the server benchmark on the server and published artifacts to
    `/var/www/benchmark/` and `/var/www/benchmark/latest/`.
21. Verified `http://47.100.139.168/benchmark/` returns the server result page
    with final score `84 / 100`.
22. Verified `http://47.100.139.168/benchmark/scorecard.json` returns
    `finalScore: 84`, `verification: Server Run / Unverified`, and
    `serverVerified: false`.
23. Renamed the user-facing benchmark surface to `VibeBenchmark`.
24. Updated the server benchmark page to show one composite score by default,
    with `<details>` for ACM and engineering breakdowns.
25. Added humorous benchmark worlds, including `递归煎饼摊` and
    `祖传屎山考古局`.
26. Added a static `VibeLeaderboard` and a GitHub/name gate before local
    browser-side score submission.
27. Re-ran the server benchmark and verified
    `http://47.100.139.168/benchmark/scorecard.json` returns
    `productName: VibeBenchmark`, `overallScore: 84`, 8 breakdown items, and 4
    leaderboard entries.
28. Added the dynamic Node-only VibeBenchmark server for `/benchmark`.
29. Reworked the public page into a bright white, teal, and blue interface with
    a single headline score, expandable ACM/engineering breakdowns, and a
    persistent `VibeLeaderboard`.
30. Added a real GitHub OAuth authorization-code flow:
    `/benchmark/auth/github`, `/benchmark/auth/github/callback`, signed session
    cookie, logout, `/benchmark/api/me`, `/benchmark/api/leaderboard`, and
    authenticated `/benchmark/api/run`.
31. Enforced GitHub login before score submission. The browser disables the name
    input and run button until a signed GitHub session exists, and the server
    returns `401 github_login_required` for unauthenticated run attempts.
32. Added integration tests for page rendering, OAuth redirect construction,
    unauthenticated run rejection, authenticated run creation, and leaderboard
    persistence.
33. Deployed the dynamic server to `/opt/devghost/scripts/vibebenchmark-server.mjs`
    and managed it with the `vibebenchmark` systemd service on port `18084`.
34. Backed up the remote Nginx config and changed both the IP HTTP server and the
    sslip HTTPS server to proxy `/benchmark/` to `127.0.0.1:18084`.
35. Verified `http://47.100.139.168/benchmark/` returns the dynamic bright
    VibeBenchmark page, `/benchmark/api/leaderboard` returns ranked entries, and
    unauthenticated `/benchmark/api/run` returns `401 github_login_required`.
36. Verified the HTTPS sslip `/benchmark/` Nginx route from the server using an
    explicit local resolve. Local workstation DNS resolved sslip to a private
    interception address, so the externally advertised route remains the user's
    requested `http://47.100.139.168/benchmark`.
37. Confirmed the live server still needs GitHub OAuth App credentials in
    `/etc/vibebenchmark.env`. Until `GITHUB_CLIENT_ID` and
    `GITHUB_CLIENT_SECRET` are filled, `/benchmark/auth/github` correctly
    returns `503 github_oauth_not_configured` instead of pretending login works.
38. Ran browser QA on the live page: desktop page identity and console health,
    no title/score-card overlap, disabled unauthenticated run controls, details
    expansion, and mobile 390px no-horizontal-overflow check.
39. Set the live `VB_PUBLIC_BASE_URL` to
    `http://47.100.139.168/benchmark` so the OAuth flow stays on the user's
    requested simple IP path. The sslip HTTPS Nginx route remains available as
    an optional hardening path.

## Verification Notes

- No project tests existed before the initial scaffold.
- The remote repository was created before implementation work, as requested.
- All later implementation steps should be backed by fresh command output before
  being reported as passing.
