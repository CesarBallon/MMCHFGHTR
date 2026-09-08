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

function inRange(state = createInitialState(1)): MatchState {
  return {
    ...state,
    fighters: [
      { ...state.fighters[0], x: 400 * FIXED_SCALE },
      { ...state.fighters[1], x: 450 * FIXED_SCALE },
    ],
  };
}

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

function lightHit(state: MatchState, defenderInput = 0): MatchState {
  let next = stepMatch(state, [InputFlag.Light, defenderInput]);
  next = advance(next, 5, [0, defenderInput]);
  return next;
}

describe("deterministic combat rules", () => {
  test("replays combat to an identical final state and hash", () => {
    const replay: Replay = {
      version: 1,
      seed: 42,
      fighters: ["saja", "benita"],
      inputs: Array.from({ length: 40 }, (_, frame) => ({
        frame,
        players: [
          frame < 20
            ? InputFlag.Right
            : frame === 20
              ? InputFlag.Special2
              : 0,
          frame < 20 ? InputFlag.Left : 0,
        ],
      })),
    };
    const first = runReplay(replay);
    const second = runReplay(JSON.parse(JSON.stringify(replay)) as Replay);
    expect(second).toEqual(first);
    expect(hashMatchState(second)).toBe(hashMatchState(first));
    expect(first.fighters[1].health).toBeLessThan(1_000);
  });

  test("resolves canonical damage on the authored active frame", () => {
    const started = stepMatch(inRange(), [InputFlag.Light, 0]);
    expect(started.fighters[1].health).toBe(1_000);
    const hit = advance(started, 5);
    expect(hit.fighters[1].health).toBe(996);
    expect(hit.fighters[0].meter).toBe(12);
    expect(hit.fighters[1].action).toBe("hitstun");
  });

  test("uses canonical signature-special range, damage and meter data", () => {
    const state = createInitialState(1);
    const atRange: MatchState = {
      ...state,
      fighters: [
        { ...state.fighters[0], x: 300 * FIXED_SCALE },
        { ...state.fighters[1], x: 600 * FIXED_SCALE },
      ],
    };
    const started = stepMatch(atRange, [InputFlag.Special2, 0]);
    const hit = advance(started, 12);
    expect(hit.fighters[1].health).toBe(991);
    expect(hit.fighters[0].meter).toBe(24);
  });

  test("blocking applies chip damage, block stun and reduced meter gain", () => {
    const hit = lightHit(inRange(), InputFlag.Block);
    expect(hit.fighters[1].health).toBe(999);
    expect(hit.fighters[1].action).toBe("block");
    expect(hit.fighters[1].stunFrames).toBe(7);
    expect(hit.fighters[0].meter).toBe(6);
    const frozen = stepMatch(hit, [0, InputFlag.Block]);
    expect(frozen.fighters[1].action).toBe("block");
    expect(frozen.fighters[1].stunFrames).toBe(7);
    const resumed = advance(frozen, frozen.hitStopFrames + 1, [
      0,
      InputFlag.Block,
    ]);
    expect(resumed.fighters[1].stunFrames).toBe(6);
  });

  test("can connect during a later active frame", () => {
    const state = createInitialState(1);
    let approaching: MatchState = {
      ...state,
      fighters: [
        { ...state.fighters[0], x: 400 * FIXED_SCALE },
        { ...state.fighters[1], x: 500 * FIXED_SCALE },
      ],
    };
    approaching = stepMatch(approaching, [InputFlag.Light, InputFlag.Left]);
    approaching = advance(approaching, 5, [0, InputFlag.Left]);
    expect(approaching.fighters[1].health).toBe(1_000);
    approaching = advance(approaching, 2, [0, InputFlag.Left]);
    expect(approaching.fighters[1].health).toBe(996);
  });

  test("hit stun prevents movement until it expires", () => {
    const hit = lightHit(inRange());
    const x = hit.fighters[1].x;
    const frozen = advance(hit, hit.hitStopFrames, [
      0,
      InputFlag.Right,
    ]);
    expect(frozen.fighters[1].x).toBe(x);
    expect(frozen.fighters[1].stunFrames).toBe(hit.fighters[1].stunFrames);
    const stunned = stepMatch(frozen, [0, InputFlag.Right]);
    expect(stunned.fighters[1].x).toBe(x);
    expect(stunned.fighters[1].stunFrames).toBe(hit.fighters[1].stunFrames - 1);
  });

  test("meter gain is capped deterministically", () => {
    const state = inRange();
    const primed = {
      ...state,
      fighters: [{ ...state.fighters[0], meter: 995 }, state.fighters[1]],
    } as MatchState;
    expect(lightHit(primed).fighters[0].meter).toBe(1_000);
  });

  test("resolves simultaneous attacks without player-order advantage", () => {
    let state = stepMatch(inRange(), [InputFlag.Light, InputFlag.Light]);
    state = advance(state, 5);
    expect(state.fighters[0].health).toBeLessThan(1_000);
    expect(state.fighters[1].health).toBeLessThan(1_000);
  });

  test("cannot block while performing another action", () => {
    let state = stepMatch(inRange(), [
      InputFlag.Light,
      InputFlag.Light | InputFlag.Block,
    ]);
    state = advance(state, 5, [0, InputFlag.Block]);
    expect(state.fighters[1].health).toBe(996);
  });

  test("does not repeat an attack while its input remains held", () => {
    const state = advance(inRange(), 50, [InputFlag.Light, 0]);
    expect(state.fighters[1].health).toBe(996);
    expect(state.fighters[0].action).toBe("idle");
  });

  test("records a KO, advances the round and restores health", () => {
    const state = inRange();
    const vulnerable = {
      ...state,
      fighters: [state.fighters[0], { ...state.fighters[1], health: 1 }],
    } as MatchState;
    const ko = lightHit(vulnerable);
    expect(ko.phase).toBe("round-over");
    expect(ko.roundWins).toEqual([1, 0]);
    const nextRound = advance(ko, 120);
    expect(nextRound.phase).toBe("fight");
    expect(nextRound.round).toBe(2);
    expect(nextRound.fighters.map(({ health }) => health)).toEqual([
      1_000, 1_000,
    ]);
  });

  test("ends the match when a fighter earns two rounds", () => {
    const state = inRange();
    const finalRound: MatchState = {
      ...state,
      round: 2,
      roundWins: [1, 0] as const,
      fighters: [state.fighters[0], { ...state.fighters[1], health: 1 }],
    };
    const complete = advance(lightHit(finalRound), 120);
    expect(complete.phase).toBe("match-over");
    expect(complete.matchWinner).toBe(0);
    expect(complete.roundWins).toEqual([2, 0]);
  });
});
