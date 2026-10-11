#!/usr/bin/env python3

from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "pf" / "persona3.png"
OUT = ROOT / "src" / "assets" / "portrait.png"

BG = (15, 176, 247)  # the artwork's flat background
INNER = 34.0         # fully transparent below this distance
OUTER = 96.0         # fully opaque above this distance (soft edge in between)
TARGET_W = 900
KEEP_TOP_FRAC = 0.70


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)


def main() -> int:
    if not SRC.exists():
        print(f"✗ missing source: {SRC}", file=sys.stderr)
        return 1

    print(f"→ reading {SRC}")
    img = Image.open(SRC).convert("RGB")

    print("→ rotating 180°")
    img = img.transpose(Image.Transpose.ROTATE_180)

    print("→ chroma-keying the cyan field (soft matte)")
    px = img.load()
    w, h = img.size
    matte = Image.new("L", (w, h))
    mpx = matte.load()

    keyed = 0
    for y in range(h):
        for x in range(w):
            d = dist(px[x, y], BG)
            if d <= INNER:
                alpha = 0
                keyed += 1
            elif d >= OUTER:
                alpha = 255
            else:
                alpha = int(255 * (d - INNER) / (OUTER - INNER))
            mpx[x, y] = alpha

    img.putalpha(matte)

    print("→ trimming transparent margin")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"   content box: {bbox}")

    print(f"→ cropping to the top {KEEP_TOP_FRAC:.0%} (drops the logo)")
    img = img.crop((0, 0, img.width, int(img.height * KEEP_TOP_FRAC)))

    print(f"→ resizing to {TARGET_W}px wide")
    if img.width > TARGET_W:
        ratio = TARGET_W / img.width
        img = img.resize((TARGET_W, int(img.height * ratio)), Image.LANCZOS)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, optimize=True)

    print(f"✓ {OUT.relative_to(ROOT)}  {img.width}×{img.height}  {OUT.stat().st_size / 1024:.0f} kB")
    print(f"  keyed {keyed / (w * h) * 100:.1f}% of pixels to transparent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
