# Mariachay action atlases

- `locomotion.png`: quick guard, walk, crouch, and jump.
- `combat.png`: fast strike, heavy lunge, block, and hit reaction.
- `rolling-rush.png`: sixteen sequential rolling-rush frames.
- `sky-slap.png`: sixteen sequential airborne-slap frames.

The renderer samples these at 16 fps, interpolates adjacent poses, mirrors them toward the opponent, and supplies a separate grounded shadow.
