import {
  FIXED_SCALE,
  type CombatDebugSnapshot,
  type WorldCollisionBox,
} from "../core";

export interface DebugViewTransform {
  readonly originX: number;
  readonly groundY: number;
  readonly pixelsPerWorldPixel: number;
}

export interface ScreenRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const BOX_COLORS = {
  hurtbox: "#36d46b",
  hitbox: "#ff3b3b",
  pushbox: "#40a9ff",
  "throw-range": "#ffd43b",
} as const;

export function worldBoxToScreenRect(
  box: WorldCollisionBox,
  view: DebugViewTransform,
): ScreenRect {
  const scale = view.pixelsPerWorldPixel / FIXED_SCALE;
  return {
    x: view.originX + box.x * scale,
    y: view.groundY - (box.y + box.height) * scale,
    width: box.width * scale,
    height: box.height * scale,
  };
}

export function renderCombatDebugOverlay(
  context: CanvasRenderingContext2D,
  snapshot: CombatDebugSnapshot,
  view: DebugViewTransform,
): void {
  context.save();
  context.lineWidth = 2;
  context.font = "12px monospace";
  context.textBaseline = "bottom";

  for (const fighter of snapshot.fighters) {
    const scale = view.pixelsPerWorldPixel / FIXED_SCALE;
    const footX = view.originX + fighter.footX * scale;
    const footY = view.groundY - fighter.footY * scale;
    const shadowX = view.originX + fighter.shadowX * scale;
    const shadowWidth = fighter.shadowWidth * scale;

    context.save();
    context.globalAlpha = fighter.shadowOpacityPermille / 1_000;
    context.fillStyle = "#000";
    context.beginPath();
    context.ellipse(
      shadowX,
      view.groundY,
      shadowWidth / 2,
      Math.max(3, shadowWidth / 10),
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.restore();

    context.fillStyle = "#fff";
    context.fillRect(footX - 2, footY - 2, 4, 4);
    context.fillText(
      `P${fighter.fighter + 1} ${fighter.stateId} [${fighter.sourceFrame}]`,
      footX + 6,
      footY - 6,
    );

    for (const box of fighter.boxes) {
      const rect = worldBoxToScreenRect(box, view);
      context.strokeStyle = BOX_COLORS[box.kind];
      context.setLineDash(
        box.kind === "pushbox"
          ? [5, 3]
          : box.kind === "throw-range"
            ? [2, 3]
            : [],
      );
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      if (box.hitId) {
        context.fillStyle = BOX_COLORS.hitbox;
        context.fillText(box.hitId, rect.x, rect.y - 2);
      }
    }
  }

  context.setLineDash([]);
  context.restore();
}
