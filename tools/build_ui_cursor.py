from __future__ import annotations

from pathlib import Path

import numpy as np
from scipy.io import wavfile


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist" / "assets" / "audio" / "sfx" / "ui_move.wav"
SAMPLE_RATE = 48_000
DURATION = 0.115


def oscillator(phase: np.ndarray, harmonics: tuple[tuple[float, int], ...]) -> np.ndarray:
    signal = np.zeros_like(phase)
    for level, multiple in harmonics:
        signal += level * np.sin(phase * multiple)
    return signal


def main() -> None:
    rng = np.random.default_rng(20260905)
    t = np.arange(round(SAMPLE_RATE * DURATION), dtype=np.float64) / SAMPLE_RATE

    # Fast upward glassy chirp with a rounded transient: modern, short and
    # tonal, with no square-wave or stepped-pitch components.
    start_hz, end_hz = 720.0, 1_180.0
    sweep = start_hz + (end_hz - start_hz) * np.minimum(t / 0.072, 1.0) ** 0.72
    phase = 2.0 * np.pi * np.cumsum(sweep) / SAMPLE_RATE
    attack = 1.0 - np.exp(-t * 1_300.0)
    decay = np.exp(-t * 31.0)
    body = oscillator(phase, ((0.62, 1), (0.23, 2), (0.08, 3))) * attack * decay

    bell_phase = 2.0 * np.pi * 1_920.0 * t
    bell = np.sin(bell_phase) * (1.0 - np.exp(-t * 900.0)) * np.exp(-t * 47.0) * 0.18
    click = rng.normal(0.0, 1.0, t.size) * np.exp(-t * 185.0) * 0.055
    mono = np.tanh((body + bell + click) * 1.35)

    # Sub-millisecond stereo offset and a small high-frequency difference give
    # width without smearing the onset.
    delay = 19
    right = np.pad(mono[:-delay], (delay, 0))
    shimmer = np.sin(2.0 * np.pi * 2_650.0 * t) * np.exp(-t * 58.0) * 0.035
    stereo = np.column_stack((mono + shimmer, right - shimmer))

    peak = np.max(np.abs(stereo))
    stereo = stereo / max(peak, 1e-9) * 0.82
    pcm = np.round(np.clip(stereo, -1.0, 1.0) * 32767.0).astype(np.int16)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUTPUT, SAMPLE_RATE, pcm)


if __name__ == "__main__":
    main()
