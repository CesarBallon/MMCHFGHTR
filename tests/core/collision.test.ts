import { describe, expect, test } from "vitest";
import { FIGHTERS_BY_ID } from "../../src/content";
import {
  authoredHitConnects,
  createCombatDebugSnapshot,
  createInitialState,
  FIXED_SCALE,
  InputFlag,
  stepMatch,
  type MatchState,
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

describe("M02 authored collision integration", () => {
  test("exposes renderer-neutral hurtbox, hitbox, pushbox and throw range", () => {
    const started = stepMatch(createInitialState(1), [InputFlag.Light, 0]);
    const active = advance(started, 5);
    const snapshot = createCombatDebugSnapshot(active);
    const kinds = snapshot.fighters[0].boxes.map(({ kind }) => kind);
    expect(kinds).toContain("hurtbox");
    expect(kinds).toContain("hitbox");
    expect(kinds).toContain("pushbox");
    expect(kinds).toContain("throw-range");
    expect(snapshot.fighters[0].stateId).toBe("move:standing-light");
  });

  test("does not expose a move hitbox before its authored active frame", () => {
    const started = stepMatch(createInitialState(1), [InputFlag.Light, 0]);
    expect(
      createCombatDebugSnapshot(started).fighters[0].boxes.some(
        ({ kind }) => kind === "hitbox",
      ),
    ).toBe(false);
  });

  test("mirrors authored hitboxes when the opponent crosses sides", () => {
    const initial = createInitialState(1);
    const attacker = {
      ...initial.fighters[0],
      x: 500 * FIXED_SCALE,
      facing: -1 as const,
      action: "move:standing-light" as const,
      actionFrame: 5,
    };
    const defender = {
      ...initial.fighters[1],
      x: 450 * FIXED_SCALE,
      facing: 1 as const,
    };
    expect(
      authoredHitConnects(
        attacker,
        defender,
        FIGHTERS_BY_ID.saja.moves[0]!,
      ),
    ).toBe(true);
  });

  test("keeps the shadow anchored to a moving fighter's feet", () => {
    const initial = createInitialState(1);
    const before = createCombatDebugSnapshot(initial).fighters[0];
    const moved = stepMatch(initial, [InputFlag.Right, 0]);
    const after = createCombatDebugSnapshot(moved).fighters[0];
    expect(after.footX - before.footX).toBe(
      moved.fighters[0].x - initial.fighters[0].x,
    );
    expect(after.shadowX - before.shadowX).toBe(
      moved.fighters[0].x - initial.fighters[0].x,
    );
    expect(after.footY).toBe(moved.fighters[0].y);
  });

  test("selects crouching and airborne debug poses deterministically", () => {
    const initial = createInitialState(1);
    const crouching = stepMatch(initial, [InputFlag.Down, 0]);
    expect(
      createCombatDebugSnapshot(crouching).fighters[0].stateId,
    ).toBe("crouch-idle");
    const jumping = stepMatch(initial, [InputFlag.Up, 0]);
    expect(createCombatDebugSnapshot(jumping).fighters[0].stateId).toBe(
      "jump-rise",
    );
  });

  test("retains the distance fallback for fighters outside the M02 slice", () => {
    const initial = createInitialState(1, ["coraima", "bella"]);
    const close: MatchState = {
      ...initial,
      fighters: [
        { ...initial.fighters[0], x: 400 * FIXED_SCALE },
        { ...initial.fighters[1], x: 450 * FIXED_SCALE },
      ],
    };
    const hit = advance(
      stepMatch(close, [InputFlag.Light, 0]),
      FIGHTERS_BY_ID.coraima.moves[0]!.startupFrames,
    );
    expect(hit.fighters[1].health).toBeLessThan(
      FIGHTERS_BY_ID.bella.stats.health,
    );
  });
});
