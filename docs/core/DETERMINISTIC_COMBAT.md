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
