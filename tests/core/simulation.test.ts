import { describe, expect, test } from "vitest";
import {
  createInitialState,
  FIXED_SCALE,
  hashMatchState,
  InputFlag,
  runReplay,
  SIMULATION_HZ,
  stepMatch,
  type Replay,
} from "../../src/core";

const replay: Replay = {
  version: 1,
  seed: 0x4d4d4348,
  inputs: Array.from({ length: 180 }, (_, frame) => ({
    frame,
    players: [
      frame < 30
        ? InputFlag.Right
        : frame === 30
          ? InputFlag.Up
          : frame > 120
            ? InputFlag.Down
            : 0,
      frame < 30 ? InputFlag.Left : 0,
    ],
  })),
};

describe("deterministic combat foundation", () => {
  test("advances at the agreed simulation rate", () => {
    expect(SIMULATION_HZ).toBe(60);
    expect(runReplay(replay).frame).toBe(180);
  });

  test("reproduces identical state and hash from identical inputs", () => {
    const first = runReplay(replay);
    const second = runReplay(JSON.parse(JSON.stringify(replay)) as Replay);
    expect(second).toEqual(first);
    expect(hashMatchState(second)).toBe(hashMatchState(first));
  });

  test("changes the final hash when an input changes", () => {
    const changed: Replay = {
      ...replay,
      inputs: replay.inputs.map((entry) =>
        entry.frame === 20
          ? { ...entry, players: [InputFlag.Left, entry.players[1]] }
          : entry,
      ),
    };
    expect(hashMatchState(runReplay(changed))).not.toBe(
      hashMatchState(runReplay(replay)),
    );
  });

  test("rejects input logs with discontinuous frame numbers", () => {
    const invalid: Replay = {
      ...replay,
      inputs: [{ frame: 1, players: [0, 0] }],
    };
    expect(() => runReplay(invalid)).toThrow(/does not match/);
  });

  test("rejects unsupported replay versions at the runtime boundary", () => {
    const invalid = { ...replay, version: 2 } as unknown as Replay;
    expect(() => runReplay(invalid)).toThrow(/Unsupported replay version/);
  });

  test("rejects unknown replay fighters", () => {
    const invalid = {
      ...replay,
      fighters: ["saja", "jarana"],
    } as unknown as Replay;
    expect(() => runReplay(invalid)).toThrow(/canonical fighter IDs/);
  });

  test("rejects unknown input bits", () => {
    const invalid = {
      ...replay,
      inputs: [{ frame: 0, players: [1 << 12, 0] }],
    } as unknown as Replay;
    expect(() => runReplay(invalid)).toThrow(/invalid player inputs/);
  });

  test("uses Saja's canonical 288-pixel-per-second walk speed", () => {
    let state = createInitialState(1);
    const start = state.fighters[0].x;
    for (let frame = 0; frame < SIMULATION_HZ; frame += 1) {
      state = stepMatch(state, [InputFlag.Right, 0]);
    }
    expect((state.fighters[0].x - start) / FIXED_SCALE).toBe(288);
  });

  test("produces a visible jump arc and lands deterministically", () => {
    let state = createInitialState(1);
    let maximumHeight = 0;
    let landingFrame = 0;
    state = stepMatch(state, [InputFlag.Up, 0]);
    for (let frame = 1; frame <= SIMULATION_HZ; frame += 1) {
      maximumHeight = Math.max(maximumHeight, state.fighters[0].y);
      state = stepMatch(state, [0, 0]);
      if (state.fighters[0].grounded) {
        landingFrame = state.frame;
        break;
      }
    }
    expect(maximumHeight / FIXED_SCALE).toBeGreaterThan(100);
    expect(maximumHeight / FIXED_SCALE).toBeLessThan(140);
    expect(landingFrame).toBeGreaterThan(30);
    expect(landingFrame).toBeLessThan(45);
  });

  test("clamps movement to both stage boundaries", () => {
    let state = createInitialState(1);
    for (let frame = 0; frame < 240; frame += 1)
      state = stepMatch(state, [InputFlag.Left, InputFlag.Right]);
    expect(state.fighters[0].x / FIXED_SCALE).toBe(80);
    expect(state.fighters[1].x / FIXED_SCALE).toBe(920);
  });

  test("supports deterministic crouching and jumping state", () => {
    const state = runReplay(replay);
    expect(state.fighters[0].crouching).toBe(true);
    expect(state.fighters[0].grounded).toBe(true);
    expect(state.fighters[0].facing).toBe(1);
    expect(state.fighters[1].facing).toBe(-1);
  });
});
