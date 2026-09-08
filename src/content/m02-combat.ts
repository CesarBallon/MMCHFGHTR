import {
  ANIMATION_STATE_IDS,
  validateFighterCombatContract,
  type AnimationFrameDefinition,
  type AnimationStateDefinition,
  type FighterCombatContract,
  type ProductionMoveContract,
} from "./combat-contract";
import type { FighterId } from "./fighter-schema";
import { FIGHTERS_BY_ID } from "./fighters";

const SOURCE_FPS = 16;
const SIMULATION_HZ = 60;

function passiveFrame(
  sourceFrame = 0,
  crouching = false,
): AnimationFrameDefinition {
  return {
    sourceFrame,
    durationTicks: 4,
    rootMotionX: 0,
    rootMotionY: 0,
    hurtboxes: [
      {
        x: -1,
        y: 0,
        width: 2,
        height: crouching ? 118 : 190,
      },
    ],
    hitboxes: [],
    footAnchor: { x: 0, y: 0 },
    shadow: {
      offsetX: 0,
      width: crouching ? 82 : 70,
      opacityPermille: 420,
    },
  };
}

function stateAnimation(
  id: AnimationStateDefinition["id"],
): AnimationStateDefinition {
  const crouching =
    id === "crouch-enter" ||
    id === "crouch-idle" ||
    id === "crouch-exit" ||
    id === "block-crouching";
  return {
    id,
    atlas: id.replace(":", "-"),
    sourceFramesPerSecond: SOURCE_FPS,
    looping:
      id === "idle" ||
      id === "walk-forward" ||
      id === "walk-backward" ||
      id === "crouch-idle",
    facingMode: "mirror",
    frames: [passiveFrame(0, crouching)],
  };
}

function moveAnimation(
  moveId: string,
  atlas: string,
  startupFrames: number,
  activeFrames: number,
  recoveryFrames: number,
  reach: number,
): AnimationStateDefinition {
  const totalFrames = startupFrames + activeFrames + recoveryFrames;
  return {
    id: `move:${moveId}`,
    atlas,
    sourceFramesPerSecond: SOURCE_FPS,
    looping: false,
    facingMode: "mirror",
    frames: Array.from({ length: totalFrames }, (_, frameIndex) => {
      const active =
        frameIndex >= startupFrames &&
        frameIndex < startupFrames + activeFrames;
      return {
        ...passiveFrame(Math.min(15, Math.floor((frameIndex * SOURCE_FPS) / SIMULATION_HZ))),
        durationTicks: 1,
        hitboxes: active
          ? [
              {
                hitId: moveId,
                x: 0,
                y: 0,
                width: reach,
                height: 140,
              },
            ]
          : [],
      };
    }),
  };
}

function moveContract(
  move: (typeof FIGHTERS_BY_ID)[FighterId]["moves"][number],
): ProductionMoveContract {
  return {
    moveId: move.id,
    animationState: `move:${move.id}`,
    startupFrames: move.startupFrames,
    activeFrames: move.activeFrames,
    recoveryFrames: move.recoveryFrames,
    cancelWindows:
      move.kind === "normal"
        ? [
            {
              fromFrame: move.startupFrames,
              throughFrame: move.startupFrames + move.activeFrames - 1,
              into: ["special", "super"],
              onHitOnly: true,
            },
          ]
        : [],
  };
}

function fighterContract(fighterId: "benita" | "saja"): FighterCombatContract {
  const fighter = FIGHTERS_BY_ID[fighterId];
  const contract: FighterCombatContract = {
    schemaVersion: 1,
    fighterId,
    animations: [
      ...ANIMATION_STATE_IDS.map(stateAnimation),
      ...fighter.moves.map((move) =>
        moveAnimation(
          move.id,
          move.animation.atlas,
          move.startupFrames,
          move.activeFrames,
          move.recoveryFrames,
          move.reach,
        ),
      ),
    ],
    moves: fighter.moves.map(moveContract),
  };
  const validation = validateFighterCombatContract(contract);
  if (!validation.valid)
    throw new Error(
      `Invalid M02 combat contract for ${fighterId}: ${validation.issues
        .map(({ path, message }) => `${path}: ${message}`)
        .join("; ")}`,
    );
  return contract;
}

export const M02_COMBAT_CONTRACTS = Object.freeze({
  benita: fighterContract("benita"),
  saja: fighterContract("saja"),
});
