# M01 — Production foundation

Status: **In progress**
Tracking issue: [#6](https://github.com/CesarBallon/MMCHFGHTR/issues/6)
Base: `64cb5af5147252fcd9b2a82dd8b2718e7368fd29`

## Goal

Convert the playable Canvas prototype into a modular, testable and deterministic client without destabilizing the public baseline.

## Scope

- TypeScript module and build/test foundation
- data-driven fighter and move definitions
- DOM-free deterministic combat core
- fixed 60 Hz simulation
- seeded randomness
- replayable input log and state hashes
- automated unit, asset and browser smoke tests
- measured performance budgets

## Decision gates

Implementation depends on ADR issues [#1](https://github.com/CesarBallon/MMCHFGHTR/issues/1) through [#5](https://github.com/CesarBallon/MMCHFGHTR/issues/5).

## Exit criteria

See the checklist in [#6](https://github.com/CesarBallon/MMCHFGHTR/issues/6). This milestone remains incomplete until every criterion is supported by evidence in this packet.

## Rollback

The playable baseline is preserved by branch `baseline-b01` at `a3af993cad5a5be830d61bd03a6d89e79fc99f1f`.
