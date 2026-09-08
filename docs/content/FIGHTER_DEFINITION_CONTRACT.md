# Fighter definition contract

Status: **M1 schema approved for implementation review**

The production client represents fighters and moves as validated data. Legacy constants remain unchanged until all canonical definitions are proven equivalent.

## Deterministic rules

- Simulation durations are integer frames at 60 Hz.
- Authored combat animation clips run at 16–60 frames per second.
- Positions and velocities use 1,000 fixed units per rendered pixel.
- Damage, health, meter and permille multipliers are integers.
- Invalid or unsupported schema versions fail closed.

Each fighter declares identity, presentation assets, home stage/theme, stats, unique moves and exactly two signature specials. Each move declares its input, frame data, reach, damage, stun, meter behavior and animation clip. Runtime validation rejects unknown identifiers, fractional or out-of-range values, wrong asset paths, duplicate IDs and incomplete rosters.

Migration proceeds by validating all eight definitions and repository assets before switching any legacy consumer.


## M02 combat-presentation extension

`src/content/combat-contract.ts` adds a separate versioned contract for production animation and collision authoring. It does not invalidate or silently widen the M01 fighter schema.

Each production fighter contract declares:

- the complete M02 locomotion, defense and reaction state set
- move-specific animation states
- authored source-frame rate from 16 through 60 fps
- deterministic per-source-frame duration in 60 Hz simulation ticks
- integer root motion
- per-frame hurtboxes and uniquely identified hitboxes
- foot anchors and attached-shadow placement
- mirror or explicitly authored facing behavior
- move startup, active and recovery timing
- bounded, typed cancel windows with hit-confirm restrictions

Gameplay timing remains fixed at 60 Hz and never derives from rendering cadence. Animation source frames may span one or more simulation ticks. Collision and root-motion values use integer coordinates so the same ordered input stream remains replayable.

A complete M02 fighter must provide every state in `REQUIRED_M02_ANIMATION_STATES`. Authoring tools may validate incomplete work with the explicit partial mode, but CI acceptance uses complete validation.


### Runtime interaction semantics

The M02 runtime consumes the contract rather than treating it as renderer-only metadata. Grounded pushbox dimensions prevent overlap; hitboxes mirror with facing; throw range is explicit in debug output; and cancel windows are evaluated by simulation frame. Throw is a distinct input token. Shared hit stop freezes fighter state while global deterministic time continues.
