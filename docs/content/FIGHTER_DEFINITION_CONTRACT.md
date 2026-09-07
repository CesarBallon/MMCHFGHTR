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
