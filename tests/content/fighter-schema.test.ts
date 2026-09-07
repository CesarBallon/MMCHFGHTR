import { describe, expect, test } from 'vitest';
import { validateFighterDefinition } from '../../src/content';

describe('fighter definition validation', () => {
  test('rejects a non-object', () => expect(validateFighterDefinition(null).valid).toBe(false));
  test('rejects an incomplete object', () => expect(validateFighterDefinition({ schemaVersion: 1 }).valid).toBe(false));
  test('enforces the minimum authored animation rate', () => {
    const result = validateFighterDefinition({ schemaVersion: 1, id: 'saja', displayName: 'Saja', archetype: 'whip', homeStage: 'titicaca', theme: 'SajaTheme.mp3', assets: {}, stats: {}, moves: [{ animation: { framesPerSecond: 15 } }], specialMoveIds: [] });
    expect(result.issues.some(({ path }) => path.endsWith('framesPerSecond'))).toBe(true);
  });
});
