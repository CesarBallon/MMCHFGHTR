import { describe, expect, test } from "vitest";
import {
  ANIMATION_STATE_IDS,
  validateFighterCombatContract,
  type AnimationFrameDefinition,
  type AnimationStateDefinition,
  type FighterCombatContract,
} from "../../src/content";

const frame = (): AnimationFrameDefinition => ({
  sourceFrame: 0,
  durationTicks: 4,
  rootMotionX: 0,
  rootMotionY: 0,
  hurtboxes: [{ x: -28, y: 0, width: 56, height: 180 }],
  hitboxes: [],
  footAnchor: { x: 0, y: 0 },
  shadow: { offsetX: 0, width: 72, opacityPermille: 420 },
});

const animation = (
  id: AnimationStateDefinition["id"],
): AnimationStateDefinition => ({
  id,
  atlas: id.replace(":", "-"),
  sourceFramesPerSecond: 16,
  looping: id === "idle",
  facingMode: "mirror",
  frames: [frame()],
});

function contract(): FighterCombatContract {
  return {
    schemaVersion: 1,
    fighterId: "benita",
    animations: [
      ...ANIMATION_STATE_IDS.map(animation),
      {
        ...animation("move:beer-bath"),
        frames: [
          frame(),
          {
            ...frame(),
            sourceFrame: 1,
            hitboxes: [
              {
                hitId: "beer-splash",
                x: 30,
                y: 40,
                width: 140,
                height: 100,
              },
            ],
          },
        ],
      },
    ],
    moves: [
      {
        moveId: "beer-bath",
        animationState: "move:beer-bath",
        startupFrames: 11,
        activeFrames: 8,
        recoveryFrames: 20,
        cancelWindows: [
          {
            fromFrame: 11,
            throughFrame: 18,
            into: ["super"],
            onHitOnly: true,
          },
        ],
      },
    ],
  };
}

describe("M02 combat-presentation contract", () => {
  test("accepts complete frame, collision, anchor and cancel data", () => {
    expect(validateFighterCombatContract(contract())).toEqual({
      valid: true,
      issues: [],
    });
  });

  test("requires every locomotion and reaction state for M02", () => {
    const candidate = structuredClone(contract()) as {
      animations: AnimationStateDefinition[];
    };
    candidate.animations = candidate.animations.filter(
      ({ id }) => id !== "crouch-idle",
    );
    expect(
      validateFighterCombatContract(candidate).issues.map(
        ({ message }) => message,
      ),
    ).toContain("missing required state crouch-idle");
  });

  test("enforces at least 16 authored source frames per second", () => {
    const candidate = structuredClone(contract()) as {
      animations: { sourceFramesPerSecond: number }[];
    };
    candidate.animations[0]!.sourceFramesPerSecond = 15;
    expect(
      validateFighterCombatContract(candidate).issues.map(({ path }) => path),
    ).toContain("animations[0].sourceFramesPerSecond");
  });

  test("rejects fractional simulation timing and root motion", () => {
    const candidate = structuredClone(contract()) as {
      animations: {
        frames: { durationTicks: number; rootMotionX: number }[];
      }[];
    };
    candidate.animations[0]!.frames[0]!.durationTicks = 2.5;
    candidate.animations[0]!.frames[0]!.rootMotionX = 0.25;
    const paths = validateFighterCombatContract(candidate).issues.map(
      ({ path }) => path,
    );
    expect(paths).toContain("animations[0].frames[0].durationTicks");
    expect(paths).toContain("animations[0].frames[0].rootMotionX");
  });

  test("requires positive collision dimensions", () => {
    const candidate = structuredClone(contract()) as {
      animations: {
        frames: { hurtboxes: { width: number }[] }[];
      }[];
    };
    candidate.animations[0]!.frames[0]!.hurtboxes[0]!.width = 0;
    expect(
      validateFighterCombatContract(candidate).issues.map(({ path }) => path),
    ).toContain("animations[0].frames[0].hurtboxes[0].width");
  });

  test("requires attached foot and shadow metadata on every frame", () => {
    const candidate = structuredClone(contract()) as unknown as {
      animations: { frames: Record<string, unknown>[] }[];
    };
    delete candidate.animations[0]!.frames[0]!.footAnchor;
    delete candidate.animations[0]!.frames[0]!.shadow;
    const paths = validateFighterCombatContract(candidate).issues.map(
      ({ path }) => path,
    );
    expect(paths).toContain("animations[0].frames[0].footAnchor");
    expect(paths).toContain("animations[0].frames[0].shadow");
  });

  test("binds move frame data to its matching animation state", () => {
    const candidate = structuredClone(contract()) as {
      moves: { animationState: `move:${string}` }[];
    };
    candidate.moves[0]!.animationState = "move:hidden-shot";
    expect(
      validateFighterCombatContract(candidate).issues.map(({ path }) => path),
    ).toContain("moves[0].animationState");
  });

  test("rejects cancel windows outside total move duration", () => {
    const candidate = structuredClone(contract()) as {
      moves: {
        cancelWindows: { fromFrame: number; throughFrame: number }[];
      }[];
    };
    candidate.moves[0]!.cancelWindows[0]!.throughFrame = 39;
    expect(
      validateFighterCombatContract(candidate).issues.map(({ path }) => path),
    ).toContain("moves[0].cancelWindows[0]");
  });

  test("can validate a partial authoring fixture without waiving data rules", () => {
    const candidate = contract();
    expect(validateFighterCombatContract(candidate, false).valid).toBe(true);
    const partial = { ...candidate, animations: [animation("idle")] };
    expect(validateFighterCombatContract(partial, false).valid).toBe(true);
  });
});
