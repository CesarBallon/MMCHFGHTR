import {
  FIGHTERS_BY_ID,
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

function advanceFighter(
  current: FighterState,
  input: number,
  previousInput: number,
): FighterState {
  const definition = FIGHTERS_BY_ID[current.fighterId];
  const pressed = input & ~previousInput;
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
  const currentMove = activeMove(next);
  if (currentMove) {
    const actionFrame = next.actionFrame + 1;
    const duration =
      currentMove.startupFrames +
      currentMove.activeFrames +
      currentMove.recoveryFrames;
    return actionFrame >= duration
      ? { ...next, action: "idle", actionFrame: 0, hitResolved: false }
      : { ...next, actionFrame };
  }
  const requestedMove = moveForInput(definition, pressed);
  if (requestedMove && next.grounded && next.meter >= requestedMove.meterCost)
    return {
      ...next,
      action: `move:${requestedMove.id}`,
      actionFrame: 0,
      hitResolved: false,
      meter: next.meter - requestedMove.meterCost,
      velocityX: 0,
    };

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
  const faced = faceOpponents(
    advanceFighter(state.fighters[0], inputs[0], state.previousInputs[0]),
    advanceFighter(state.fighters[1], inputs[1], state.previousInputs[1]),
  );
  const events = [
    pendingHit(faced[0], faced[1], 0),
    pendingHit(faced[1], faced[0], 1),
  ].filter((event): event is HitEvent => event !== undefined);
  let fighters: readonly [FighterState, FighterState] = faced;
  for (const event of events) fighters = applyHit(fighters, event, inputs);
  const next: MatchState = {
    ...state,
    frame: state.frame + 1,
    randomState: nextRandom(state.randomState),
    fighters,
    previousInputs: inputs,
  };
  return finishRound(next, fighters);
}
