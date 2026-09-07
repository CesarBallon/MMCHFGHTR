export const FIGHTER_IDS = ['saja', 'benita', 'mariachay', 'asunta', 'shabuka', 'bella', 'jarjacha', 'coraima'] as const;
export const STAGE_IDS = ['titicaca', 'prison', 'machu', 'lima', 'circus', 'cumbia', 'mercado', 'arequipa'] as const;
export const ARCHETYPES = ['balanced', 'heavy', 'rush', 'stretch', 'power', 'staff', 'odd', 'whip'] as const;
export const MOVE_KINDS = ['normal', 'special', 'throw', 'super'] as const;
export const INPUT_TOKENS = ['left', 'right', 'up', 'down', 'light', 'heavy', 'special1', 'special2', 'block'] as const;

export type FighterId = (typeof FIGHTER_IDS)[number];
export type StageId = (typeof STAGE_IDS)[number];
export type Archetype = (typeof ARCHETYPES)[number];
export type MoveKind = (typeof MOVE_KINDS)[number];
export type InputToken = (typeof INPUT_TOKENS)[number];

export interface AnimationClipDefinition { readonly atlas: string; readonly startFrame: number; readonly frameCount: number; readonly framesPerSecond: number; readonly looping: boolean }
export interface MoveDefinition { readonly id: string; readonly displayName: string; readonly kind: MoveKind; readonly command: readonly InputToken[]; readonly startupFrames: number; readonly activeFrames: number; readonly recoveryFrames: number; readonly damage: number; readonly hitstunFrames: number; readonly blockstunFrames: number; readonly meterGain: number; readonly meterCost: number; readonly animation: AnimationClipDefinition }
export interface FighterStats { readonly walkSpeed: number; readonly jumpSpeed: number; readonly health: number; readonly powerPermille: number; readonly defensePermille: number; readonly renderHeight: number }
export interface FighterAssets { readonly canonicalModel: string; readonly legacyRuntime: string; readonly selection: string; readonly portrait: string }
export interface FighterDefinition { readonly schemaVersion: 1; readonly id: FighterId; readonly displayName: string; readonly archetype: Archetype; readonly homeStage: StageId; readonly theme: string; readonly assets: FighterAssets; readonly stats: FighterStats; readonly moves: readonly MoveDefinition[]; readonly specialMoveIds: readonly [string, string] }
export interface ValidationIssue { readonly path: string; readonly message: string }
export interface ValidationResult { readonly valid: boolean; readonly issues: readonly ValidationIssue[] }

export class DefinitionValidationError extends Error {
  constructor(readonly issues: readonly ValidationIssue[]) { super(issues.map(({ path, message }) => `${path}: ${message}`).join('\n')); this.name = 'DefinitionValidationError'; }
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const oneOf = <T extends readonly string[]>(value: unknown, values: T): value is T[number] => typeof value === 'string' && values.includes(value);
const add = (issues: ValidationIssue[], path: string, message: string): void => { issues.push({ path, message }); };
function stringField(value: unknown, issues: ValidationIssue[], path: string, pattern?: RegExp): value is string {
  if (typeof value !== 'string' || value.trim() === '') { add(issues, path, 'must be a non-empty string'); return false; }
  if (pattern && !pattern.test(value)) { add(issues, path, `must match ${String(pattern)}`); return false; }
  return true;
}
function integerField(value: unknown, issues: ValidationIssue[], path: string, min: number, max: number): value is number {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) { add(issues, path, `must be an integer from ${min} to ${max}`); return false; }
  return true;
}
function validateAnimation(value: unknown, issues: ValidationIssue[], path: string): void {
  if (!record(value)) { add(issues, path, 'must be an object'); return; }
  stringField(value.atlas, issues, `${path}.atlas`, /^[a-z0-9-]+$/); integerField(value.startFrame, issues, `${path}.startFrame`, 0, 4095); integerField(value.frameCount, issues, `${path}.frameCount`, 1, 64); integerField(value.framesPerSecond, issues, `${path}.framesPerSecond`, 16, 60);
  if (typeof value.looping !== 'boolean') add(issues, `${path}.looping`, 'must be a boolean');
}
function validateMove(value: unknown, issues: ValidationIssue[], path: string): void {
  if (!record(value)) { add(issues, path, 'must be an object'); return; }
  stringField(value.id, issues, `${path}.id`, /^[a-z][a-z0-9-]*$/); stringField(value.displayName, issues, `${path}.displayName`);
  if (!oneOf(value.kind, MOVE_KINDS)) add(issues, `${path}.kind`, `must be one of ${MOVE_KINDS.join(', ')}`);
  if (!Array.isArray(value.command) || value.command.length === 0 || value.command.some((token) => !oneOf(token, INPUT_TOKENS))) add(issues, `${path}.command`, `must contain valid input tokens: ${INPUT_TOKENS.join(', ')}`);
  integerField(value.startupFrames, issues, `${path}.startupFrames`, 0, 120); integerField(value.activeFrames, issues, `${path}.activeFrames`, 1, 120); integerField(value.recoveryFrames, issues, `${path}.recoveryFrames`, 0, 240); integerField(value.damage, issues, `${path}.damage`, 0, 1000); integerField(value.hitstunFrames, issues, `${path}.hitstunFrames`, 0, 240); integerField(value.blockstunFrames, issues, `${path}.blockstunFrames`, 0, 240); integerField(value.meterGain, issues, `${path}.meterGain`, 0, 1000); integerField(value.meterCost, issues, `${path}.meterCost`, 0, 1000); validateAnimation(value.animation, issues, `${path}.animation`);
}
function validateAssets(value: unknown, id: string, issues: ValidationIssue[]): void {
  if (!record(value)) { add(issues, 'assets', 'must be an object'); return; }
  const expected: Record<keyof FighterAssets, RegExp> = { canonicalModel: new RegExp(`^source-assets/canonical-models-v16/${id}\\.png$`), legacyRuntime: new RegExp(`^dist/assets/fighters/${id}\\.webp(?:\\?v=\\d+)?$`), selection: new RegExp(`^dist/assets/fighters/select-v16/${id}\\.webp(?:\\?v=\\d+)?$`), portrait: new RegExp(`^dist/assets/fighters/portraits-v16/${id}\\.webp(?:\\?v=\\d+)?$`) };
  for (const [key, pattern] of Object.entries(expected)) stringField(value[key], issues, `assets.${key}`, pattern);
}
function validateStats(value: unknown, issues: ValidationIssue[]): void {
  if (!record(value)) { add(issues, 'stats', 'must be an object'); return; }
  integerField(value.walkSpeed, issues, 'stats.walkSpeed', 1000, 8000); integerField(value.jumpSpeed, issues, 'stats.jumpSpeed', 8000, 16000); integerField(value.health, issues, 'stats.health', 500, 2000); integerField(value.powerPermille, issues, 'stats.powerPermille', 500, 2000); integerField(value.defensePermille, issues, 'stats.defensePermille', 500, 2000); integerField(value.renderHeight, issues, 'stats.renderHeight', 200, 500);
}
export function validateFighterDefinition(value: unknown): ValidationResult {
  const issues: ValidationIssue[] = []; if (!record(value)) return { valid: false, issues: [{ path: '$', message: 'must be an object' }] };
  if (value.schemaVersion !== 1) add(issues, 'schemaVersion', 'must equal 1'); const id = oneOf(value.id, FIGHTER_IDS) ? value.id : ''; if (!id) add(issues, 'id', `must be one of ${FIGHTER_IDS.join(', ')}`);
  stringField(value.displayName, issues, 'displayName'); if (!oneOf(value.archetype, ARCHETYPES)) add(issues, 'archetype', `must be one of ${ARCHETYPES.join(', ')}`); if (!oneOf(value.homeStage, STAGE_IDS)) add(issues, 'homeStage', `must be one of ${STAGE_IDS.join(', ')}`); stringField(value.theme, issues, 'theme', /^[A-Z][A-Za-z]+Theme\.mp3$/); validateAssets(value.assets, id, issues); validateStats(value.stats, issues);
  if (!Array.isArray(value.moves) || value.moves.length === 0) add(issues, 'moves', 'must contain at least one move'); else { value.moves.forEach((move, index) => validateMove(move, issues, `moves[${index}]`)); const ids = value.moves.filter(record).map((move) => move.id).filter((moveId): moveId is string => typeof moveId === 'string'); if (new Set(ids).size !== ids.length) add(issues, 'moves', 'move IDs must be unique'); }
  if (!Array.isArray(value.specialMoveIds) || value.specialMoveIds.length !== 2 || value.specialMoveIds.some((moveId) => typeof moveId !== 'string')) add(issues, 'specialMoveIds', 'must contain exactly two move IDs'); else if (value.specialMoveIds[0] === value.specialMoveIds[1]) add(issues, 'specialMoveIds', 'must contain two distinct move IDs'); else if (Array.isArray(value.moves)) for (const moveId of value.specialMoveIds) { const move = value.moves.find((candidate) => record(candidate) && candidate.id === moveId); if (!record(move) || move.kind !== 'special') add(issues, 'specialMoveIds', `${String(moveId)} must reference a special move`); }
  return { valid: issues.length === 0, issues };
}
export function parseFighterDefinition(value: unknown): FighterDefinition { const result = validateFighterDefinition(value); if (!result.valid) throw new DefinitionValidationError(result.issues); return value as FighterDefinition; }
export function validateRosterDefinitions(values: readonly unknown[], complete = false): ValidationResult {
  const issues: ValidationIssue[] = [], ids: string[] = []; values.forEach((value, index) => { const result = validateFighterDefinition(value); result.issues.forEach((entry) => add(issues, `fighters[${index}].${entry.path}`, entry.message)); if (record(value) && typeof value.id === 'string') ids.push(value.id); });
  if (new Set(ids).size !== ids.length) add(issues, 'fighters', 'fighter IDs must be unique'); if (complete) { for (const id of FIGHTER_IDS) if (!ids.includes(id)) add(issues, 'fighters', `missing required fighter ${id}`); for (const id of ids) if (!oneOf(id, FIGHTER_IDS)) add(issues, 'fighters', `contains unknown fighter ${id}`); }
  return { valid: issues.length === 0, issues };
}
