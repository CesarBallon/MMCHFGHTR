# Mamacha Fighter product roadmap

Status date: 2026-09-06

## Product goal

Ship a polished, shareable browser fighting game whose combat remains responsive on keyboard and controllers, supports reliable online 1v1 play, gives every fighter a complete story route, culminates in three non-playable boss encounters, and maintains a fair seasonal ranking system.

The roadmap deliberately separates **combat quality**, **content**, and **network trust**. Online ranking should not be built on top of a simulation that is still changing unpredictably.

## Milestones

| Milestone | Outcome | Required exit criteria |
| --- | --- | --- |
| M0 — Prototype baseline | Preserve the current eight-fighter, eight-stage build as a known reference | All eight fighters selectable; controller and keyboard input work; action atlases validate; current stages and soundtrack mappings documented |
| M1 — Production foundation | Convert the monolithic prototype into a testable, deterministic game client | TypeScript modules; data-driven fighter definitions; fixed-step deterministic simulation; replayable input log; automated unit, asset, and smoke tests; performance budget established |
| M2 — Combat vertical slice | One production-quality matchup proves the final feel | Two fighters fully animated; hitboxes/hurtboxes visualized; throws, crouching, jumping, blocking, hit stop, cancel rules and supers tuned; stable 60 Hz simulation and 16+ unique source frames per second where motion requires them |
| M3 — Arcade and story | Every playable fighter has a complete solo route | Eight approved story outlines; intro/rival/boss/ending scenes; save progress; localization-ready dialogue format; accessibility settings; three boss identities and mechanics approved |
| M4 — Full roster and bosses | All content reaches feature-complete alpha | Eight fighters and three NPC bosses production-ready; stage hazards remain cosmetic; balance telemetry; training mode; command lists; CPU difficulty tiers |
| M5 — Online unranked | Real players can finish stable remote matches | Lobby/matchmaking; region and latency display; rollback or equivalent latency compensation; reconnect/forfeit rules; spectator-ready replay format; load and soak tests |
| M6 — Accounts and ranked beta | Competitive results are durable and trustworthy | Account identity; authoritative result validation; placement matches; rating service; seasons; leaderboards; disconnect penalties; moderation and privacy controls; operations runbook |
| M7 — Public launch | A monitored release is available at a stable URL | Public deployment; custom domain decision; error/performance monitoring; backups; incident response; release notes; legal/credits review; launch rollback plan |
| M8 — Live operations | The game can improve without destabilizing competition | Balance cadence; season rollover; replay compatibility policy; public known-issues board; content pipeline; post-season reports |

## Immediate delivery sequence

1. Freeze the clean canonical B01 baseline with a tagged release in the shared GitHub repository.
2. Write Architecture Decision Records (ADRs) for engine modularization, network transport, backend host, identity, and asset storage.
3. Build M1 on a development branch while `main` remains playable.
4. Select two fighters for the M2 vertical slice; avoid remaking the entire roster before the combat pipeline is proven.
5. Define the three bosses before producing their expensive animation and audio assets.

## Decisions intentionally left open

- Boss names, visual designs, motives, and final mechanics
- Public versus private source repository and contribution license
- Backend provider and account sign-in method
- Rollback library versus custom implementation
- Ranked rating formula after match-volume testing
- Custom production domain and public launch date

Each decision becomes an ADR before implementation. See [the ADR template](docs/adr/0000-template.md).
