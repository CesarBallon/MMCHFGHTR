# M01 test report

Status: **In progress — foundation and canonical content pass locally and in CI**

## Environment

- Date: 2026-09-07
- Node.js: 24.19.0
- TypeScript: 6.0.3
- Vite: 8.2.2
- Vitest: 5.0.0
- Branch: `main`
- Verified commit: `b9cda31eec96f87e9aad3705fb1fbe3bfefd697f`

## Initial scaffold results

| Check | Result | Evidence |
| --- | --- | --- |
| Legacy JavaScript syntax | Pass | `node --check dist/game.js` |
| Baseline project structure | Pass | 8 fighters, 32 source/runtime atlas pairs, 8 stages and 11 soundtrack files |
| Baseline asset integrity | Pass | All 138 recorded SHA-256 hashes reproduced |
| Strict TypeScript check | Pass | `tsc --noEmit` |
| Core and content unit tests | Pass | 3 suites, 22 tests |
| Vite production build | Pass | 7 modules; 2.69 kB ESM core bundle, 1.21 kB gzip |

The same locked validation suite passed in GitHub Actions for PR #8. A clean
post-merge checkout reproduced all checks, contained 203 tracked files, no
zero-byte files and no working-tree changes.

## Unit-test coverage added

- fixed 60 Hz simulation contract
- identical replay inputs reproduce identical state and hash
- changed input changes the final state hash
- discontinuous replay frames are rejected
- unsupported replay versions are rejected
- walking advances 240 rendered pixels per second
- jump height and landing time remain within explicit bounds
- movement clamps to both stage boundaries
- crouching, jumping, grounded state and opponent-facing direction
- valid fighter parsing and unsupported schema rejection
- deterministic integer and minimum 16 fps animation boundaries
- fighter-specific asset-path validation
- duplicate move and fighter rejection
- signature-special references and complete-roster enforcement
- exact stage, soundtrack, stats, proportions, specials and atlas mappings
- existence of every referenced canonical and runtime asset

## Required evidence

- deterministic simulation unit tests — **initial coverage added**
- replay reproduction and state-hash tests — **initial coverage added**
- fighter-content schema validation — **complete**
- keyboard and controller smoke tests
- title, selection and local-versus browser smoke tests
- 60 Hz simulation timing measurements
- render, memory and initial-download budgets
- existing B01 asset-integrity validation — **pass**

Test commands, environments, results, failures and waivers must be recorded before M1 is closed.
