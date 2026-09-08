import type { MatchState } from "./types";

function mix(hash: number, value: number): number {
  let next = hash;
  for (let shift = 0; shift < 32; shift += 8) {
    next ^= (value >>> shift) & 0xff;
    next = Math.imul(next, 0x01000193);
  }
  return next >>> 0;
}

function mixText(hash: number, value: string): number {
  let next = hash;
  for (const character of value)
    next = mix(next, character.codePointAt(0) ?? 0);
  return next;
}

export function hashMatchState(state: MatchState): string {
  let hash = 0x811c9dc5;
  hash = mix(hash, state.frame);
  hash = mix(hash, state.randomState);
  hash = mixText(hash, state.phase);
  hash = mix(hash, state.phaseFrames);
  hash = mix(hash, state.round);
  hash = mix(hash, state.roundWins[0]);
  hash = mix(hash, state.roundWins[1]);
  hash = mix(hash, state.roundWinner ?? -1);
  hash = mix(hash, state.matchWinner ?? -1);
  hash = mix(hash, state.previousInputs[0]);
  hash = mix(hash, state.previousInputs[1]);
  hash = mix(hash, state.hitStopFrames);
  hash = mix(hash, state.superFreezeFrames);
  hash = mix(hash, state.superFreezeOwner ?? -1);
  for (const fighter of state.fighters) {
    hash = mixText(hash, fighter.fighterId);
    hash = mixText(hash, fighter.action);
    hash = mix(hash, fighter.x);
    hash = mix(hash, fighter.y);
    hash = mix(hash, fighter.velocityX);
    hash = mix(hash, fighter.velocityY);
    hash = mix(hash, fighter.health);
    hash = mix(hash, fighter.meter);
    hash = mix(hash, Number(fighter.grounded));
    hash = mix(hash, Number(fighter.crouching));
    hash = mix(hash, fighter.facing);
    hash = mix(hash, fighter.actionFrame);
    hash = mix(hash, Number(fighter.hitResolved));
    hash = mix(hash, fighter.stunFrames);
  }
  return hash.toString(16).padStart(8, "0");
}
