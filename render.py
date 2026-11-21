"""Build SOLVANE entry.png from base.png.

Loads the square painterly base image (title already baked in), resizes it
to exactly 1024x1024, adds a soft vignette and a light film grain, and saves
the result as entry.png. If the PNG is over the 1 MiB cap, it falls back to
JPEG quality 92 (still named entry.png).
"""

import os
import random

from PIL import Image, ImageDraw, ImageFilter

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "base.png")
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "entry.png")
SIZE = (1024, 1024)
MAX_BYTES = 1_048_576


def add_vignette(img: Image.Image, strength: float = 0.16) -> Image.Image:
    """Darken the corners gently so the eye stays on the centre."""
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-w * 0.25, -h * 0.25, w * 1.25, h * 1.25), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.22))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(img, black, mask.point(lambda p: int(p * (1 - strength) + 255 * strength)))


def add_grain(img: Image.Image, amount: float = 0.05) -> Image.Image:
    """Sprinkle a light monochrome grain over the picture."""
    rng = random.Random(20261121)
    w, h = img.size
    px = img.load()
    span = int(255 * amount)
    for y in range(h):
        for x in range(w):
            n = rng.randint(-span, span)
            r, g, b = px[x, y]
            px[x, y] = (
                max(0, min(255, r + n)),
                max(0, min(255, g + n)),
                max(0, min(255, b + n)),
            )
    return img


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    img = img.resize(SIZE, Image.LANCZOS)
    img = add_vignette(img)
    img = add_grain(img)
    img.save(DST, format="PNG", optimize=True)
    if os.path.getsize(DST) > MAX_BYTES:
        img.save(DST, format="JPEG", quality=92)
    print(f"wrote {DST} ({os.path.getsize(DST)} bytes, {img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()
