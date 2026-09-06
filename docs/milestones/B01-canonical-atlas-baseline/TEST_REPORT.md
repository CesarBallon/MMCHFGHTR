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

GitHub remote verification remains pending until the authenticated push completes.

Browser visual QA was not requested for this migration; gameplay rendering is unchanged from the validated source lineage.
