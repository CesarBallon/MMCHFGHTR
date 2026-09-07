import { createInitialState, stepMatch } from './simulation';
import type { MatchState, Replay } from './types';

export function runReplay(replay: Replay): MatchState {
  if (replay.version !== 1) throw new Error(`Unsupported replay version ${String(replay.version)}`);
  let state = createInitialState(replay.seed);
  for (const entry of replay.inputs) {
    if (entry.frame !== state.frame) throw new Error(`Replay frame ${entry.frame} does not match simulation frame ${state.frame}`);
    state = stepMatch(state, entry.players);
  }
  return state;
}
