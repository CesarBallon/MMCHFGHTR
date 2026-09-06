# Saja action atlases

These transparent 4 × 4 atlases are derived from Saja's canonical model and are the current source for her combat animation pass.

- `locomotion.png`: stance, walk, crouch, and jump rows.
- `combat.png`: light attack, heavy attack, block, and hit-reaction rows.
- `braid-lash.png`: sixteen sequential frames for Braid Lash.
- `saya-wave.png`: sixteen sequential frames for Saya Wave.

The game samples action timing at 16 fps and interpolates adjacent frames during rendering. Saja is authored facing right; the renderer mirrors every atlas around a stable foot anchor whenever her opponent changes sides.
