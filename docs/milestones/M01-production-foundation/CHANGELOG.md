# M01 changelog

## In progress

- Created the M1 development branch from the validated Node 24 baseline.
- Opened the production-foundation tracker and required ADR decision issues.
- Accepted ADR 0002: TypeScript, Vite and Vitest with the existing Canvas renderer.
- Added a reproducible npm lockfile and pinned the M1 toolchain to Node.js 24,
  TypeScript 6.0.3, Vite 8.2.2 and Vitest 5.0.0.
- Added strict TypeScript configuration and a production library build for the
  deterministic combat core.
- Added the first DOM-free simulation modules: fixed 60 Hz timing, fixed-point
  movement, seeded randomness, opponent-facing direction, crouching, jumping,
  replay input logs and deterministic state hashing.
- Added five unit tests covering simulation rate, replay reproduction, input
  sensitivity, invalid replay frames, crouching, jumping and facing direction.
- Extended CI to install locked dependencies, run legacy and M1 validation, and
  build the production combat-core bundle under Node.js 24.

## Pending

- Convert fighter and move definitions to validated data.
- Extract additional combat state and rules from the legacy prototype.
- Add browser smoke tests for title, selection and local-versus flows.
- Measure the initial M1 performance and download budgets.
