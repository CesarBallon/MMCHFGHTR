from __future__ import annotations

from pathlib import Path
import math

import numpy as np
from PIL import Image
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets" / "canonical-models-v16"
SPRITES = ROOT / "dist" / "assets" / "fighters" / "select-v16"
PORTRAITS = ROOT / "dist" / "assets" / "fighters" / "portraits-v16"
FIGHTERS = ("saja", "benita", "mariachay", "asunta", "shabuka", "bella", "jarjacha", "coraima")
PORTRAIT_CENTER = {
    "saja": 0.53,
    "benita": 0.50,
    "mariachay": 0.49,
    "asunta": 0.40,
    "shabuka": 0.50,
    "bella": 0.58,
    "jarjacha": 0.50,
    "coraima": 0.50,
}


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("empty source alpha")
    return bbox


def resize_reference(image: Image.Image, height: int = 768) -> Image.Image:
    bbox = alpha_bbox(image)
    crop = image.crop(bbox)
    scale = height / crop.height
    return crop.resize((round(crop.width * scale), height), Image.Resampling.LANCZOS)


def breathing_frame(reference: Image.Image, phase: float, pad: int = 48) -> Image.Image:
    frame = Image.new("RGBA", (reference.width + pad * 2, reference.height + pad * 2), (0, 0, 0, 0))
    frame.alpha_composite(reference, (pad, pad))
    rgba = np.asarray(frame).astype(np.float32) / 255.0
    alpha = rgba[:, :, 3]
    premul = rgba[:, :, :3] * alpha[:, :, None]

    h, w = alpha.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    body_top, body_bottom = float(pad), float(pad + reference.height - 1)
    rel = np.clip((yy - body_top) / max(1.0, body_bottom - body_top), 0.0, 1.0)
    inhale = 0.5 - 0.5 * math.cos(phase)

    # Local deformation only: shoulders rise, the chest expands, and the
    # effect tapers continuously to zero at the feet. No root translation.
    upper_lift = -4.6 * inhale * np.power(1.0 - rel, 1.65)
    chest = np.exp(-np.square((rel - 0.31) / 0.145))
    ribs = np.exp(-np.square((rel - 0.43) / 0.23))
    width_scale = 1.0 + inhale * (0.0105 * chest + 0.0025 * ribs)
    center_x = w * 0.5

    src_y = yy - upper_lift
    src_x = center_x + (xx - center_x) / width_scale
    coords = np.stack((src_y, src_x))

    out_alpha = ndimage.map_coordinates(alpha, coords, order=1, mode="constant", cval=0.0)
    out_rgb = np.empty_like(premul)
    for channel in range(3):
        out_rgb[:, :, channel] = ndimage.map_coordinates(
            premul[:, :, channel], coords, order=1, mode="constant", cval=0.0
        )
    safe_alpha = np.maximum(out_alpha, 1e-5)
    out_rgb = np.where(out_alpha[:, :, None] > 1e-5, out_rgb / safe_alpha[:, :, None], 0.0)
    out = np.dstack((np.clip(out_rgb, 0, 1), np.clip(out_alpha, 0, 1)))
    return Image.fromarray(np.round(out * 255).astype(np.uint8), "RGBA")


def build_sheet(name: str, source: Image.Image) -> None:
    reference = resize_reference(source)
    frames = [breathing_frame(reference, i * math.tau / 12) for i in range(12)]
    cell_w, cell_h = frames[0].size
    sheet = Image.new("RGBA", (cell_w * 4, cell_h * 3), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((i % 4) * cell_w, (i // 4) * cell_h))
    sheet.save(SPRITES / f"{name}.webp", "WEBP", quality=96, method=6)


def build_portrait(name: str, source: Image.Image) -> None:
    left, top, right, bottom = alpha_bbox(source)
    bw, bh = right - left, bottom - top
    crop_h = bh * 0.38
    crop_w = crop_h * 0.80
    center_x = left + bw * PORTRAIT_CENTER[name]
    crop_left = center_x - crop_w / 2
    crop_top = top - crop_h * 0.015
    crop = source.crop((round(crop_left), round(crop_top), round(crop_left + crop_w), round(crop_top + crop_h)))
    portrait = crop.resize((512, 640), Image.Resampling.LANCZOS)
    portrait.save(PORTRAITS / f"{name}.webp", "WEBP", quality=95, method=6)


def main() -> None:
    SPRITES.mkdir(parents=True, exist_ok=True)
    PORTRAITS.mkdir(parents=True, exist_ok=True)
    for name in FIGHTERS:
        source = Image.open(SOURCE / f"{name}.png").convert("RGBA")
        build_sheet(name, source)
        build_portrait(name, source)


if __name__ == "__main__":
    main()
