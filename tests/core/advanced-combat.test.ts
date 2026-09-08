import { describe, expect, test } from "vitest";
import {
  createInitialState,
  FIXED_SCALE,
  hashMatchState,
  InputFlag,
  runReplay,
  stepMatch,
  type MatchState,
  type Replay,
} from "../../src/core";

function advance(
  state: MatchState,
  frames: number,
  inputs: readonly [number, number] = [0, 0],
): MatchState {
  let next = state;
  for (let frame = 0; frame < frames; frame += 1)
    next = stepMatch(next, inputs);
  return next;
}

function close(state = createInitialState(7)): MatchState {
  return {
    ...state,
    fighters: [
      { ...state.fighters[0], x: 400 * FIXED_SCALE },
      { ...state.fighters[1], x: 450 * FIXED_SCALE },
    ],
  };
}

describe("M02 advanced deterministic combat", () => {
  test("separates overlapping grounded pushboxes symmetrically", () => {
    const state = close();
    const overlapping: MatchState = {
      ...state,
      fighters: [
        { ...state.fighters[0], x: 400 * FIXED_SCALE },
        { ...state.fighters[1], x: 410 * FIXED_SCALE },
      ],
    };
    const separated = stepMatch(overlapping, [0, 0]);
    expect(
      separated.fighters[1].x - separated.fighters[0].x,
    ).toBe(61 * FIXED_SCALE);
  });

  test("allows airborne fighters to cross without grounded separation", () => {
    const state = close();
    const airborne: MatchState = {
      ...state,
      fighters: [
        {
          ...state.fighters[0],
          x: 400 * FIXED_SCALE,
          y: 50 * FIXED_SCALE,
          grounded: false,
        },
        { ...state.fighters[1], x: 410 * FIXED_SCALE },
      ],
    };
    const stepped = stepMatch(airborne, [0, 0]);
    expect(stepped.fighters[1].x - stepped.fighters[0].x).toBeLessThan(
      61 * FIXED_SCALE,
    );
  });

  test("throws grounded opponents in range and ignore normal blocking", () => {
    const started = stepMatch(close(), [InputFlag.Throw, InputFlag.Block]);
    const thrown = advance(started, 3, [0, InputFlag.Block]);
    expect(thrown.fighters[0].action).toBe("throw");
    expect(thrown.fighters[0].hitResolved).toBe(true);
    expect(thrown.fighters[1].action).toBe("thrown");
    expect(thrown.fighters[1].health).toBeLessThan(1_000);
    expect(thrown.hitStopFrames).toBeGreaterThan(0);
  });

  test("treats simultaneous in-range throws as a deterministic throw tech", () => {
    const started = stepMatch(close(), [InputFlag.Throw, InputFlag.Throw]);
    const tech = advance(started, 3);
    expect(tech.fighters.map(({ health }) => health)).toEqual([1_000, 1_000]);
    expect(tech.fighters.map(({ action }) => action)).toEqual(["idle", "idle"]);
    expect(tech.hitStopFrames).toBe(0);
  });

  test("freezes action state during hit stop while advancing match time", () => {
    const started = stepMatch(close(), [InputFlag.Light, 0]);
    const impact = advance(started, 5);
    const actionFrame = impact.fighters[0].actionFrame;
    const defenderStun = impact.fighters[1].stunFrames;
    const frozen = advance(impact, impact.hitStopFrames);
    expect(frozen.frame).toBe(impact.frame + impact.hitStopFrames);
    expect(frozen.fighters[0].actionFrame).toBe(actionFrame);
    expect(frozen.fighters[1].stunFrames).toBe(defenderStun);
    expect(frozen.hitStopFrames).toBe(0);
  });

  test("buffers a held special through hit stop and cancels on hit confirm", () => {
    const started = stepMatch(close(), [InputFlag.Light, 0]);
    const impact = advance(started, 5);
    const cancelled = advance(impact, impact.hitStopFrames + 1, [
      InputFlag.Special1,
      0,
    ]);
    expect(cancelled.fighters[0].action).toBe("move:braid-lash");
    expect(cancelled.fighters[0].actionFrame).toBe(0);
  });

  test("does not permit the same cancel window after a whiff", () => {
    const state = createInitialState(7);
    const started = stepMatch(state, [InputFlag.Light, 0]);
    const active = advance(started, 5);
    const attempted = stepMatch(active, [InputFlag.Special1, 0]);
    expect(attempted.fighters[0].action).toBe("move:standing-light");
  });

  test("replays throws, hit stop and cancels to the same hash", () => {
    const replay: Replay = {
      version: 1,
      seed: 9,
      fighters: ["saja", "benita"],
      inputs: Array.from({ length: 80 }, (_, frame) => ({
        frame,
        players: [
          frame < 48
            ? InputFlag.Right
            : frame === 48
              ? InputFlag.Throw
              : 0,
          frame < 48 ? InputFlag.Left : 0,
        ],
      })),
    };
    const first = runReplay(replay);
    const second = runReplay(structuredClone(replay));
    expect(second).toEqual(first);
    expect(hashMatchState(second)).toBe(hashMatchState(first));
  });
});
