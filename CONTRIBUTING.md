# Contributing to Mamacha Fighter

Thank you for helping improve the game. Until a public license and contributor terms are approved, access to the repository does not grant permission to reuse its code, characters, art, audio or story outside this project.

## Before starting

1. Open or claim an issue and agree on acceptance criteria.
2. Identify the milestone and whether the change affects gameplay compatibility.
3. For new canonical art, music, voices, fonts or writing, document creator, permission, source files and intended rights.
4. Record architecture-changing proposals as an ADR before implementation.

## Branches and commits

Use focused branches such as `feature/rollback-prototype`, `fix/bella-hitbox`, `content/saja-ending`, or `assets/benita-idle`. Keep unrelated regenerated binaries out of the same pull request.

Commit messages should state the outcome in imperative form. Never commit credentials, private player data, build secrets or unlicensed reference material.

## Pull requests

A pull request must:

- explain player-visible behavior and technical approach
- link its issue and milestone
- include before/after captures for visual changes and listening notes for audio changes
- state controller, keyboard, browser and device tests that apply
- update `CHANGELOG.md` and relevant design/milestone documentation
- pass `npm test`
- identify compatibility, schema, replay and rollback implications
- state asset rights/provenance for every new external asset

## Review areas

- Combat changes: frame data, hitboxes/hurtboxes, cancel rules, determinism and balance impact
- Networking/ranking: threat model, idempotency, disconnect behavior, replay evidence and load testing
- Visual assets: canonical-model match, transparency/cropping, feet/shadow contact, relative character scale and motion readability
- Narrative: continuity, characterization, localization, cultural review and content rating
- Audio: stereo mix, loop boundaries, loudness consistency, attribution and usage rights

## Definition of done

Follow [the milestone process](docs/MILESTONE_PROCESS.md). Maintainers may request that broad proposals be split into smaller pull requests.
