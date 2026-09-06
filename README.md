# Mamacha Fighter

An original Andean-inspired browser fighting game built as a dependency-free HTML5 Canvas application.

## Play modes

- Arcade: one player versus CPU
- Versus: two players on one keyboard or two controllers

## Controls

| Action | Player 1 | Player 2 | Gamepad |
| --- | --- | --- | --- |
| Move / jump / crouch | W A S D | Arrow keys | D-pad / left stick |
| Light attack | J | Numpad 1 | A |
| Heavy attack | K | Numpad 2 | X |
| Special 1 | L | Numpad 3 | B |
| Special 2 | I | Numpad 5 | Y |
| Block | U | Numpad 0 | LB / RB |

## Fighters

Saja, Benita, Mariachay, Asunta, Shabuka, Bella, Jarjacha, and Coraima each have distinct movement statistics and two signature special attacks.

## Home stages

| Fighter | Stage | Stage theme |
| --- | --- | --- |
| Saja | Lake Titicaca — Winter | Saja Theme |
| Benita | Prison Yard | Benita Theme |
| Mariachay | Machu Picchu — Dawn | Mariachay Theme |
| Asunta | Lima — Red Light | Asunta Theme |
| Shabuka | The Forgotten Big Top | Shabuka Theme |
| Bella | Cumbia Megaconcert | Bella Theme |
| Jarjacha | Mercado Central | Jarjacha Theme |
| Coraima | Arequipa — Misti Warning | Coraima Theme |

## Technical notes

- Fixed-step 60 Hz combat simulation with requestAnimationFrame rendering
- Dedicated stance-preserving idle loops and full 16-fps action atlases for the entire eight-fighter roster
- Direction-aware mirroring, walking, jumping, crouching, blocking, hit reactions, normal attacks, and special attacks
- Enlarged stage rendering and clean sprite-based selection portraits
- Keyboard, touch, and standard Gamepad API input
- Best-of-three rounds, timer, blocking, hit stun, projectiles, meter, particles, screen shake, AI, and rematches
- Eight stage backgrounds and nine original music cues
- No external runtime dependencies

Open `dist/index.html` from a static HTTP server to run locally.

## Canonical baseline

This repository starts from the **2026-09-06 canonical atlas baseline**. It contains only the current runtime assets, cleaned 16-frame action atlases, current selection/portrait loops, and the latest approved full-body models for all eight fighters. Superseded prototype assets and the earlier Git history are archived separately.

- [Baseline definition](BASELINE.md)
- [Baseline milestone record](docs/milestones/B01-canonical-atlas-baseline/README.md)

## Project direction

The current build is the **gameplay prototype**. The target product is a shareable online fighting game with character story campaigns, three non-playable final bosses, rollback-capable multiplayer, accounts, and seasonal rankings.

- [Product roadmap](ROADMAP.md)
- [Target architecture](docs/ARCHITECTURE.md)
- [Story and boss framework](docs/STORY_BIBLE.md)
- [Online play and ranking design](docs/ONLINE_AND_RANKING.md)
- [How milestones are documented](docs/MILESTONE_PROCESS.md)
- [How to contribute](CONTRIBUTING.md)
- [Shared Git migration plan](docs/SHARED_GIT_MIGRATION.md)

## Local validation

Requires Node.js 20 or newer:

```bash
npm test
```

This checks JavaScript syntax, the roster contract, action atlases, stages, music, canonical models, and accidental temporary files.
