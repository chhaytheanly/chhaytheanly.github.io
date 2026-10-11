#!/usr/bin/env python3

from __future__ import annotations

import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "src" / "assets" / "audio"
NAME = "bgm_dark_hour"

SR = 44100
BPM = 84.0
BEATS = 32                      # 8 bars
DURATION = BEATS * 60.0 / BPM   # 22.8s
TAIL = 2.0                      # fade so the loop point is silent


def adsr(n: int, attack: float, decay: float) -> np.ndarray:
    """Simple exponential envelope, normalised to a peak of 1."""
    env = np.exp(-np.linspace(0, 1, n) * decay)
    a = max(1, int(n * attack))
    env[:a] *= np.linspace(0, 1, a)
    return env


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    """One-pole lowpass — cheap, stable, keeps the pad from getting harsh."""
    alpha = 1.0 - np.exp(-2.0 * np.pi * cutoff / SR)
    out = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc)
        out[i] = acc
    return out


def voice(freq: float, dur: float, amp: float, detune: float = 0.0, kind: str = "saw") -> np.ndarray:
    n = int(SR * dur)
    t = np.arange(n) / SR
    phase = 2 * np.pi * (freq + detune) * t
    if kind == "sine":
        wave = np.sin(phase)
    elif kind == "tri":
        wave = 2 / np.pi * np.arcsin(np.sin(phase))
    else:  # detuned saw pair
        wave = (np.sin(phase) + np.sin(phase * 1.003) + 0.4 * np.sin(phase * 2.0)) / 2.4
    return wave * adsr(n, 0.08, 6.0) * amp


def main() -> int:
    print(f"→ composing {DURATION:.1f}s loop @ {BPM:.0f} BPM (A minor)")
    n_total = int(SR * (DURATION + TAIL))
    mix = np.zeros(n_total, dtype=np.float64)

    for freq, amp, detune in ((110.0, 0.22, 0.0), (164.81, 0.16, 0.6), (220.0, 0.14, -0.5), (261.63, 0.09, 0.9)):
        v = voice(freq, DURATION + TAIL, amp, detune)
        swell = 0.65 + 0.35 * np.sin(2 * np.pi * np.linspace(0, 1, len(v)) * 1.0 - np.pi / 2)
        mix[: len(v)] += v * swell

    scale = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00]
    pattern = [0, 2, 4, 3, 5, 4, 2, 0, 1, 3, 5, 3, 4, 2, 1, 0]
    for beat in range(BEATS):
        note = scale[pattern[beat % len(pattern)]] * (2.0 if beat % 8 >= 4 else 1.0)
        start = int(SR * 60.0 / BPM * beat)
        v = voice(note, 1.6, 0.085, kind="tri")
        mix[start : start + len(v)] += v

    step = 60.0 / BPM
    for beat in range(0, BEATS, 2):
        start = int(SR * step * beat)
        v = voice(55.0, 0.9, 0.16, kind="sine")
        mix[start : start + len(v)] += v

    rng = np.random.default_rng(7)
    noise = lowpass(rng.normal(0, 0.05, n_total), 900.0)
    swell = 0.5 + 0.5 * np.sin(2 * np.pi * np.linspace(0, 1, n_total) - np.pi / 2)
    mix += noise * swell * 0.35

    mix = lowpass(mix, 3200.0)

    fade = int(SR * TAIL)
    mix[-fade:] *= np.linspace(1, 0, fade) ** 1.6
    mix = mix[: int(SR * DURATION)]

    peak = np.max(np.abs(mix))
    mix = mix / peak * 0.85

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wav_path = OUT_DIR / f"{NAME}.wav"
    pcm = (mix * 32767).astype(np.int16)

    with wave.open(str(wav_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"✓ wav  {wav_path.relative_to(ROOT)}  ({wav_path.stat().st_size / 1024:.0f} kB)")

    mp3_path = OUT_DIR / f"{NAME}.mp3"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-b:a", "128k", str(mp3_path)],
            check=True,
        )
        wav_path.unlink()
        print(f"✓ mp3  {mp3_path.relative_to(ROOT)}  ({mp3_path.stat().st_size / 1024:.0f} kB)")
    except (FileNotFoundError, subprocess.CalledProcessError) as exc:
        print(f"! ffmpeg unavailable ({exc}) — keeping the wav instead", file=sys.stderr)

    print("\nDrop real tracks in src/assets/audio/ and list them in siteContent.music.tracks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
