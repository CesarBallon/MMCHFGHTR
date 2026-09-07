import { FIGHTER_IDS } from "../content";
import { createInitialState, stepMatch } from "./simulation";
import type { MatchState, Replay } from "./types";

const INPUT_MASK = (1 << 9) - 1;

function validateReplay(replay: Replay): void {
  if (replay.version !== 1)
    throw new Error(`Unsupported replay version ${String(replay.version)}`);
  if (!Number.isInteger(replay.seed))
    throw new Error("Replay seed must be an integer");
  if (!Array.isArray(replay.inputs))
    throw new Error("Replay inputs must be an array");
  if (
    replay.fighters !== undefined &&
    (!Array.isArray(replay.fighters) ||
      replay.fighters.length !== 2 ||
      replay.fighters.some(
        (id) => !(FIGHTER_IDS as readonly unknown[]).includes(id),
      ))
  )
    throw new Error("Replay fighters must contain two canonical fighter IDs");
}

export function runReplay(replay: Replay): MatchState {
  validateReplay(replay);
  let state = createInitialState(replay.seed, replay.fighters);
  for (const entry of replay.inputs) {
    if (
      !Array.isArray(entry.players) ||
      entry.players.length !== 2 ||
      entry.players.some(
        (input) =>
          !Number.isInteger(input) || input < 0 || (input & ~INPUT_MASK) !== 0,
      )
    )
      throw new Error(
        `Replay frame ${String(entry.frame)} has invalid player inputs`,
      );
    if (entry.frame !== state.frame)
      throw new Error(
        `Replay frame ${entry.frame} does not match simulation frame ${state.frame}`,
      );
    state = stepMatch(state, entry.players);
  }
  return state;
}
