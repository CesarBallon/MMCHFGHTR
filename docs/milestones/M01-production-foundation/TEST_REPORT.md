# M01 test report

Status: **In progress — initial scaffold passes locally**

## Environment

- Date: 2026-09-07
- Node.js: 24.19.0
- TypeScript: 6.0.3
- Vite: 8.2.2
- Vitest: 5.0.0
- Branch: `develop/m1-production-foundation`
- Base commit: `b89d311bea0ffe5b895d252afeb550ac996a74be`

## Initial scaffold results

| Check | Result | Evidence |
| --- | --- | --- |
| Legacy JavaScript syntax | Pass | `node --check dist/game.js` |
| Baseline project structure | Pass | 8 fighters, 32 source/runtime atlas pairs, 8 stages and 11 soundtrack files |
| Baseline asset integrity | Pass | All 138 recorded SHA-256 hashes reproduced |
| Strict TypeScript check | Pass | `tsc --noEmit` |
| Deterministic-core unit tests | Pass | 1 suite, 5 tests |
| Vite production build | Pass | 7 modules; 2.60 kB ESM core bundle, 1.18 kB gzip |

The combined npm script invokes the same checks. During this local run, the
execution host interrupted the npm wrapper for an environment approval check;
each underlying command was then executed directly and passed. This was not a
project test failure. GitHub Actions verification remains pending until the
scaffold is committed and pushed.

## Unit-test coverage added

- fixed 60 Hz simulation contract
- identical replay inputs reproduce identical state and hash
- changed input changes the final state hash
- discontinuous replay frames are rejected
- crouching, jumping, grounded state and opponent-facing direction

## Required evidence

- deterministic simulation unit tests — **initial coverage added**
- replay reproduction and state-hash tests — **initial coverage added**
- fighter-content schema validation
- keyboard and controller smoke tests
- title, selection and local-versus browser smoke tests
- 60 Hz simulation timing measurements
- render, memory and initial-download budgets
- existing B01 asset-integrity validation — **pass**

Test commands, environments, results, failures and waivers must be recorded before M1 is closed.
