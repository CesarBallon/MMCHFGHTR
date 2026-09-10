# Soundtrack playback improvements

Based on the 11 MP3s at main commit 7dcbddf. Original assets and checksums are unchanged.

## Implemented

- Decode into stereo floating-point Web Audio buffers, avoiding another lossy encode.
- Loop tracks using the measured leading/trailing -50 dBFS quiet-region bounds and a 750 ms linear crossfade. Linear mixing avoids increasing peak amplitude above either source. One-shot credits retain the full recording.
- Apply an additional 3 dB of music attenuation before output, beyond the existing 0.52 game volume. The highest measured source peak was +1.22 dBTP. This supplies headroom for music playback; it does not remaster the source file or guarantee headroom when combined with arbitrary effects.
- Abort superseded downloads and ignore stale decodes; release old buffers and nodes on track changes. Mute uses a short gain ramp.

Measurements in soundtrack-metrics.json were made with FFmpeg and decoded stereo samples; every source SHA-256 matched the repository manifest. Crossfades are provisional, not beat-aligned edits. Listening on headphones and speakers is still required to approve musical transitions. Source fidelity and audible distortion have not been judged by ear.

## Higher-quality exports: blocked on original masters

Provide original stereo WAV/FLAC masters or lossless DAW renders for all eleven named tracks. Do not upconvert the existing 128 kbps MP3s and label them higher fidelity. After receiving masters, render delivery files directly from them, verify decoded true peaks and loudness, recheck loop cues, update asset checksums, and run CI.

Suggested delivery acceptance criteria for this project: stereo preserved, decoded true peak at or below -1 dBTP, consistent loudness around -14 LUFS, and musically approved loops. Retain archival lossless masters separately from browser delivery assets. The existing recordings are roughly three minutes; no change to arrangement or duration is authorized by this playback patch.

## Validation

The music regression suite checks stereo retention, loop-boundary continuity, stale asynchronous requests, mute/headroom, repeated requests, and one-shot cleanup. Full project CI remains required. These tests do not substitute for listening or verify every browser's audio output hardware.
