import { describe, expect, test } from "vitest";
import { FIXED_SCALE, type WorldCollisionBox } from "../../src/core";
import { worldBoxToScreenRect } from "../../src/debug";

describe("combat debug overlay projection", () => {
  test("projects fixed-scale world boxes above the stage ground", () => {
    const box: WorldCollisionBox = {
      kind: "hitbox",
      fighter: 0,
      x: 100 * FIXED_SCALE,
      y: 20 * FIXED_SCALE,
      width: 80 * FIXED_SCALE,
      height: 60 * FIXED_SCALE,
      hitId: "braid-lash",
    };
    expect(
      worldBoxToScreenRect(box, {
        originX: 10,
        groundY: 500,
        pixelsPerWorldPixel: 2,
      }),
    ).toEqual({
      x: 210,
      y: 340,
      width: 160,
      height: 120,
    });
  });

  test("preserves subpixel screen coordinates without altering world data", () => {
    const box: WorldCollisionBox = {
      kind: "hurtbox",
      fighter: 1,
      x: 1_500,
      y: 2_500,
      width: 3_500,
      height: 4_500,
    };
    const original = structuredClone(box);
    expect(
      worldBoxToScreenRect(box, {
        originX: 0,
        groundY: 100,
        pixelsPerWorldPixel: 1,
      }),
    ).toEqual({ x: 1.5, y: 93, width: 3.5, height: 4.5 });
    expect(box).toEqual(original);
  });
});
