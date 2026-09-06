# ADR 0002 — TypeScript and Vite client toolchain

- Status: Accepted
- Date: 2026-09-06
- Decision issue: [#1](https://github.com/CesarBallon/MMCHFGHTR/issues/1)
- Milestone: M01 — Production foundation

## Context

The playable prototype is a dependency-free Canvas application concentrated in `dist/game.js`. M1 must introduce modular TypeScript, deterministic tests and reproducible builds while keeping the current public prototype playable.

The deterministic combat core must remain independent of the DOM, audio, wall-clock time, renderer and unseeded randomness.

## Decision

Adopt:

- TypeScript for new production modules;
- Vite 8 for development and production builds;
- Vitest 5 for deterministic-core unit tests;
- Node.js 24 for local tooling and CI;
- the existing Canvas renderer during M1 rather than migrating to a game framework.

The new client will be introduced beside the preserved `dist/` baseline. Migration will occur by bounded subsystem extraction, not a full rewrite.

Target module boundaries:

- `src/core/`
- `src/content/`
- `src/input/`
- `src/render/`
- `src/audio/`
- `src/modes/`
- `src/net/`
- `src/ui/`

## Consequences

### Positive

- Type-safe data and simulation contracts
- fast development and production builds
- one transformation pipeline for source and tests
- direct unit testing of TypeScript simulation modules
- no forced renderer rewrite
- compatible with static deployment

### Costs

- build dependencies and a lockfile become mandatory
- contributors must use the documented Node version
- the legacy and production entry points coexist temporarily
- generated build output must not be hand-edited

## Guardrails

- `src/core/` may not import browser, rendering, audio or networking APIs.
- Simulation advances at fixed 60 Hz.
- Randomness enters through an explicit seeded generator.
- State serialization and hashing are stable and tested.
- Vite/Vitest transpilation does not replace `tsc --noEmit` type checking.
- `main` remains playable until the production entry point passes equivalent smoke tests.

## Alternatives considered

### Minimal custom TypeScript build

Rejected because it would add bespoke build and test maintenance without improving the game runtime.

### Phaser or PixiJS migration

Deferred. A framework migration would expand M1 into a renderer rewrite before deterministic combat is proven.

### Continue editing the monolith

Rejected because it cannot provide the isolation and deterministic testability required for rollback networking and replays.

## Rollback

Remove the M1 production scaffold and continue serving the B01 `dist/` baseline. The rollback reference is branch `baseline-b01` at `a3af993cad5a5be830d61bd03a6d89e79fc99f1f`.
