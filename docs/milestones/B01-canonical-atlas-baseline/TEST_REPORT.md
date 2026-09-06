# B01 test report

## Required checks

```bash
npm test
```

Equivalent dependency-free commands:

```bash
node --check dist/game.js
node tools/validate-project.mjs
```

## Coverage

- JavaScript syntax
- eight canonical fighter IDs and no retired Jarana identifier
- eight canonical PNG models
- 32 cleaned PNG source atlases
- 32 optimized WebP runtime atlases
- current selection and portrait assets
- eight stages and the required stereo soundtrack files
- rejection of superseded and raw-intermediary directories
- rejection of temporary files in `dist/`

## Results

Local baseline validation on 2026-09-06: **pass**.

- 8 fighters
- 32 cleaned source/runtime action-atlas pairs
- 8 stages
- 11 soundtrack files
- 138 checksummed baseline assets
- 88 canonical, atlas, selection and portrait images passed decoder integrity checks

Independent clean-clone validation on 2026-09-06: **pass**. The clean clone matched the baseline commit, passed the full structural validator, and reproduced the 138-file SHA-256 asset manifest.

GitHub remote verification on 2026-09-06: **pass** at commit `7d4fbd77acf615bf5624bebaa3cfc07afbaeb55f`. A fresh public clone contained 180 tracked files, passed JavaScript syntax and structural validation, reproduced all 138 recorded asset hashes, and confirmed that the live Sites hosting manifest was not exposed.

Browser visual QA was not requested for this migration; gameplay rendering is unchanged from the validated source lineage.
