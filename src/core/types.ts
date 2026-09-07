export const SIMULATION_HZ = 60 as const;
export const FIXED_SCALE = 1_000 as const;

export const enum InputFlag {
  Left = 1 << 0,
  Right = 1 << 1,
  Up = 1 << 2,
  Down = 1 << 3,
  Light = 1 << 4,
  Heavy = 1 << 5,
  Special1 = 1 << 6,
  Special2 = 1 << 7,
  Block = 1 << 8,
}

export interface FighterState {
  fighterId: import("../content").FighterId;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  health: number;
  meter: number;
  grounded: boolean;
  crouching: boolean;
  facing: -1 | 1;
  action: FighterAction;
  actionFrame: number;
  hitResolved: boolean;
  stunFrames: number;
}

export type FighterAction =
  | "idle"
  | "walk"
  | "crouch"
  | "jump"
  | "block"
  | "hitstun"
  | "ko"
  | `move:${string}`;
export type MatchPhase = "fight" | "round-over" | "match-over";

export interface MatchState {
  frame: number;
  randomState: number;
  fighters: readonly [FighterState, FighterState];
  previousInputs: readonly [number, number];
  phase: MatchPhase;
  phaseFrames: number;
  round: number;
  roundWins: readonly [number, number];
  roundWinner: 0 | 1 | null;
  matchWinner: 0 | 1 | null;
}

export interface FrameInput {
  readonly frame: number;
  readonly players: readonly [number, number];
}

export interface Replay {
  readonly version: 1;
  readonly seed: number;
  readonly inputs: readonly FrameInput[];
  readonly fighters?: readonly [
    import("../content").FighterId,
    import("../content").FighterId,
  ];
}
