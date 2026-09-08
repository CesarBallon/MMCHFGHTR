import {
  FIGHTER_IDS,
  type FighterId,
  type ValidationIssue,
  type ValidationResult,
} from "./fighter-schema";

export const ANIMATION_STATE_IDS = [
  "idle",
  "turnaround",
  "walk-forward",
  "walk-backward",
  "crouch-enter",
  "crouch-idle",
  "crouch-exit",
  "jump-start",
  "jump-rise",
  "jump-apex",
  "jump-fall",
  "jump-land",
  "block-standing",
  "block-crouching",
  "block-air",
  "hit-light",
  "hit-heavy",
  "hit-air",
  "knockdown",
  "down",
  "recover",
  "throw",
  "thrown",
] as const;

export const REQUIRED_M02_ANIMATION_STATES = ANIMATION_STATE_IDS;
export const FACING_MODES = ["mirror", "authored"] as const;
export const CANCEL_TARGETS = [
  "normal",
  "special",
  "super",
  "jump",
] as const;

export type AnimationStateId = (typeof ANIMATION_STATE_IDS)[number];
export type FacingMode = (typeof FACING_MODES)[number];
export type CancelTarget = (typeof CANCEL_TARGETS)[number];

export interface CollisionBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface HitboxDefinition extends CollisionBox {
  readonly hitId: string;
}

export interface PoseAnchor {
  readonly x: number;
  readonly y: number;
}

export interface ShadowDefinition {
  readonly offsetX: number;
  readonly width: number;
  readonly opacityPermille: number;
}

export interface AnimationFrameDefinition {
  readonly sourceFrame: number;
  readonly durationTicks: number;
  readonly rootMotionX: number;
  readonly rootMotionY: number;
  readonly hurtboxes: readonly CollisionBox[];
  readonly hitboxes: readonly HitboxDefinition[];
  readonly footAnchor: PoseAnchor;
  readonly shadow: ShadowDefinition;
}

export interface AnimationStateDefinition {
  readonly id: AnimationStateId | `move:${string}`;
  readonly atlas: string;
  readonly sourceFramesPerSecond: number;
  readonly looping: boolean;
  readonly facingMode: FacingMode;
  readonly frames: readonly AnimationFrameDefinition[];
}

export interface CancelWindow {
  readonly fromFrame: number;
  readonly throughFrame: number;
  readonly into: readonly CancelTarget[];
  readonly onHitOnly: boolean;
}

export interface ProductionMoveContract {
  readonly moveId: string;
  readonly animationState: `move:${string}`;
  readonly startupFrames: number;
  readonly activeFrames: number;
  readonly recoveryFrames: number;
  readonly cancelWindows: readonly CancelWindow[];
}

export interface FighterCombatContract {
  readonly schemaVersion: 1;
  readonly fighterId: FighterId;
  readonly animations: readonly AnimationStateDefinition[];
  readonly moves: readonly ProductionMoveContract[];
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const add = (
  issues: ValidationIssue[],
  path: string,
  message: string,
): void => {
  issues.push({ path, message });
};

function integer(
  value: unknown,
  issues: ValidationIssue[],
  path: string,
  min: number,
  max: number,
): value is number {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    add(issues, path, `must be an integer from ${min} to ${max}`);
    return false;
  }
  return true;
}

function nonEmptyString(
  value: unknown,
  issues: ValidationIssue[],
  path: string,
  pattern?: RegExp,
): value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    (pattern !== undefined && !pattern.test(value))
  ) {
    add(issues, path, pattern ? `must match ${String(pattern)}` : "must be a non-empty string");
    return false;
  }
  return true;
}

function validateBox(
  value: unknown,
  issues: ValidationIssue[],
  path: string,
): void {
  if (!record(value)) {
    add(issues, path, "must be an object");
    return;
  }
  integer(value.x, issues, `${path}.x`, -1_000, 1_000);
  integer(value.y, issues, `${path}.y`, -1_000, 1_000);
  integer(value.width, issues, `${path}.width`, 1, 1_000);
  integer(value.height, issues, `${path}.height`, 1, 1_000);
}

function validateFrame(
  value: unknown,
  issues: ValidationIssue[],
  path: string,
): void {
  if (!record(value)) {
    add(issues, path, "must be an object");
    return;
  }
  integer(value.sourceFrame, issues, `${path}.sourceFrame`, 0, 4_095);
  integer(value.durationTicks, issues, `${path}.durationTicks`, 1, 60);
  integer(value.rootMotionX, issues, `${path}.rootMotionX`, -100_000, 100_000);
  integer(value.rootMotionY, issues, `${path}.rootMotionY`, -100_000, 100_000);

  if (!Array.isArray(value.hurtboxes) || value.hurtboxes.length === 0)
    add(issues, `${path}.hurtboxes`, "must contain at least one hurtbox");
  else
    value.hurtboxes.forEach((box, index) =>
      validateBox(box, issues, `${path}.hurtboxes[${index}]`),
    );

  if (!Array.isArray(value.hitboxes))
    add(issues, `${path}.hitboxes`, "must be an array");
  else
    value.hitboxes.forEach((box, index) => {
      validateBox(box, issues, `${path}.hitboxes[${index}]`);
      if (record(box))
        nonEmptyString(
          box.hitId,
          issues,
          `${path}.hitboxes[${index}].hitId`,
          /^[a-z][a-z0-9-]*$/,
        );
    });

  if (!record(value.footAnchor))
    add(issues, `${path}.footAnchor`, "must be an object");
  else {
    integer(value.footAnchor.x, issues, `${path}.footAnchor.x`, -1_000, 1_000);
    integer(value.footAnchor.y, issues, `${path}.footAnchor.y`, -1_000, 1_000);
  }

  if (!record(value.shadow))
    add(issues, `${path}.shadow`, "must be an object");
  else {
    integer(value.shadow.offsetX, issues, `${path}.shadow.offsetX`, -1_000, 1_000);
    integer(value.shadow.width, issues, `${path}.shadow.width`, 1, 1_000);
    integer(
      value.shadow.opacityPermille,
      issues,
      `${path}.shadow.opacityPermille`,
      0,
      1_000,
    );
  }
}

function validAnimationId(value: unknown): value is AnimationStateDefinition["id"] {
  return (
    (typeof value === "string" &&
      (ANIMATION_STATE_IDS as readonly string[]).includes(value)) ||
    (typeof value === "string" && /^move:[a-z][a-z0-9-]*$/.test(value))
  );
}

function validateAnimation(
  value: unknown,
  issues: ValidationIssue[],
  path: string,
): void {
  if (!record(value)) {
    add(issues, path, "must be an object");
    return;
  }
  if (!validAnimationId(value.id))
    add(issues, `${path}.id`, "must be a known state or move:<move-id>");
  nonEmptyString(value.atlas, issues, `${path}.atlas`, /^[a-z0-9-]+$/);
  integer(
    value.sourceFramesPerSecond,
    issues,
    `${path}.sourceFramesPerSecond`,
    16,
    60,
  );
  if (typeof value.looping !== "boolean")
    add(issues, `${path}.looping`, "must be a boolean");
  if (!(FACING_MODES as readonly unknown[]).includes(value.facingMode))
    add(issues, `${path}.facingMode`, `must be one of ${FACING_MODES.join(", ")}`);
  if (!Array.isArray(value.frames) || value.frames.length === 0)
    add(issues, `${path}.frames`, "must contain at least one frame");
  else
    value.frames.forEach((frame, index) =>
      validateFrame(frame, issues, `${path}.frames[${index}]`),
    );
}

function validateCancelWindow(
  value: unknown,
  totalFrames: number,
  issues: ValidationIssue[],
  path: string,
): void {
  if (!record(value)) {
    add(issues, path, "must be an object");
    return;
  }
  const fromValid = integer(value.fromFrame, issues, `${path}.fromFrame`, 0, 359);
  const throughValid = integer(
    value.throughFrame,
    issues,
    `${path}.throughFrame`,
    0,
    359,
  );
  if (
    fromValid &&
    throughValid &&
    (Number(value.fromFrame) > Number(value.throughFrame) ||
      Number(value.throughFrame) >= totalFrames)
  )
    add(issues, path, "must be ordered and contained within the move duration");
  if (
    !Array.isArray(value.into) ||
    value.into.length === 0 ||
    value.into.some(
      (target) => !(CANCEL_TARGETS as readonly unknown[]).includes(target),
    )
  )
    add(issues, `${path}.into`, `must contain valid targets: ${CANCEL_TARGETS.join(", ")}`);
  else if (new Set(value.into).size !== value.into.length)
    add(issues, `${path}.into`, "must not contain duplicate targets");
  if (typeof value.onHitOnly !== "boolean")
    add(issues, `${path}.onHitOnly`, "must be a boolean");
}

function validateMove(
  value: unknown,
  animationIds: ReadonlySet<string>,
  issues: ValidationIssue[],
  path: string,
): void {
  if (!record(value)) {
    add(issues, path, "must be an object");
    return;
  }
  const moveIdValid = nonEmptyString(
    value.moveId,
    issues,
    `${path}.moveId`,
    /^[a-z][a-z0-9-]*$/,
  );
  const expectedState = moveIdValid ? `move:${value.moveId}` : "";
  if (value.animationState !== expectedState || !animationIds.has(expectedState))
    add(
      issues,
      `${path}.animationState`,
      "must reference the matching move animation state",
    );
  const startupValid = integer(
    value.startupFrames,
    issues,
    `${path}.startupFrames`,
    0,
    120,
  );
  const activeValid = integer(
    value.activeFrames,
    issues,
    `${path}.activeFrames`,
    1,
    120,
  );
  const recoveryValid = integer(
    value.recoveryFrames,
    issues,
    `${path}.recoveryFrames`,
    0,
    240,
  );
  const totalFrames =
    startupValid && activeValid && recoveryValid
      ? Number(value.startupFrames) +
        Number(value.activeFrames) +
        Number(value.recoveryFrames)
      : 0;
  if (!Array.isArray(value.cancelWindows))
    add(issues, `${path}.cancelWindows`, "must be an array");
  else
    value.cancelWindows.forEach((window, index) =>
      validateCancelWindow(
        window,
        totalFrames,
        issues,
        `${path}.cancelWindows[${index}]`,
      ),
    );
}

export function validateFighterCombatContract(
  value: unknown,
  requireM02States = true,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!record(value))
    return {
      valid: false,
      issues: [{ path: "$", message: "must be an object" }],
    };
  if (value.schemaVersion !== 1)
    add(issues, "schemaVersion", "must equal 1");
  if (!(FIGHTER_IDS as readonly unknown[]).includes(value.fighterId))
    add(issues, "fighterId", `must be one of ${FIGHTER_IDS.join(", ")}`);

  const animationIds: string[] = [];
  if (!Array.isArray(value.animations) || value.animations.length === 0)
    add(issues, "animations", "must contain at least one animation");
  else {
    value.animations.forEach((animation, index) => {
      validateAnimation(animation, issues, `animations[${index}]`);
      if (record(animation) && typeof animation.id === "string")
        animationIds.push(animation.id);
    });
    if (new Set(animationIds).size !== animationIds.length)
      add(issues, "animations", "animation IDs must be unique");
    if (requireM02States)
      for (const required of REQUIRED_M02_ANIMATION_STATES)
        if (!animationIds.includes(required))
          add(issues, "animations", `missing required state ${required}`);
  }

  if (!Array.isArray(value.moves))
    add(issues, "moves", "must be an array");
  else {
    const animationIdSet = new Set(animationIds);
    value.moves.forEach((move, index) =>
      validateMove(move, animationIdSet, issues, `moves[${index}]`),
    );
    const moveIds = value.moves
      .filter(record)
      .map((move) => move.moveId)
      .filter((id): id is string => typeof id === "string");
    if (new Set(moveIds).size !== moveIds.length)
      add(issues, "moves", "move IDs must be unique");
  }

  return { valid: issues.length === 0, issues };
}
