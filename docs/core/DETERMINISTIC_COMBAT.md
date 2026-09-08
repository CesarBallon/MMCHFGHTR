# Deterministic combat contract

Status: **M1 implementation review**

The DOM-free core advances at 60 simulation frames per second. Match state is
fully serializable and hashable; rendering, audio and network transport cannot
alter combat outcomes.

## Input and action rules

- Attack and jump commands trigger on their rising edge. Holding a button does
  not repeat the command.
- Movement and blocking remain held-state inputs.
- Replay boundaries reject unknown fighters, malformed seeds and unsupported
  input bits before advancing simulation state.
- A fighter cannot move, block or begin another move during attack recovery or
  hit/block stun.
- Attacks can connect on any authored active frame and hit at most once.
- Simultaneous hit events are collected before damage is applied, allowing
  deterministic trades without player-order priority.

## Damage and meter

- Move damage, reach, timing, stun and meter values come from canonical fighter
  definitions.
- Integer power and defense permille modifiers produce integer damage.
- Blocking requires the explicit block state, applies chip damage and block
  stun, and awards reduced meter to the attacker.
- Meter is clamped to the deterministic 1,000-point maximum.

## Rounds

- Health reaching zero enters a 120-frame round-over phase.
- A non-draw winner receives one round win.
- Fighters reset to their canonical health for the next round.
- The first fighter to earn two round wins becomes the match winner.

The legacy `dist/` client remains the playable public implementation until its
renderer and input adapters consume this core in a separately reviewed slice.


## M02 authored collision integration

Benita and Saja resolve hits from their validated per-frame combat contracts. Local boxes are transformed into fixed-scale world coordinates according to the fighter's current facing. Intersection uses strict axis-aligned bounds and remains independent of rendering cadence.

The remaining six fighters retain the M01 distance check until their production contracts are authored. This fallback is explicit and covered by tests; it prevents M02 from silently changing the rest of the roster.

`createCombatDebugSnapshot` exposes a read-only, renderer-neutral view of each fighter's current animation state, source frame, foot anchor, attached shadow, hurtboxes, hitboxes, pushbox and throw range. Debug visualization consumes this snapshot without mutating match state, so enabling overlays cannot change a replay hash or combat result.


## M02 advanced interaction rules

- Grounded pushboxes separate overlapping fighters symmetrically using fixed-scale integer positions. Airborne crossing remains legal.
- Throw is a rising-edge input. A throw connects only against an in-range grounded opponent, ignores normal blocking, and enters authored `throw`/`thrown` states.
- Simultaneous valid throws produce a deterministic throw tech with no damage.
- A successful strike or throw starts five shared hit-stop frames. Match time and seeded randomness advance, while fighter actions, movement and stun remain frozen.
- Inputs pressed and held during hit stop remain eligible on the first resumed frame.
- M02 normal moves may cancel into a special only inside their authored active-frame window and only after a confirmed hit.
- Hit stop is part of serialized match state and its replay hash.


## M02 super rules

- A super command is the rising edge of Special 1 and Special 2 on the same simulation frame.
- Activation requires the full 1,000-point meter and spends it atomically.
- Super startup creates 12 shared super-freeze frames. Match time and seeded randomness advance while both fighter states remain frozen.
- Super-freeze duration and owner are serialized and hashed.
- A held command during ordinary hit stop is evaluated on the first resumed frame, allowing an authored hit-confirm cancel into super.
- Benita's provisional super is **Last Call**; Saja's is **Braid Tempest**. Names and balance values are M02 tuning data.
