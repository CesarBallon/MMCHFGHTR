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
- Added 22 unit tests covering simulation rate, replay reproduction, input
  sensitivity, invalid replay frames and versions, movement scale, jump arc,
  landing, stage boundaries, crouching and facing direction.
- Corrected the initial fixed-point movement constants so walking and jumping
  use the same 1,000-unit-per-pixel scale as stage coordinates.
- Extended CI to install locked dependencies, run legacy and M1 validation, and
  build the production combat-core bundle under Node.js 24.
- Added a runtime-validated fighter and move schema with deterministic numeric
  boundaries and a minimum authored animation rate of 16 fps.
- Added canonical definitions for Saja, Benita, Mariachay, Asunta, Shabuka,
  Bella, Jarjacha and Coraima, preserving their assigned stages, themes,
  current asset revisions, relative proportions and prototype balance values.
- Added exact baseline-equivalence and repository-asset assertions for the
  canonical roster. Aligned Node type declarations with the Node 24 runtime.

## Pending

- Extract additional combat state and rules from the legacy prototype.
- Add browser smoke tests for title, selection and local-versus flows.
- Measure the initial M1 performance and download budgets.
