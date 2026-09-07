import type { MatchState } from './types';

function mix(hash: number, value: number): number {
  let next = hash;
  for (let shift = 0; shift < 32; shift += 8) {
    next ^= (value >>> shift) & 0xff;
    next = Math.imul(next, 0x01000193);
  }
  return next >>> 0;
}

export function hashMatchState(state: MatchState): string {
  let hash = 0x811c9dc5;
  hash = mix(hash, state.frame);
  hash = mix(hash, state.randomState);
  for (const fighter of state.fighters) {
    hash = mix(hash, fighter.x); hash = mix(hash, fighter.y);
    hash = mix(hash, fighter.velocityX); hash = mix(hash, fighter.velocityY);
    hash = mix(hash, fighter.health); hash = mix(hash, fighter.meter);
    hash = mix(hash, Number(fighter.grounded)); hash = mix(hash, Number(fighter.crouching));
    hash = mix(hash, fighter.facing);
  }
  return hash.toString(16).padStart(8, '0');
}
