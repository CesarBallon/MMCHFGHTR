# M00 — Prototype baseline

- Owner: Project owner
- Status: complete baseline / not public-launch quality
- Reference commit before governance setup: `6d9dbabea0c667b6e8a6b2aebb4b62d7872ef5c5`
- Saved Site version: 28
- Production URL: `https://mamacha-fighter.spry-spice-2125.chatgpt.site`

## What exists

- Eight playable fighters with distinct data and two signature specials each
- Four action atlases per fighter covering locomotion, combat and both specials
- Keyboard, touch and standard controller input
- Crouching, jumping, movement, blocking, hit reactions, normals, specials and AI
- Eight assigned home stages and fighter themes
- Title, selection, local versus and arcade flows
- Fixed-step 60 Hz combat simulation and Canvas rendering

## Known gaps

- Source is still a monolithic browser prototype rather than a modular production client.
- No account, remote multiplayer, matchmaking, ranking, backend persistence or anti-cheat boundary exists.
- Story routes and three final bosses are not implemented or canonically defined.
- Current animation atlas presence is validated, but frame-by-frame combat quality still requires systematic review and tuning.
- The deployed production build may lag the newest saved source version unless explicitly published.

## Baseline use

M00 is the visual and gameplay reference while M1 restructures the code. New work must not silently remove roster members, canonical models, stage/music assignments, controller support or crouching.

## Evidence packet

- [Change record](CHANGELOG.md)
- [Test report](TEST_REPORT.md)
- [Asset manifest](ASSET_MANIFEST.md)
- [Release notes](RELEASE_NOTES.md)
- Architecture decisions: none were formally recorded before M00; [ADR 0001](../../adr/0001-shared-git-as-canonical-source.md) begins the post-baseline process.

## Rollback and retrospective

Rollback target: saved Sites version 28 at the reference commit above.

The prototype proved the roster, presentation direction and content appetite. It also showed that regenerating the full roster before stabilizing the combat pipeline causes repeated asset rework. M1 therefore modularizes and tests the engine; M2 proves the final animation/combat pipeline with two fighters before another full-roster production pass.
