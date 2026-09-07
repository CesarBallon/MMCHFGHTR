import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
  FIGHTERS,
  FIGHTERS_BY_ID,
  FIGHTER_IDS,
  validateRosterDefinitions,
} from "../../src/content";

const baseline = {
  saja: [
    "titicaca",
    "SajaTheme.mp3",
    4_800,
    12_400,
    940,
    1_000,
    306,
    "braid-lash",
    "saya-wave",
    13,
    12,
  ],
  benita: [
    "prison",
    "BenitaTheme.mp3",
    3_450,
    10_400,
    1_200,
    1_130,
    312,
    "beer-bath",
    "revolver",
    9,
    16,
  ],
  mariachay: [
    "machu",
    "MariachayTheme.mp3",
    5_350,
    13_200,
    900,
    910,
    288,
    "rolling-rush",
    "sky-slap",
    14,
    16,
  ],
  asunta: [
    "lima",
    "AsuntaTheme.mp3",
    3_750,
    10_700,
    1_020,
    1_080,
    315,
    "baby-shriek",
    "diaper-toss",
    5,
    12,
  ],
  shabuka: [
    "circus",
    "ShabukaTheme.mp3",
    3_800,
    11_600,
    1_250,
    1_160,
    337,
    "pom-power",
    "rising-cheer",
    13,
    17,
  ],
  bella: [
    "cumbia",
    "BellaTheme.mp3",
    4_450,
    11_800,
    1_000,
    960,
    321,
    "high-note",
    "mic-return",
    5,
    12,
  ],
  jarjacha: [
    "mercado",
    "JarjachaTheme.mp3",
    4_150,
    11_300,
    960,
    900,
    321,
    "dizzy-hands",
    "sandal-return",
    4,
    11,
  ],
  coraima: [
    "arequipa",
    "CoraimaTheme.mp3",
    4_750,
    12_300,
    1_040,
    1_000,
    318,
    "flying-kiss",
    "tornado-heel",
    10,
    16,
  ],
} as const;

describe("canonical fighter roster", () => {
  test("is complete, ordered and valid", () => {
    expect(FIGHTERS.map(({ id }) => id)).toEqual(FIGHTER_IDS);
    expect(validateRosterDefinitions(FIGHTERS, true)).toEqual({
      valid: true,
      issues: [],
    });
  });
  test("preserves all baseline gameplay and presentation values", () => {
    for (const fighter of FIGHTERS) {
      const specials = fighter.moves.filter(({ kind }) => kind === "special");
      expect([
        fighter.homeStage,
        fighter.theme,
        fighter.stats.walkSpeed,
        fighter.stats.jumpSpeed,
        fighter.stats.powerPermille,
        fighter.stats.defensePermille,
        fighter.stats.renderHeight,
        specials[0]?.animation.atlas,
        specials[1]?.animation.atlas,
        specials[0]?.damage,
        specials[1]?.damage,
      ]).toEqual(baseline[fighter.id]);
    }
  });
  test("points to every required repository asset", () => {
    for (const fighter of FIGHTERS) {
      expect(existsSync(`dist/assets/stages/${fighter.homeStage}.webp`)).toBe(
        true,
      );
      expect(existsSync(`dist/assets/audio/soundtrack/${fighter.theme}`)).toBe(
        true,
      );
      for (const path of Object.values(fighter.assets))
        expect(existsSync(path.replace(/\?v=\d+$/, ""))).toBe(true);
      for (const move of fighter.moves)
        expect(
          existsSync(
            `dist/assets/fighters/actions/${fighter.id}/${move.animation.atlas}.webp`,
          ),
        ).toBe(true);
    }
  });
  test("preserves relative display proportions", () => {
    expect(FIGHTERS_BY_ID.mariachay.stats.renderHeight).toBeLessThan(
      FIGHTERS_BY_ID.saja.stats.renderHeight,
    );
    expect(FIGHTERS_BY_ID.shabuka.stats.renderHeight).toBeGreaterThan(
      FIGHTERS_BY_ID.coraima.stats.renderHeight,
    );
  });
  test("contains no retired Jarana identity or asset reference", () =>
    expect(JSON.stringify(FIGHTERS)).not.toMatch(/jarana/i));
});
