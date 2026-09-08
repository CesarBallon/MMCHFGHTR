import {
  M02_COMBAT_CONTRACTS,
  type AnimationFrameDefinition,
  type AnimationStateDefinition,
  type CollisionBox,
  type FighterCombatContract,
  type HitboxDefinition,
  type MoveDefinition,
} from "../content";
import { FIXED_SCALE, type FighterState, type MatchState } from "./types";

export type DebugBoxKind = "hurtbox" | "hitbox" | "pushbox" | "throw-range";

export interface WorldCollisionBox {
  readonly kind: DebugBoxKind;
  readonly fighter: 0 | 1;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly hitId?: string;
}

export interface FighterDebugPose {
  readonly fighter: 0 | 1;
  readonly stateId: string;
  readonly sourceFrame: number;
  readonly footX: number;
  readonly footY: number;
  readonly shadowX: number;
  readonly shadowWidth: number;
  readonly shadowOpacityPermille: number;
  readonly boxes: readonly WorldCollisionBox[];
}

export interface CombatDebugSnapshot {
  readonly frame: number;
  readonly fighters: readonly [FighterDebugPose, FighterDebugPose];
}

function contractFor(
  fighter: FighterState,
): FighterCombatContract | undefined {
  return fighter.fighterId === "benita" || fighter.fighterId === "saja"
    ? M02_COMBAT_CONTRACTS[fighter.fighterId]
    : undefined;
}

function animationId(fighter: FighterState): string {
  if (fighter.action.startsWith("move:")) return fighter.action;
  if (fighter.action === "walk")
    return fighter.velocityX * fighter.facing >= 0
      ? "walk-forward"
      : "walk-backward";
  if (fighter.action === "crouch") return "crouch-idle";
  if (fighter.action === "jump")
    return fighter.grounded
      ? "jump-land"
      : fighter.velocityY > 1_000
        ? "jump-rise"
        : fighter.velocityY < -1_000
          ? "jump-fall"
          : "jump-apex";
  if (fighter.action === "block")
    return fighter.grounded
      ? fighter.crouching
        ? "block-crouching"
        : "block-standing"
      : "block-air";
  if (fighter.action === "hitstun")
    return fighter.grounded ? "hit-light" : "hit-air";
  if (fighter.action === "ko") return "knockdown";
  return "idle";
}

function frameAtTick(
  animation: AnimationStateDefinition,
  tick: number,
): AnimationFrameDefinition {
  const duration = animation.frames.reduce(
    (total, frame) => total + frame.durationTicks,
    0,
  );
  const localTick = animation.looping
    ? tick % duration
    : Math.min(tick, duration - 1);
  let cursor = 0;
  for (const frame of animation.frames) {
    cursor += frame.durationTicks;
    if (localTick < cursor) return frame;
  }
  return animation.frames[animation.frames.length - 1]!;
}

function poseFor(
  fighter: FighterState,
  matchFrame: number,
): {
  readonly stateId: string;
  readonly frame: AnimationFrameDefinition;
} | undefined {
  const contract = contractFor(fighter);
  if (!contract) return undefined;
  const stateId = animationId(fighter);
  const animation =
    contract.animations.find(({ id }) => id === stateId) ??
    contract.animations.find(({ id }) => id === "idle");
  if (!animation) return undefined;
  const tick =
    fighter.action === "idle" || fighter.action === "walk"
      ? matchFrame
      : fighter.actionFrame;
  return { stateId, frame: frameAtTick(animation, tick) };
}

function worldBox(
  fighter: FighterState,
  box: CollisionBox,
): Omit<WorldCollisionBox, "kind" | "fighter"> {
  const localX =
    fighter.facing === 1 ? box.x : -box.x - box.width;
  return {
    x: fighter.x + localX * FIXED_SCALE,
    y: fighter.y + box.y * FIXED_SCALE,
    width: box.width * FIXED_SCALE,
    height: box.height * FIXED_SCALE,
  };
}

function overlaps(
  first: Omit<WorldCollisionBox, "kind" | "fighter">,
  second: Omit<WorldCollisionBox, "kind" | "fighter">,
): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

export function authoredHitConnects(
  attacker: FighterState,
  defender: FighterState,
  move: MoveDefinition,
): boolean | undefined {
  const attackerPose = poseFor(attacker, 0);
  const defenderPose = poseFor(defender, 0);
  if (!attackerPose || !defenderPose) return undefined;
  const hitboxes = attackerPose.frame.hitboxes.filter(
    ({ hitId }) => hitId === move.id,
  );
  if (hitboxes.length === 0) return false;
  return hitboxes.some((hitbox) =>
    defenderPose.frame.hurtboxes.some((hurtbox) =>
      overlaps(worldBox(attacker, hitbox), worldBox(defender, hurtbox)),
    ),
  );
}

function boxesFor(
  fighter: FighterState,
  fighterIndex: 0 | 1,
  pose: AnimationFrameDefinition,
): readonly WorldCollisionBox[] {
  const hurtboxes = pose.hurtboxes.map((box) => ({
    kind: "hurtbox" as const,
    fighter: fighterIndex,
    ...worldBox(fighter, box),
  }));
  const hitboxes = pose.hitboxes.map((box: HitboxDefinition) => ({
    kind: "hitbox" as const,
    fighter: fighterIndex,
    hitId: box.hitId,
    ...worldBox(fighter, box),
  }));
  const pushboxSource = pose.hurtboxes[0] ?? {
    x: -1,
    y: 0,
    width: 2,
    height: 160,
  };
  const pushbox = {
    kind: "pushbox" as const,
    fighter: fighterIndex,
    ...worldBox(fighter, {
      x: Math.max(-24, pushboxSource.x),
      y: pushboxSource.y,
      width: Math.min(48, pushboxSource.width),
      height: pushboxSource.height,
    }),
  };
  const throwRange = {
    kind: "throw-range" as const,
    fighter: fighterIndex,
    ...worldBox(fighter, { x: 0, y: 0, width: 96, height: 150 }),
  };
  return [...hurtboxes, ...hitboxes, pushbox, throwRange];
}

function debugPose(
  state: MatchState,
  fighterIndex: 0 | 1,
): FighterDebugPose {
  const fighter = state.fighters[fighterIndex];
  const resolved = poseFor(fighter, state.frame);
  const pose = resolved?.frame ?? {
    sourceFrame: 0,
    durationTicks: 1,
    rootMotionX: 0,
    rootMotionY: 0,
    hurtboxes: [{ x: -1, y: 0, width: 2, height: 180 }],
    hitboxes: [],
    footAnchor: { x: 0, y: 0 },
    shadow: { offsetX: 0, width: 70, opacityPermille: 420 },
  };
  return {
    fighter: fighterIndex,
    stateId: resolved?.stateId ?? animationId(fighter),
    sourceFrame: pose.sourceFrame,
    footX:
      fighter.x + fighter.facing * pose.footAnchor.x * FIXED_SCALE,
    footY: fighter.y + pose.footAnchor.y * FIXED_SCALE,
    shadowX:
      fighter.x + fighter.facing * pose.shadow.offsetX * FIXED_SCALE,
    shadowWidth: pose.shadow.width * FIXED_SCALE,
    shadowOpacityPermille: pose.shadow.opacityPermille,
    boxes: boxesFor(fighter, fighterIndex, pose),
  };
}

export function createCombatDebugSnapshot(
  state: MatchState,
): CombatDebugSnapshot {
  return {
    frame: state.frame,
    fighters: [debugPose(state, 0), debugPose(state, 1)],
  };
}
