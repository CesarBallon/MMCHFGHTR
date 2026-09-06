# M00 test report

## Automated baseline

Command:

```bash
node --check dist/game.js
node tools/validate-project.mjs
```

Result on 2026-09-06: pass.

Validated:

- JavaScript syntax
- eight expected roster identifiers
- four action atlases for each fighter (32 total)
- selection and portrait assets for each fighter
- eight canonical character models
- eight stage backgrounds
- eight fighter themes plus intro/selection and end-credits tracks
- absence of the retired `Jarana` identifier in game logic
- absence of temporary files in the runtime distribution

## Manual evidence inherited from prototype iterations

- Keyboard and controller input were implemented and exercised during the prototype cycle.
- Direction-aware mirroring, stance rendering, character-relative scale, crouching and action-atlas playback were visually iterated.
- Stage/theme assignments were verified in source data.

## Limitations

This baseline predates a formal device/browser test matrix. M1 must introduce reproducible browser smoke tests and record exact browser, operating-system, device and controller combinations. No remote multiplayer, account or ranking tests apply to M0.
