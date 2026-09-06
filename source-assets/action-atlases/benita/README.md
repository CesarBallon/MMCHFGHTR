# Benita action atlases

These transparent 4 × 4 atlases are derived from Benita's current canonical model and preserve her heavy grappler-inspired movement language.

- `locomotion.png`: guarded stance, deliberate walk, crouch, and jump rows.
- `combat.png`: fast punch, heavy body blow, block, and hit-reaction rows.
- `beer-bath.png`: sixteen sequential frames for Beer Bath.
- `revolver.png`: sixteen sequential frames for Hidden Shot.

The game samples action timing at 16 fps and interpolates adjacent frames during rendering. Benita is authored facing right; the renderer mirrors every atlas around a stable foot anchor whenever her opponent changes sides. Ground shadows are rendered separately by the engine.
