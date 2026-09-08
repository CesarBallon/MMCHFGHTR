# M02 test report

Status: **In progress — advanced combat slice passes CI**

## Baseline

- Date initialized: 2026-09-08
- Base commit: `ae1f7aaefb026bb4688f23c2c9657cbc57a76724`
- Required runtime: Node.js 24
- Reference milestone: M01 production foundation

## Required automated evidence

| Area | Required result | Status |
| --- | --- | --- |
| TypeScript | strict typecheck | Pending |
| Determinism | identical seed and ordered inputs produce identical hashes | Pending |
| Combat | crouch, jump, block, throw, hit stop, cancels, meter and supers | Pushboxes, throws, hit stop, normal-to-special/super cancels and supers pass |
| Collision | authored hit resolution, mirroring, debug snapshots and Canvas projection | Implemented; CI pending |
| Animation | state coverage, frame bounds, facing and 16+ authored-source-fps rule | Implemented; CI pending |
| Assets | canonical provenance, transparency, dimensions and checksums | Pending |
| Browser | Benita–Saja keyboard and controller local-versus paths | Pending |
| Performance | fixed 60 Hz simulation and M02 render/memory budgets | Pending |

## Latest automated result

GitHub Actions [run 34264389372](https://github.com/CesarBallon/MMCHFGHTR/actions/runs/34264389372) passed the locked legacy validation, strict typecheck, 62 unit tests, performance budget, Chromium browser smoke suite and production build at commit `a7d995e6246495ada146c97757c14a464c1e3f79`.

## Required manual evidence

- pose readability and silhouette review
- stance breathing without horizontal drift
- facing transition and turnaround review
- shadow contact through movement, attacks, jumps and knockdowns
- controller checks on at least one standard XInput-compatible pad
- Chrome/Chromium desktop review at target stage scale
- hit-stop, impact, block and super readability review

## Failures and waivers

None recorded. Any waiver must link to an issue, owner and expiration milestone.

## Closeout record

Commands, environment, tested commit, CI run URLs, devices, browsers, measurements and known failures will be recorded before M02 is marked complete.
