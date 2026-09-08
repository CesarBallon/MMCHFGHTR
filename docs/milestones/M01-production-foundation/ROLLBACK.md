# M01 rollback procedure

## Purpose

Restore the last known playable state if a production-foundation change breaks the public client or its validation gates.

## Preferred rollback

1. Identify the first failing merge commit and preserve its CI logs and browser artifacts.
2. Create a dedicated `revert/` branch from current `main`.
3. Revert the offending squash commit with `git revert <commit>`; do not rewrite shared history.
4. Run `npm ci`, `npm test`, `npm run test:browser`, and `npm run build`.
5. Open and review a pull request describing the failure, affected players, and forward-fix issue.
6. Merge only after all required checks pass, then verify the `main` push workflow.

## Emergency baseline

If an isolated revert cannot restore a playable build, branch from `baseline-b01` at `a3af993cad5a5be830d61bd03a6d89e79fc99f1f`, validate it, and deploy that exact commit while the production branch is repaired. Do not force-push `main`; retain the incident history.

## Verification after rollback

- title and selection screens load;
- keyboard and controller paths enter a match;
- canonical asset manifest passes;
- deterministic unit and replay tests pass;
- browser smoke tests pass in Chromium; and
- deployed version and commit SHA are recorded in the incident or milestone log.
