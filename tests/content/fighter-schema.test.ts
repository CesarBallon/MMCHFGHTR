import { describe, expect, test } from "vitest";
import {
  FIGHTER_IDS,
  parseFighterDefinition,
  validateFighterDefinition,
  validateRosterDefinitions,
  type FighterDefinition,
  type FighterId,
} from "../../src/content";

function definition(id: FighterId = "saja"): FighterDefinition {
  const move = (
    moveId: string,
    command: "special1" | "special2",
  ): FighterDefinition["moves"][number] => ({
    id: moveId,
    displayName: moveId,
    kind: "special",
    command: [command],
    startupFrames: 8,
    activeFrames: 5,
    recoveryFrames: 18,
    damage: 130,
    hitstunFrames: 18,
    blockstunFrames: 9,
    meterGain: 20,
    meterCost: 0,
    animation: {
      atlas: moveId,
      startFrame: 0,
      frameCount: 16,
      framesPerSecond: 16,
      looping: false,
    },
  });
  return {
    schemaVersion: 1,
    id,
    displayName: id.toUpperCase(),
    archetype: "whip",
    homeStage: "titicaca",
    theme: `${id[0]?.toUpperCase()}${id.slice(1)}Theme.mp3`,
    assets: {
      canonicalModel: `source-assets/canonical-models-v16/${id}.png`,
      legacyRuntime: `dist/assets/fighters/${id}.webp`,
      selection: `dist/assets/fighters/select-v16/${id}.webp?v=1`,
      portrait: `dist/assets/fighters/portraits-v16/${id}.webp?v=1`,
    },
    stats: {
      walkSpeed: 4_000,
      jumpSpeed: 12_000,
      health: 1_000,
      powerPermille: 1_000,
      defensePermille: 1_000,
      renderHeight: 306,
    },
    moves: [move("braid-lash", "special1"), move("saya-wave", "special2")],
    specialMoveIds: ["braid-lash", "saya-wave"],
  };
}

describe("fighter definition contract", () => {
  test("accepts and parses a complete valid definition", () => {
    expect(validateFighterDefinition(definition())).toEqual({
      valid: true,
      issues: [],
    });
    expect(parseFighterDefinition(definition()).id).toBe("saja");
  });
  test("rejects unsupported schema versions", () =>
    expect(() =>
      parseFighterDefinition({ ...definition(), schemaVersion: 2 }),
    ).toThrow(/schemaVersion/));
  test("rejects values outside deterministic integer ranges", () => {
    const candidate = structuredClone(definition()) as unknown as {
      stats: { walkSpeed: number };
      moves: {
        startupFrames: number;
        animation: { framesPerSecond: number };
      }[];
    };
    candidate.stats.walkSpeed = 4.5;
    candidate.moves[0]!.startupFrames = -1;
    candidate.moves[0]!.animation.framesPerSecond = 15;
    const paths = validateFighterDefinition(candidate).issues.map(
      ({ path }) => path,
    );
    expect(paths).toContain("stats.walkSpeed");
    expect(paths).toContain("moves[0].startupFrames");
    expect(paths).toContain("moves[0].animation.framesPerSecond");
  });
  test("rejects asset paths belonging to another fighter", () => {
    const candidate = structuredClone(definition()) as unknown as {
      assets: { portrait: string };
    };
    candidate.assets.portrait =
      "dist/assets/fighters/portraits-v16/benita.webp";
    expect(
      validateFighterDefinition(candidate).issues.map(({ path }) => path),
    ).toContain("assets.portrait");
  });
  test("requires two distinct references to special moves", () => {
    const duplicate = structuredClone(definition()) as unknown as {
      specialMoveIds: string[];
    };
    duplicate.specialMoveIds = ["braid-lash", "braid-lash"];
    expect(
      validateFighterDefinition(duplicate).issues.map(({ path }) => path),
    ).toContain("specialMoveIds");
    const normal = structuredClone(definition()) as unknown as {
      moves: { kind: string }[];
    };
    normal.moves[1]!.kind = "normal";
    expect(
      validateFighterDefinition(normal).issues.map(({ path }) => path),
    ).toContain("specialMoveIds");
  });
  test("rejects duplicate move IDs", () => {
    const candidate = structuredClone(definition()) as unknown as {
      moves: { id: string }[];
    };
    candidate.moves[1]!.id = candidate.moves[0]!.id;
    expect(
      validateFighterDefinition(candidate).issues.map(({ path }) => path),
    ).toContain("moves");
  });
  test("rejects duplicate fighter IDs", () =>
    expect(validateRosterDefinitions([definition(), definition()]).valid).toBe(
      false,
    ));
  test("reports every missing fighter when completeness is required", () => {
    const missing = validateRosterDefinitions(
      [definition()],
      true,
    ).issues.filter(({ message }) =>
      message.startsWith("missing required fighter"),
    );
    expect(missing).toHaveLength(FIGHTER_IDS.length - 1);
  });
});
