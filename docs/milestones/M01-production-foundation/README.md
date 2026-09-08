# M01 — Production foundation

Status: **Complete**
Tracking issue: [#6](https://github.com/CesarBallon/MMCHFGHTR/issues/6)
Base: `64cb5af5147252fcd9b2a82dd8b2718e7368fd29`
Closeout evidence: PR [#13](https://github.com/CesarBallon/MMCHFGHTR/pull/13), run [#21](https://github.com/CesarBallon/MMCHFGHTR/actions/runs/34253529830), commit `e1d2085875d5981ca79672f55fa01cb7e558b2fd`

## Goal

Convert the playable Canvas prototype into a modular, testable and deterministic client without destabilizing the public baseline.

## Delivered scope

- TypeScript module and build/test foundation
- validated data-driven definitions for all eight fighters and their moves
- DOM-free deterministic combat core at a fixed 60 Hz
- seeded randomness, state hashing, and replayable ordered input logs
- combat coverage for movement, attacks, blocking, stun, meter, KO, rounds, and trades
- static asset validation and SHA-256 baseline manifest
- Chromium smoke coverage for title, selection, local versus, keyboard, controller, and combat paths
- measured and enforced static, simulation, startup, rendering, and JavaScript-heap regression budgets
- documented rollback procedure that preserves shared history

## Completed slices

- PR #7: deterministic TypeScript, Vite and Vitest foundation.
- PR #8: validated canonical definitions for all eight fighters and their moves.
- PR #10: deterministic attacks, blocking, stun, meter, KO and round rules.
- PR #11: deterministic-combat documentation and evidence.
- PR #12: Playwright browser smoke suite and Node 24 CI integration.
- PR #13: post-merge race correction, performance enforcement, measurements, and closeout documentation.

## Exit evidence

| Criterion | Evidence |
| --- | --- |
| TypeScript modules | `src/core/`, `src/content/`, Vite build |
| Data-driven fighters | eight runtime-validated definitions and content tests |
| Determinism | identical seed/input state hashes and replay tests |
| Combat rules | 37 unit tests including the simulation budget |
| Asset integrity | 138 SHA-256 entries and 32 source/runtime atlas pairs |
| Browser paths | five Chromium smoke tests in CI |
| Performance | [M01 budgets](../../performance/M01_BUDGETS.md) |
| Rollback | [M01 rollback procedure](ROLLBACK.md) |
| Playable legacy client | smoke tests exercise the checked-in `dist/` application without test hooks |

## Verified performance sample

GitHub Actions run #21 recorded 20,000 simulation frames in 22.47 ms; browser boot in 7,425 ms; 58,853,660 transferred startup bytes; 33.30 ms p95 render-frame interval; and 21,700,000 bytes of used JavaScript heap. These are regression measurements from a shared CI runner, not minimum-device certification.

## Rollback

Use the [documented revert-first procedure](ROLLBACK.md). The emergency playable baseline remains branch `baseline-b01` at `a3af993cad5a5be830d61bd03a6d89e79fc99f1f`.

## Next milestone

M02 proves the final combat and animation pipeline with two selected fighters before production work expands to the entire roster.
