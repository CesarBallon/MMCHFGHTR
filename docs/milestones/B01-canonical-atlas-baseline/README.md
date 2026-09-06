# B01 — Canonical atlas baseline

- Date: 2026-09-06
- Status: complete after GitHub and Sites publication checks
- Shared repository: `https://github.com/CesarBallon/MMCHFGHTR`
- Source lineage: Sites commit `17841656c37d929fad4861681f6ca9f80f4c7d36`

## Goal

Create a clean, collaborative repository baseline containing the latest approved character models and all current action atlases without carrying superseded prototype assets or the large experimental Git history.

## Exit criteria

| Criterion | Evidence | Result |
| --- | --- | --- |
| Eight latest canonical models included | `source-assets/canonical-models-v16/` | Pass |
| Four cleaned action atlases per fighter | `source-assets/action-atlases/` and validator | Pass |
| Runtime uses all current atlases | `dist/game.js` and validator | Pass |
| Current portraits and selection loops included | `portraits-v16/`, `select-v16/` | Pass |
| Superseded assets absent | baseline validator forbidden-path checks | Pass |
| Previous history independently restorable | verified Git bundle + checksums | Pass |
| Shared contribution controls present | `.github/`, `CONTRIBUTING.md`, workflow | Pass |
| Clean checkout runs validation | `TEST_REPORT.md` | Pending final remote-clone check |

## Packet

- [Changes](CHANGELOG.md)
- [Test report](TEST_REPORT.md)
- [Asset manifest](ASSET_MANIFEST.md)
- [Release notes](RELEASE_NOTES.md)
- [Repository baseline definition](../../../BASELINE.md)

## Rollback

Reconstruct and clone the separately stored prototype bundle. Its archived head is the source lineage commit stated above.

## Retrospective

The earlier repository preserved valuable experimentation but mixed current and superseded visual assets. B01 makes canonical status enforceable. Future regeneration work must stage raw intermediates outside Git and promote only reviewed, cleaned sources plus optimized runtime exports.
