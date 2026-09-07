# M01 test report

Status: **In progress — deterministic combat passes locally and in CI**

## Environment

- Date: 2026-09-07
- Node.js: 24.19.0
- TypeScript: 6.0.3
- Vite: 8.2.2
- Vitest: 5.0.0
- Branch: `main`
- Verified commit: `63bfa0c1783693e41608370000cdf6cbb9ee4143`

## Initial scaffold results

| Check | Result | Evidence |
| --- | --- | --- |
| Legacy JavaScript syntax | Pass | `node --check dist/game.js` |
| Baseline project structure | Pass | 8 fighters, 32 source/runtime atlas pairs, 8 stages and 11 soundtrack files |
| Baseline asset integrity | Pass | All 138 recorded SHA-256 hashes reproduced |
| Strict TypeScript check | Pass | `tsc --noEmit` |
| Core and content unit tests | Pass | 4 suites, 36 tests |
| Vite production build | Pass | 10 modules; 11.80 kB ESM core bundle, 4.16 kB gzip |

The same locked validation suite passed in GitHub Actions for PR #10. A clean
post-merge checkout reproduced all checks, contained 205 tracked files, no
zero-byte files and no working-tree changes.

## Unit-test coverage added

- fixed 60 Hz simulation contract
- identical replay inputs reproduce identical state and hash
- changed input changes the final state hash
- discontinuous replay frames are rejected
- unsupported replay versions are rejected
- Saja's canonical walk speed advances 288 rendered pixels per second
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
- edge-triggered attack commands and non-repeating held inputs
- authored multi-frame active windows and canonical special-move reach
- simultaneous trades without player-order advantage
- blocking, chip damage, block stun, hit stun and movement lockout
- meter gain and deterministic meter cap
- KO, round wins, health reset and best-of-three match victory
- malformed replay fighter/input rejection and combat replay hashes

## Required evidence

- deterministic simulation unit tests — **complete for M1 core scope**
- replay reproduction and state-hash tests — **complete for M1 core scope**
- fighter-content schema validation — **complete**
- keyboard and controller smoke tests
- title, selection and local-versus browser smoke tests
- 60 Hz simulation timing measurements
- render, memory and initial-download budgets
- existing B01 asset-integrity validation — **pass**

Test commands, environments, results, failures and waivers must be recorded before M1 is closed.
