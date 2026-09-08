import {
  FIGHTERS_BY_ID,
  M02_COMBAT_CONTRACTS,
  type CancelTarget,
  type FighterDefinition,
  type FighterId,
  type MoveDefinition,
} from "../content";
import { authoredHitConnects } from "./collision";
import { nextRandom, normalizeSeed } from "./random";
import {
  FIXED_SCALE,
  InputFlag,
  type FighterAction,
  type FighterState,
  type MatchState,
} from "./types";

const GRAVITY = 620;
const STAGE_LEFT = 80 * FIXED_SCALE;
const STAGE_RIGHT = 920 * FIXED_SCALE;
const ROUND_OVER_FRAMES = 120;
const ROUNDS_TO_WIN = 2;
const METER_MAX = 1_000;
const HIT_STOP_FRAMES = 5;
const SUPER_FREEZE_FRAMES = 12;
const THROW_STARTUP_FRAMES = 3;
const THROW_TOTAL_FRAMES = 24;
const THROW_RANGE = 96 * FIXED_SCALE;
const THROW_DAMAGE = 80;
const THROW_STUN_FRAMES = 24;
const DEFAULT_FIGHTERS: readonly [FighterId, FighterId] = ["saja", "benita"];

function fighter(id: FighterId, x: number, facing: -1 | 1): FighterState {
  return {
    fighterId: id,
    x,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    health: FIGHTERS_BY_ID[id].stats.health,
    meter: 0,
    grounded: true,
    crouching: false,
    facing,
    action: "idle",
    actionFrame: 0,
    hitResolved: false,
    stunFrames: 0,
  };
}

export function createInitialState(
  seed: number,
  fighterIds = DEFAULT_FIGHTERS,
): MatchState {
  return {
    frame: 0,
    randomState: normalizeSeed(seed),
    fighters: [
      fighter(fighterIds[0], 300 * FIXED_SCALE, 1),
      fighter(fighterIds[1], 700 * FIXED_SCALE, -1),
    ],
    previousInputs: [0, 0],
    hitStopFrames: 0,
    superFreezeFrames: 0,
    superFreezeOwner: null,
    phase: "fight",
    phaseFrames: 0,
    round: 1,
    roundWins: [0, 0],
    roundWinner: null,
    matchWinner: null,
  };
}

function moveForInput(
  definition: FighterDefinition,
  pressed: number,
): MoveDefinition | undefined {
  const bothSpecials =
    (pressed & InputFlag.Special1) !== 0 &&
    (pressed & InputFlag.Special2) !== 0;
  if (bothSpecials)
    return definition.moves.find(
      (move) =>
        move.command.length === 2 &&
        move.command[0] === "special1" &&
        move.command[1] === "special2",
    );
  const command =
    (pressed & InputFlag.Light) !== 0
      ? "light"
      : (pressed & InputFlag.Heavy) !== 0
        ? "heavy"
        : (pressed & InputFlag.Special1) !== 0
          ? "special1"
          : (pressed & InputFlag.Special2) !== 0
            ? "special2"
            : undefined;
  return command
    ? definition.moves.find(
        (move) => move.command.length === 1 && move.command[0] === command,
      )
    : undefined;
}

function activeMove(current: FighterState): MoveDefinition | undefined {
  if (!current.action.startsWith("move:")) return undefined;
  const moveId = current.action.slice(5);
  return FIGHTERS_BY_ID[current.fighterId].moves.find(
    (move) => move.id === moveId,
  );
}

function cancelTarget(move: MoveDefinition): CancelTarget {
  return move.kind === "super"
    ? "super"
    : move.kind === "special"
      ? "special"
      : "normal";
}

function canCancel(
  current: FighterState,
  requested: MoveDefinition,
): boolean {
  if (current.fighterId !== "benita" && current.fighterId !== "saja")
    return false;
  const contract = M02_COMBAT_CONTRACTS[current.fighterId].moves.find(
    ({ moveId }) => current.action === `move:${moveId}`,
  );
  return (
    contract?.cancelWindows.some(
      ({ fromFrame, throughFrame, into, onHitOnly }) =>
        current.actionFrame >= fromFrame &&
        current.actionFrame <= throughFrame &&
        into.includes(cancelTarget(requested)) &&
        (!onHitOnly || current.hitResolved),
    ) ?? false
  );
}

function beginMove(
  current: FighterState,
  move: MoveDefinition,
): FighterState {
  return {
    ...current,
    action: `move:${move.id}`,
    actionFrame: 0,
    hitResolved: false,
    meter: current.meter - move.meterCost,
    velocityX: 0,
  };
}

function advanceFighter(
  current: FighterState,
  input: number,
  previousInput: number,
): FighterState {
  const definition = FIGHTERS_BY_ID[current.fighterId];
  const pressed = input & ~previousInput;
  const requestedMove = moveForInput(definition, pressed);
  let next = { ...current, crouching: false };
  if (next.stunFrames > 0) {
    const stunFrames = next.stunFrames - 1;
    if (stunFrames === 0)
      return { ...next, action: "idle", actionFrame: 0, stunFrames };
    return {
      ...next,
      action: next.action === "block" ? "block" : "hitstun",
      actionFrame: next.actionFrame + 1,
      stunFrames,
    };
  }
  if (next.action === "throw") {
    const actionFrame = next.actionFrame + 1;
    return actionFrame >= THROW_TOTAL_FRAMES
      ? { ...next, action: "idle", actionFrame: 0, hitResolved: false }
      : { ...next, actionFrame };
  }
  const currentMove = activeMove(next);
  if (currentMove) {
    if (
      requestedMove &&
      next.meter >= requestedMove.meterCost &&
      canCancel(next, requestedMove)
    )
      return beginMove(next, requestedMove);
    const actionFrame = next.actionFrame + 1;
    const duration =
      currentMove.startupFrames +
      currentMove.activeFrames +
      currentMove.recoveryFrames;
    return actionFrame >= duration
      ? { ...next, action: "idle", actionFrame: 0, hitResolved: false }
      : { ...next, actionFrame };
  }
  if (
    (pressed & InputFlag.Throw) !== 0 &&
    next.grounded
  )
    return {
      ...next,
      action: "throw",
      actionFrame: 0,
      hitResolved: false,
      velocityX: 0,
    };
  if (requestedMove && next.grounded && next.meter >= requestedMove.meterCost)
    return beginMove(next, requestedMove);

  const blocking = (input & InputFlag.Block) !== 0 && next.grounded;
  const left = (input & InputFlag.Left) !== 0;
  const right = (input & InputFlag.Right) !== 0;
  const down = (input & InputFlag.Down) !== 0;
  const up = (pressed & InputFlag.Up) !== 0;
  let velocityY = next.velocityY;
  let grounded = next.grounded;
  if (up && grounded && !down && !blocking) {
    velocityY = definition.stats.jumpSpeed;
    grounded = false;
  }
  let y = next.y + velocityY;
  if (!grounded) velocityY -= GRAVITY;
  if (y <= 0) {
    y = 0;
    velocityY = 0;
    grounded = true;
  }
  const horizontal =
    blocking || (down && grounded) ? 0 : Number(right) - Number(left);
  const velocityX = horizontal * definition.stats.walkSpeed;
  const x = Math.max(STAGE_LEFT, Math.min(STAGE_RIGHT, next.x + velocityX));
  const crouching = down && grounded;
  const action: FighterAction = blocking
    ? "block"
    : crouching
      ? "crouch"
      : !grounded
        ? "jump"
        : horizontal === 0
          ? "idle"
          : "walk";
  return {
    ...next,
    x,
    y,
    velocityX,
    velocityY,
    grounded,
    crouching,
    action,
    actionFrame: 0,
    hitResolved: false,
  };
}

function pushboxHalfWidth(fighter: FighterState): number {
  return (fighter.fighterId === "benita" ? 34 : fighter.fighterId === "saja" ? 27 : 29) * FIXED_SCALE;
}

function separatePushboxes(
  fighters: readonly [FighterState, FighterState],
): readonly [FighterState, FighterState] {
  const [first, second] = fighters;
  if (!first.grounded || !second.grounded) return fighters;
  const minimum = pushboxHalfWidth(first) + pushboxHalfWidth(second);
  const distance = Math.abs(second.x - first.x);
  if (distance >= minimum) return fighters;
  const firstIsLeft = first.x < second.x || (first.x === second.x);
  const overlap = minimum - distance;
  const firstShift = Math.floor(overlap / 2);
  const secondShift = overlap - firstShift;
  const movedFirst = Math.max(
    STAGE_LEFT,
    Math.min(STAGE_RIGHT, first.x + (firstIsLeft ? -firstShift : firstShift)),
  );
  const movedSecond = Math.max(
    STAGE_LEFT,
    Math.min(STAGE_RIGHT, second.x + (firstIsLeft ? secondShift : -secondShift)),
  );
  return [
    { ...first, x: movedFirst, velocityX: movedFirst === first.x ? 0 : first.velocityX },
    { ...second, x: movedSecond, velocityX: movedSecond === second.x ? 0 : second.velocityX },
  ];
}

function faceOpponents(
  first: FighterState,
  second: FighterState,
): readonly [FighterState, FighterState] {
  const firstFaces: -1 | 1 = first.x <= second.x ? 1 : -1;
  return [
    { ...first, facing: firstFaces },
    { ...second, facing: firstFaces === 1 ? -1 : 1 },
  ];
}

interface HitEvent {
  readonly attacker: 0 | 1;
  readonly move: MoveDefinition;
}

interface ThrowEvent {
  readonly attacker: 0 | 1;
}

function pendingThrow(
  attacker: FighterState,
  defender: FighterState,
  attackerIndex: 0 | 1,
): ThrowEvent | undefined {
  return attacker.action === "throw" &&
    attacker.actionFrame === THROW_STARTUP_FRAMES &&
    !attacker.hitResolved &&
    defender.grounded &&
    defender.stunFrames === 0 &&
    Math.abs(attacker.x - defender.x) <= THROW_RANGE
    ? { attacker: attackerIndex }
    : undefined;
}

function applyThrow(
  fighters: readonly [FighterState, FighterState],
  event: ThrowEvent,
): readonly [FighterState, FighterState] {
  const defenderIndex: 0 | 1 = event.attacker === 0 ? 1 : 0;
  const attacker = fighters[event.attacker];
  const defender = fighters[defenderIndex];
  const attackDefinition = FIGHTERS_BY_ID[attacker.fighterId];
  const defenseDefinition = FIGHTERS_BY_ID[defender.fighterId];
  const damage = Math.max(
    1,
    Math.floor(
      (THROW_DAMAGE * attackDefinition.stats.powerPermille) /
        defenseDefinition.stats.defensePermille,
    ),
  );
  const health = Math.max(0, defender.health - damage);
  const updatedAttacker = { ...attacker, hitResolved: true };
  const updatedDefender: FighterState = {
    ...defender,
    health,
    velocityX: 0,
    action: health === 0 ? "ko" : "thrown",
    actionFrame: 0,
    stunFrames: health === 0 ? 0 : THROW_STUN_FRAMES,
  };
  return event.attacker === 0
    ? [updatedAttacker, updatedDefender]
    : [updatedDefender, updatedAttacker];
}

function pendingHit(
  attacker: FighterState,
  defender: FighterState,
  attackerIndex: 0 | 1,
): HitEvent | undefined {
  const move = activeMove(attacker);
  if (!move || attacker.hitResolved) return undefined;
  const activeEnd = move.startupFrames + move.activeFrames;
  if (
    attacker.actionFrame < move.startupFrames ||
    attacker.actionFrame >= activeEnd
  )
    return undefined;
  const authoredConnection = authoredHitConnects(attacker, defender, move);
  const connects =
    authoredConnection ??
    (Math.abs(attacker.x - defender.x) / FIXED_SCALE <= move.reach &&
      Math.abs(attacker.y - defender.y) / FIXED_SCALE <= 140);
  return connects ? { attacker: attackerIndex, move } : undefined;
}

function applyHit(
  fighters: readonly [FighterState, FighterState],
  event: HitEvent,
  inputs: readonly [number, number],
): readonly [FighterState, FighterState] {
  const defenderIndex: 0 | 1 = event.attacker === 0 ? 1 : 0;
  const attacker = fighters[event.attacker];
  const defender = fighters[defenderIndex];
  const attackDefinition = FIGHTERS_BY_ID[attacker.fighterId];
  const defenseDefinition = FIGHTERS_BY_ID[defender.fighterId];
  const guarding =
    defender.action === "block" &&
    (inputs[defenderIndex] & InputFlag.Block) !== 0 &&
    defender.grounded &&
    defender.facing === -attacker.facing;
  const rawDamage = Math.max(
    1,
    Math.floor(
      (event.move.damage * attackDefinition.stats.powerPermille) /
        defenseDefinition.stats.defensePermille,
    ),
  );
  const damage = guarding ? Math.max(1, Math.floor(rawDamage / 4)) : rawDamage;
  const stunFrames = guarding
    ? event.move.blockstunFrames
    : event.move.hitstunFrames;
  const updatedAttacker = {
    ...attacker,
    hitResolved: true,
    meter: Math.min(
      METER_MAX,
      attacker.meter +
        (guarding
          ? Math.floor(event.move.meterGain / 2)
          : event.move.meterGain),
    ),
  };
  const health = Math.max(0, defender.health - damage);
  const defenderAction: FighterAction =
    health === 0 ? "ko" : guarding ? "block" : "hitstun";
  const updatedDefender = {
    ...defender,
    health,
    velocityX: 0,
    action: defenderAction,
    actionFrame: 0,
    stunFrames: health === 0 ? 0 : stunFrames,
  };
  return event.attacker === 0
    ? [updatedAttacker, updatedDefender]
    : [updatedDefender, updatedAttacker];
}

function finishRound(
  state: MatchState,
  fighters: readonly [FighterState, FighterState],
): MatchState {
  if (fighters[0].health > 0 && fighters[1].health > 0)
    return { ...state, fighters };
  const winner: 0 | 1 | null =
    fighters[0].health === fighters[1].health
      ? null
      : fighters[0].health > 0
        ? 0
        : 1;
  const wins: [number, number] = [...state.roundWins];
  if (winner !== null) wins[winner] += 1;
  return {
    ...state,
    fighters,
    phase: "round-over",
    phaseFrames: 0,
    roundWins: wins,
    roundWinner: winner,
  };
}

function advanceRound(state: MatchState): MatchState {
  const phaseFrames = state.phaseFrames + 1;
  if (phaseFrames < ROUND_OVER_FRAMES)
    return {
      ...state,
      frame: state.frame + 1,
      randomState: nextRandom(state.randomState),
      phaseFrames,
    };
  const matchWinner =
    state.roundWins[0] >= ROUNDS_TO_WIN
      ? 0
      : state.roundWins[1] >= ROUNDS_TO_WIN
        ? 1
        : null;
  if (matchWinner !== null)
    return {
      ...state,
      frame: state.frame + 1,
      randomState: nextRandom(state.randomState),
      phase: "match-over",
      phaseFrames,
      matchWinner,
    };
  const ids: readonly [FighterId, FighterId] = [
    state.fighters[0].fighterId,
    state.fighters[1].fighterId,
  ];
  const reset = createInitialState(state.randomState, ids);
  return {
    ...reset,
    frame: state.frame + 1,
    randomState: nextRandom(state.randomState),
    round: state.round + 1,
    roundWins: state.roundWins,
  };
}

export function stepMatch(
  state: MatchState,
  inputs: readonly [number, number],
): MatchState {
  if (state.phase === "match-over")
    return {
      ...state,
      frame: state.frame + 1,
      randomState: nextRandom(state.randomState),
      previousInputs: inputs,
    };
  if (state.phase === "round-over") return advanceRound(state);
  if (state.hitStopFrames > 0)
    return {
      ...state,
      frame: state.frame + 1,
      randomState: nextRandom(state.randomState),
      hitStopFrames: state.hitStopFrames - 1,
    };
  if (state.superFreezeFrames > 0) {
    const superFreezeFrames = state.superFreezeFrames - 1;
    return {
      ...state,
      frame: state.frame + 1,
      randomState: nextRandom(state.randomState),
      superFreezeFrames,
      superFreezeOwner:
        superFreezeFrames === 0 ? null : state.superFreezeOwner,
    };
  }
  const moved = separatePushboxes([
    advanceFighter(state.fighters[0], inputs[0], state.previousInputs[0]),
    advanceFighter(state.fighters[1], inputs[1], state.previousInputs[1]),
  ]);
  const faced = faceOpponents(moved[0], moved[1]);
  const superFreezeOwner = ([0, 1] as const).find((index) => {
    const move = activeMove(faced[index]);
    return (
      move?.kind === "super" &&
      state.fighters[index].action !== faced[index].action
    );
  });
  const throwEvents = [
    pendingThrow(faced[0], faced[1], 0),
    pendingThrow(faced[1], faced[0], 1),
  ].filter((event): event is ThrowEvent => event !== undefined);
  let fighters: readonly [FighterState, FighterState] = faced;
  let impact = false;
  if (throwEvents.length === 2) {
    fighters = [
      { ...fighters[0], action: "idle", actionFrame: 0 },
      { ...fighters[1], action: "idle", actionFrame: 0 },
    ];
  } else if (throwEvents[0]) {
    fighters = applyThrow(fighters, throwEvents[0]);
    impact = true;
  }
  const events = [
    pendingHit(fighters[0], fighters[1], 0),
    pendingHit(fighters[1], fighters[0], 1),
  ].filter((event): event is HitEvent => event !== undefined);
  for (const event of events) fighters = applyHit(fighters, event, inputs);
  if (events.length > 0) impact = true;
  const next: MatchState = {
    ...state,
    frame: state.frame + 1,
    randomState: nextRandom(state.randomState),
    fighters,
    previousInputs: inputs,
    hitStopFrames: impact ? HIT_STOP_FRAMES : 0,
    superFreezeFrames:
      superFreezeOwner === undefined ? 0 : SUPER_FREEZE_FRAMES,
    superFreezeOwner: superFreezeOwner ?? null,
  };
  return finishRound(next, fighters);
}
