import { describe, expect, test } from 'vitest';
import { hashMatchState, InputFlag, runReplay, SIMULATION_HZ, type Replay } from '../../src/core';

const replay: Replay = {
  version: 1,
  seed: 0x4d4d4348,
  inputs: Array.from({ length: 180 }, (_, frame) => ({
    frame,
    players: [frame < 60 ? InputFlag.Right : frame === 60 ? InputFlag.Up : frame > 120 ? InputFlag.Down : 0, frame < 90 ? InputFlag.Left : 0],
  })),
};

describe('deterministic combat foundation', () => {
  test('advances at the agreed simulation rate', () => {
    expect(SIMULATION_HZ).toBe(60);
    expect(runReplay(replay).frame).toBe(180);
  });

  test('reproduces identical state and hash from identical inputs', () => {
    const first = runReplay(replay);
    const second = runReplay(JSON.parse(JSON.stringify(replay)) as Replay);
    expect(second).toEqual(first);
    expect(hashMatchState(second)).toBe(hashMatchState(first));
  });

  test('changes the final hash when an input changes', () => {
    const changed: Replay = { ...replay, inputs: replay.inputs.map((entry) => entry.frame === 20 ? { ...entry, players: [InputFlag.Left, entry.players[1]] } : entry) };
    expect(hashMatchState(runReplay(changed))).not.toBe(hashMatchState(runReplay(replay)));
  });

  test('rejects input logs with discontinuous frame numbers', () => {
    const invalid: Replay = { ...replay, inputs: [{ frame: 1, players: [0, 0] }] };
    expect(() => runReplay(invalid)).toThrow(/does not match/);
  });

  test('supports deterministic crouching and jumping state', () => {
    const state = runReplay(replay);
    expect(state.fighters[0].crouching).toBe(true);
    expect(state.fighters[0].grounded).toBe(true);
    expect(state.fighters[0].facing).toBe(1);
    expect(state.fighters[1].facing).toBe(-1);
  });
});
