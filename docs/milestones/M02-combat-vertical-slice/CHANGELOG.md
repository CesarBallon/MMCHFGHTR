# M02 changelog

Status: **In progress**

## Added

- Saja’s Braid Tempest and Benita’s Last Call full-meter supers.
- Simultaneous two-special super command and atomic 1,000-meter spending.
- Twelve-frame deterministic super freeze included in replay hashes.
- Normal-to-super hit-confirm cancels and dedicated super tests.
- Deterministic grounded pushbox separation and airborne crossover behavior.
- Throw input, throw/throw-reaction states, blocking immunity and simultaneous throw techs.
- Five-frame shared hit stop with held-input buffering.
- Executable hit-confirm-only normal-to-special cancel windows for Benita and Saja.
- Replay/hash and interaction coverage for the new mechanics.
- Initial validated Benita and Saja runtime combat contracts.
- Facing-aware authored collision resolution with an explicit fallback for the other six fighters.
- Renderer-neutral hitbox, hurtbox, pushbox, throw-range, foot-anchor and shadow debug snapshots.
- Canvas overlay renderer with fixed-scale projection and distinct collision-volume styling.
- Core integration tests for active frames, mirroring, pose selection, shadow attachment and fallback behavior.
- Versioned production combat-presentation schema for animation states, frame timing, collision volumes, anchors, shadows and cancel windows.
- Unit coverage for completeness, deterministic integers, source-frame rate, collision dimensions, anchor metadata and cancel bounds.
- Approved Benita–Saja production vertical-slice scope.
- M02 tracking issue, acceptance criteria and milestone packet.
- ADR 0003 recording the fighter-pairing decision.

## Changed

- No player-visible runtime changes in the milestone-initialization slice.

## Pending

- Collision and cancel data contracts — complete
- combat debug overlays — deterministic snapshot API and Canvas renderer complete
- complete Benita and Saja animation sets
- throws, supers and final matchup tuning
- M02 browser, performance and asset evidence
