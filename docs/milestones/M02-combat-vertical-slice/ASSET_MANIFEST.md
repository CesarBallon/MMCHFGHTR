# M02 asset manifest

Status: **Initialized — no production assets added yet**

## Canonical inputs

| Fighter | Canonical model | M01 runtime references |
| --- | --- | --- |
| Benita | `source-assets/canonical-models-v16/benita.png` | selection, portrait and combat atlases recorded in the baseline manifest |
| Saja | `source-assets/canonical-models-v16/saja.png` | selection, portrait and combat atlases recorded in the baseline manifest |

The canonical model files above remain identity references. New animation assets must preserve costume, body proportions, facial identity, palette and distinguishing equipment.

## Planned production sets

For each fighter:

- idle/facing and turnaround
- forward and backward walk
- crouch enter, hold and exit
- jump start, rise, apex, fall and landing
- standing and crouching normals
- throw and throw reaction
- standing/crouching/air block
- light/heavy hit reactions
- knockdown, ground state and recovery
- two signature specials
- one super
- attached shadow metadata or renderer anchors

## Acceptance rules

- Transparent backgrounds with clean alpha and no white matte contamination.
- Stable foot/contact anchors and pose-specific visual bounds.
- At least 16 unique authored source frames per second where continuous motion requires it.
- Animation timing is separated from fixed 60 Hz gameplay timing.
- Left/right presentation uses deterministic facing rules; avoid duplicated mirrored source assets unless asymmetry requires them.
- Every added or replaced asset records path, dimensions, checksum, source/provenance, approval and license status.
- Generated previews and rejected prototypes are not committed as canonical assets.

## Added or replaced assets

No binary assets are added in this mechanics slice. Braid Tempest temporarily references Saja’s existing `braid-lash` atlas, and Last Call temporarily references Benita’s existing `revolver` atlas for timing and collision integration. Dedicated super atlases remain required before M02 closeout; these references must not be treated as final art.

## Provenance and licensing

No new asset license assertions are made by this document. Provenance and approval must be filled in for every delivered production asset before milestone closeout.
