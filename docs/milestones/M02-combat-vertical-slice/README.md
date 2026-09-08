# M02 — Combat vertical slice

Status: **In progress — pairing approved and milestone initialized**  
Tracking issue: [#15](https://github.com/CesarBallon/MMCHFGHTR/issues/15)  
Decision: [ADR 0003](../../adr/0003-m02-benita-saja-vertical-slice.md)  
Base: `ae1f7aaefb026bb4688f23c2c9657cbc57a76724`  
Working branch: `milestone/m02-combat-vertical-slice`

## Goal

Prove the final combat feel, animation pipeline and test discipline through one production-quality matchup: **Benita versus Saja**.

## Approved fighters

| Fighter | Role in the slice | Signature specials |
| --- | --- | --- |
| Benita | Heavy, close-range authority and deliberate movement | Beer Bath; Hidden Shot |
| Saja | Mobile whip fighter with extended reach and space control | Braid Lash; Saya Wave |

## Scope

- facing-aware idle stance with subtle authored breathing
- forward/back walk, crouch, jump, landing and turnaround
- standing and crouching normals, throw, block, hit reaction, knockdown and recovery
- two canonical special moves and one super per fighter
- attached, grounded shadows driven by fighter position and pose
- visible hitbox, hurtbox, pushbox and throw-range debug overlays
- deterministic hit stop, block rules, cancel windows, meter and super behavior
- keyboard and standard game-controller support
- local-versus browser validation on the production client
- documented animation, asset, performance and rollback evidence

## Out of scope

- production animation for the remaining six fighters
- story mode, bosses, matchmaking, accounts and ranking
- final balance for the full roster
- cosmetic stage hazards

## Exit criteria

- [ ] Benita and Saja use approved canonical models for all M02 assets.
- [ ] Required movement and combat states are complete and facing-correct.
- [ ] Motion uses at least 16 unique authored source frames per second where required.
- [ ] Combat simulation remains deterministic at fixed 60 Hz.
- [ ] Throws, crouching, jumping, blocking, hit stop, cancels and supers are playable. **Pushboxes, throws, hit stop and normal-to-special hit confirms implemented; supers pending.**
- [ ] Hitbox/hurtbox/pushbox/throw-range overlays are available in a debug mode.
- [ ] Shadows remain visually attached through every grounded and airborne state.
- [ ] Keyboard and controller smoke paths pass for Benita versus Saja.
- [ ] Unit, browser, asset-integrity and performance suites pass.
- [ ] The asset manifest, test report, release notes, changelog and retrospective are complete.
- [ ] `main` remains playable and releasable.

## Delivery slices

1. Define animation-state, frame-data, collision and cancel contracts. **Implemented in PR #16; CI pending.**
2. Integrate debug overlays and deterministic combat mechanics. **Core collision, debug snapshot and Canvas overlay renderer implemented in PR #16.**
3. Produce and validate Benita’s complete M02 atlas set.
4. Produce and validate Saja’s complete M02 atlas set.
5. Tune the matchup and complete keyboard/controller browser coverage.
6. Close documentation, record evidence and tag `m2`.

Each slice is delivered through a focused pull request linked to issue #15.

## Rollback

Until M02 closes, the rollback target is M01 main commit `ae1f7aaefb026bb4688f23c2c9657cbc57a76724`. The completed packet will replace this with the final M01 tag and exact pre-M02 release target.

## Retrospective

To be completed at closeout. Record which pipeline, frame-data and testing decisions must change before full-roster production begins.
