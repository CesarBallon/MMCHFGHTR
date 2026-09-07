import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { FIGHTERS, FIGHTERS_BY_ID, FIGHTER_IDS, validateRosterDefinitions } from '../../src/content';

const homes = { saja: ['titicaca', 'SajaTheme.mp3'], benita: ['prison', 'BenitaTheme.mp3'], mariachay: ['machu', 'MariachayTheme.mp3'], asunta: ['lima', 'AsuntaTheme.mp3'], shabuka: ['circus', 'ShabukaTheme.mp3'], bella: ['cumbia', 'BellaTheme.mp3'], jarjacha: ['mercado', 'JarjachaTheme.mp3'], coraima: ['arequipa', 'CoraimaTheme.mp3'] } as const;

describe('canonical fighter roster', () => {
  test('is complete, ordered and valid', () => { expect(FIGHTERS.map(({ id }) => id)).toEqual(FIGHTER_IDS); expect(validateRosterDefinitions(FIGHTERS, true)).toEqual({ valid: true, issues: [] }); });
  test('preserves home stages, themes and repository assets', () => { for (const fighter of FIGHTERS) { expect([fighter.homeStage, fighter.theme]).toEqual(homes[fighter.id]); expect(existsSync(`dist/assets/stages/${fighter.homeStage}.webp`)).toBe(true); expect(existsSync(`dist/assets/audio/soundtrack/${fighter.theme}`)).toBe(true); for (const path of Object.values(fighter.assets)) expect(existsSync(path.replace(/\?v=\d+$/, ''))).toBe(true); for (const move of fighter.moves) expect(existsSync(`dist/assets/fighters/actions/${fighter.id}/${move.animation.atlas}.webp`)).toBe(true); } });
  test('preserves baseline display proportions', () => { expect(FIGHTERS.map(({ stats }) => stats.renderHeight)).toEqual([306, 312, 288, 315, 337, 321, 321, 318]); expect(FIGHTERS_BY_ID.mariachay.stats.renderHeight).toBeLessThan(FIGHTERS_BY_ID.saja.stats.renderHeight); });
  test('contains no retired Jarana identity', () => expect(JSON.stringify(FIGHTERS)).not.toMatch(/jarana/i));
});
