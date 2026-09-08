# M02 changelog

Status: **In progress**

## Added

- Initial validated Benita and Saja runtime combat contracts.
- Facing-aware authored collision resolution with an explicit fallback for the other six fighters.
- Renderer-neutral hitbox, hurtbox, pushbox, throw-range, foot-anchor and shadow debug snapshots.
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
- combat debug overlays — deterministic snapshot API complete; renderer pending
- complete Benita and Saja animation sets
- throws, supers and final matchup tuning
- M02 browser, performance and asset evidence
