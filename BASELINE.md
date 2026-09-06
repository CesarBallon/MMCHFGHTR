# Canonical asset baseline — 2026-09-06

This file defines what belongs in the shared online repository. A future asset becomes canonical only when its pull request updates this document, the appropriate fighter/stage documentation, the machine validation contract, and the active milestone packet.

## Included

| Asset class | Canonical location | Runtime location |
| --- | --- | --- |
| Eight full-body fighter models | `source-assets/canonical-models-v16/` | Derived selections, portraits and atlases below |
| Cleaned action atlases | `source-assets/action-atlases/<fighter>/*.png` | `dist/assets/fighters/actions/<fighter>/*.webp` |
| Selection stance loops | Generated from current canonical models | `dist/assets/fighters/select-v16/*.webp` |
| Face portraits | Generated from current canonical models | `dist/assets/fighters/portraits-v16/*.webp` |
| Legacy-format fighter sheets | Current runtime compatibility files | `dist/assets/fighters/<fighter>.webp` |
| Stages | Current optimized exports | `dist/assets/stages/*.webp` |
| Soundtrack | Current supplied stereo masters | `dist/assets/audio/soundtrack/` |
| Sound effects | Current 48 kHz WAV exports | `dist/assets/audio/sfx/` |
| UI illustrations | Current optimized exports | `dist/assets/ui/` |

The eight canonical fighters are Saja, Benita, Mariachay, Asunta, Shabuka, Bella, Jarjacha and Coraima. Jarjacha replaces Jarana everywhere.

Each fighter has exactly four current 4 × 4 action atlases: locomotion, combat, special 1 and special 2. The engine samples them at a minimum authored perception of 16 fps, blends adjacent frames, mirrors toward the opponent, and draws ground shadows separately.

## Explicitly excluded from the shared repository

- `dist/assets/fighters/idle/`
- `dist/assets/fighters/portraits-v11/`
- `dist/assets/fighters/select-v11/`
- `source-assets/idle-inbetweens/`
- `source-assets/idle-keyframes/`
- `source-assets/roster-cutouts/`
- `source-assets/roster-source/`
- raw/checkerboard action-atlas intermediates under `source-assets/action-atlases/*/raw/`
- the pre-baseline Git history

These files remain recoverable from the separate prototype-history bundle. They must not be reintroduced simply for comparison or rebuild convenience.

The shared repository also excludes the live `.openai/hosting.json` because it contains deployment-specific project metadata. A neutral `.openai/hosting.example.json` documents the static output configuration.

The exact baseline bytes are recorded in `docs/assets/SHA256SUMS.txt`. After an approved asset replacement, regenerate the file with `npm run assets:manifest`; CI rejects unrecorded binary changes.

## Prototype backup

The complete earlier repository history was exported as `Mamacha_Fighter_Prototype_Backup_2026-09-06.bundle`, split into nine separately stored parts, and verified before the clean baseline was created.

- Complete bundle SHA-256: `4e25f91429a44974f63454f25be1912f343e7c5a90819337503995d1a307dbaa`
- Archived head: `17841656c37d929fad4861681f6ca9f80f4c7d36`
- Restoration instructions: stored with the backup as `RESTORE.md`

## Change rule

Do not overwrite a canonical file without recording:

1. the approving issue and pull request;
2. visual/audio comparison evidence;
3. creator, source and rights/provenance;
4. affected runtime exports;
5. validation results; and
6. a rollback reference.
