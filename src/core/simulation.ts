import { nextRandom, normalizeSeed } from './random';
import { FIXED_SCALE, InputFlag, type FighterState, type MatchState } from './types';

const WALK_SPEED = 75;
const JUMP_SPEED = 390;
const GRAVITY = 24;
const STAGE_LEFT = 80 * FIXED_SCALE;
const STAGE_RIGHT = 920 * FIXED_SCALE;

function fighter(x: number, facing: -1 | 1): FighterState {
  return { x, y: 0, velocityX: 0, velocityY: 0, health: 1_000, meter: 0, grounded: true, crouching: false, facing };
}

export function createInitialState(seed: number): MatchState {
  return { frame: 0, randomState: normalizeSeed(seed), fighters: [fighter(300 * FIXED_SCALE, 1), fighter(700 * FIXED_SCALE, -1)] };
}

function advanceFighter(current: FighterState, input: number): FighterState {
  const left = (input & InputFlag.Left) !== 0;
  const right = (input & InputFlag.Right) !== 0;
  const down = (input & InputFlag.Down) !== 0;
  const up = (input & InputFlag.Up) !== 0;
  const horizontal = Number(right) - Number(left);
  let velocityY = current.velocityY;
  let grounded = current.grounded;

  if (up && grounded && !down) { velocityY = JUMP_SPEED; grounded = false; }
  let y = current.y + velocityY;
  if (!grounded) velocityY -= GRAVITY;
  if (y <= 0) { y = 0; velocityY = 0; grounded = true; }

  const velocityX = down && grounded ? 0 : horizontal * WALK_SPEED;
  const x = Math.max(STAGE_LEFT, Math.min(STAGE_RIGHT, current.x + velocityX));
  return { ...current, x, y, velocityX, velocityY, grounded, crouching: down && grounded };
}

export function stepMatch(state: MatchState, inputs: readonly [number, number]): MatchState {
  let first = advanceFighter(state.fighters[0], inputs[0]);
  let second = advanceFighter(state.fighters[1], inputs[1]);
  const firstFaces: -1 | 1 = first.x <= second.x ? 1 : -1;
  const secondFaces: -1 | 1 = firstFaces === 1 ? -1 : 1;
  first = { ...first, facing: firstFaces };
  second = { ...second, facing: secondFaces };
  return { frame: state.frame + 1, randomState: nextRandom(state.randomState), fighters: [first, second] };
}
