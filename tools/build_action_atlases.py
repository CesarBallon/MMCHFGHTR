from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]


def background_mask(rgb: np.ndarray) -> np.ndarray:
    height, width, _ = rgb.shape
    edge = np.concatenate(
        (
            rgb[:24].reshape(-1, 3),
            rgb[-24:].reshape(-1, 3),
            rgb[:, :24].reshape(-1, 3),
            rgb[:, -24:].reshape(-1, 3),
        )
    )
    edge_mean = edge.mean(axis=1)
    edge_chroma = edge.max(axis=1) - edge.min(axis=1)
    neutral_edge = edge_mean[edge_chroma <= 20]
    if neutral_edge.size < 100:
        raise ValueError("Unable to identify the checkerboard background")
    low = max(70.0, float(np.quantile(neutral_edge, 0.005)) - 14.0)
    high = min(255.0, float(np.quantile(neutral_edge, 0.995)) + 7.0)
    mean = rgb.mean(axis=2)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    candidate = (mean >= low) & (mean <= high) & (chroma <= 22)
    labels, _ = ndimage.label(candidate, structure=np.ones((3, 3), dtype=np.uint8))
    border_labels = np.unique(
        np.concatenate((labels[0], labels[-1], labels[:, 0], labels[:, -1]))
    )
    sizes = np.bincount(labels.ravel())
    enclosed_checker = np.flatnonzero(sizes >= 2_000)
    background_labels = np.unique(
        np.concatenate((border_labels[border_labels > 0], enclosed_checker[enclosed_checker > 0]))
    )
    return np.isin(labels, background_labels)


def clean_atlas(source_path: Path) -> Image.Image:
    source = Image.open(source_path).convert("RGB")
    rgb = np.asarray(source)
    alpha = np.where(background_mask(rgb), 0, 255).astype(np.uint8)
    height, width = alpha.shape
    for row in range(4):
        top, bottom = round(row * height / 4), round((row + 1) * height / 4)
        for column in range(4):
            left, right = round(column * width / 4), round((column + 1) * width / 4)
            cell = alpha[top:bottom, left:right] > 0
            labels, count = ndimage.label(cell, structure=np.ones((3, 3), dtype=np.uint8))
            sizes = np.bincount(labels.ravel())
            tiny = np.flatnonzero(sizes <= 5)
            tiny = tiny[tiny > 0]
            if count and tiny.size:
                alpha[top:bottom, left:right][np.isin(labels, tiny)] = 0
    return Image.fromarray(np.dstack((rgb, alpha)), "RGBA")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("fighter")
    parser.add_argument("atlases", nargs="+")
    parser.add_argument(
        "--raw-dir",
        type=Path,
        help="Directory containing uncommitted raw PNG atlases; defaults to source-assets/action-atlases/<fighter>/raw",
    )
    args = parser.parse_args()
    source = ROOT / "source-assets" / "action-atlases" / args.fighter
    raw = args.raw_dir or (source / "raw")
    runtime = ROOT / "dist" / "assets" / "fighters" / "actions" / args.fighter
    source.mkdir(parents=True, exist_ok=True)
    runtime.mkdir(parents=True, exist_ok=True)
    for name in args.atlases:
        cleaned = clean_atlas(raw / f"{name}.png")
        target = source / f"{name}.png"
        temporary = source / f".{name}.tmp.png"
        cleaned.save(temporary, "PNG", compress_level=1)
        with Image.open(temporary) as check:
            check.verify()
        temporary.replace(target)
        temporary.unlink(missing_ok=True)
        runtime_target = runtime / f"{name}.webp"
        runtime_temporary = runtime / f".{name}.tmp.webp"
        cleaned.save(runtime_temporary, "WEBP", lossless=True, method=6)
        with Image.open(runtime_temporary) as check:
            check.verify()
        runtime_temporary.replace(runtime_target)
        runtime_temporary.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
