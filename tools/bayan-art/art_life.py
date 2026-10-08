"""Hand-drawn art that brings the town to life: water, animals, markers, effects, the store, the taho pole."""
from PIL import Image

T = 16


def sprite(PAL, rgba, rows, ox=0, oy=0):
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch in PAL and 0 <= x + ox < T and 0 <= y + oy < T:
                im.putpixel((x + ox, y + oy), rgba(PAL[ch]))
    return im


def bob(im):
    """Second walk frame: body one pixel lower, feet stay."""
    out = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    out.paste(im.crop((0, 0, T, 13)), (0, 1))
    out.alpha_composite(im.crop((0, 13, T, T)), (0, 13))
    return out


CHICKEN = [
    "......00..",
    ".....0RR0.",
    "....0WWW0.",
    "....0WNWY0",
    "....0WWW00",
    ".00.0WWW0.",
    "0WW0WWWWW0",
    "0WWWWWLWW0",
    ".0WWWLLW0.",
    "..0WWWW0..",
    "...0YY0...",
    "...Y..Y...",
]


DOG = [
    "..........00...",
    ".........0dd0..",
    ".........0bbb00",
    "0........0bNbbN0",
    "b0.......0bbbb00",
    ".b0000000bbbb0..",
    "..0bbbbbbbbbb0..",
    "..0bTTTTTTbbb0..",
    "..0bbbbbbbbbb0..",
    "..0bb0....0bb0..",
    "..000.....000...",
]

CAT = [
    ".0......0.",
    "0T0....0T0",
    "0TT0000TT0",
    "0TTTTTTTT0",
    "0TNTTTTNT0",
    "0TTTpTTTT0",
    ".0TTTTTT0.",
    "..0TOOT0..",
    ".0TTOOTT00",
    ".0TTTTTTT0T0",
    "..0TT0TT0T0",
    "...00.00.0.",
]

CAT_BLINK = [row.replace("N", "0") for row in CAT]




ARROW = [
    "...0000...",
    "...0YY0...",
    "...0YO0...",
    "...0YO0...",
    "0000YO0000",
    "0YYYYYYOO0",
    ".0YYYYYO0.",
    "..0YYYO0..",
    "...0YO0...",
    "....00....",
]

TALK = [
    "....00000000....",
    "...0YYYYYYYY0...",
    "..0YYYYNNYYYY0..",
    "..0YYYYNNYYYY0..",
    "..0YYYYNNYYYY0..",
    "..0YYYYNNYYYY0..",
    "..0YYYYNNYYYY0..",
    "..0YYYYYYYYYY0..",
    "..0YYYYNNYYYY0..",
    "..0YYYYNNYYYY0..",
    "...0YYYYYYYY0...",
    "....00YYY000....",
    "......0YY0......",
    ".......00.......",
]



CONFETTI = [
    "WWW",
    "WWW",
]

LAMP = [
    "......0000......",
    ".....0YYYY0.....",
    ".....0YWWY0.....",
    ".....0YYYY0.....",
    "......0000......",
    ".......00.......",
    "......0NN0......",
    "......0NN0......",
    "......0NN0......",
    "......0NN0......",
    "......0NN0......",
    "......0NN0......",
    "......0NN0......",
    ".....0NNNN0.....",
    ".....000000.....",
]

BENCH = [
    "................",
    "................",
    "................",
    "................",
    "................",
    ".00000000000000.",
    ".0bTTTTTTTTTTb0.",
    ".0bbbbbbbbbbbb0.",
    ".00000000000000.",
    ".0TTTTTTTTTTTT0.",
    ".0bbbbbbbbbbbb0.",
    ".00000000000000.",
    ".0d0........0d0.",
    ".000........000.",
]

REEDS = [
    "................",
    "...d......d.....",
    "...d...d..d.....",
    "...g...d..g.....",
    "..0g0..g.0g0....",
    "..0g0.0g00g0....",
    "..0G00gG0G0.....",
    "...0G0G0G0......",
    "...0GGGGG0......",
    "....00000.......",
]

TAHO = [
    "................",
    "................",
    "0dddddddddddddd0",
    "0dddddddddddddd0",
    ".0.0........0.0.",
    "0L0L0......0L0L0",
    "0LLL0......0LLL0",
    "0WLM0......0WLM0",
    "0LLM0......0LLM0",
    ".000........000.",
]

FLOWERS = [
    "................",
    "..p.......Y.....",
    ".pYp.....YRY....",
    "..p...B...Y.....",
    "..g..BYB..g..p..",
    "..g...B...g.pYp.",
    "......g......p..",
    "......g......g..",
]


def flag_frame(PAL, rgba, wave):
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    px = lambda x, y, c: im.putpixel((x, y), rgba(PAL[c])) if 0 <= y < T else None
    for y in range(1, 16):
        px(1, y, "0"); px(2, y, "L" if y < 15 else "M"); px(3, y, "0")
    px(2, 0, "0"); px(1, 1, "0"); px(3, 1, "0"); px(2, 1, "Y")
    left, right = 4, 14
    tri = {0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1}
    for x in range(left - 1, right + 1):
        # Each column dips by 0 or 1 pixel, so the flag ripples between frames.
        dip = ((x + wave) // 3) % 2 if x >= left + 2 else 0
        top = 2 + dip
        for i in range(9):
            y = top + i
            if x == left - 1:
                continue
            if x == right:
                c = "0"
            elif x - left < tri[i]:
                c = "W"
            else:
                c = "B" if i <= 4 else "R"
            px(x, y, c)
        if x >= left:
            px(x, top - 1, "0"); px(x, top + 9, "0")
    px(left + 1, 6, "Y"); px(left, 3, "Y"); px(left, 9, "Y"); px(left + 3, 6, "Y")
    return im


def pond_tiles(PAL, rgba):
    """A 3 by 3 set: corners, edges, and the middle of a pond. Edges repeat for bigger ponds."""
    size = 48
    big = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    r = 7
    inset = 2

    def inside(x, y, pad):
        lo, hi = inset + pad, size - 1 - inset - pad
        rr = r - pad
        if x < lo or x > hi or y < lo or y > hi:
            return False
        cx = min(max(x, lo + rr), hi - rr)
        cy = min(max(y, lo + rr), hi - rr)
        return (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr

    for y in range(size):
        for x in range(size):
            if not inside(x, y, 0):
                continue
            if not inside(x, y, 1):
                c = "0"
            elif not inside(x, y, 2):
                c = "c"
            else:
                c = "B"
            big.putpixel((x, y), rgba(PAL[c]))
    # Ripples in the middle tile only, so repeated middles stay calm.
    for (x, y) in [(19, 20), (20, 20), (21, 20), (27, 27), (28, 27)]:
        big.putpixel((x, y), rgba(PAL["c"]))
    tiles = {}
    names = [["nw", "n", "ne"], ["w", "c", "e"], ["sw", "s", "se"]]
    for j in range(3):
        for i in range(3):
            tiles[f"water-{names[j][i]}"] = big.crop((i * T, j * T, i * T + T, j * T + T))
    return tiles


def store_tiles(PAL, rgba):
    """Sari-sari store, 3 tiles wide and 2 tall: a striped awning over a counter of goods."""
    w, h = 48, 32
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = lambda x, y, c: im.putpixel((x, y), rgba(PAL[c]))
    # awning
    for x in range(1, w - 1):
        px(x, 1, "0")
        for y in range(2, 11):
            stripe = "R" if (x // 4) % 2 == 0 else "W"
            if y == 10:
                stripe = "r" if stripe == "R" else "L"
            px(x, y, stripe)
        px(x, 11, "0")
    for y in range(1, 12):
        px(0, y, "0"); px(w - 1, y, "0")
    # scallops
    for x in range(1, w - 1):
        if x % 4 in (1, 2):
            px(x, 12, "R" if (x // 4) % 2 == 0 else "W")
            px(x, 13, "0")
        else:
            px(x, 12, "0")
    # posts
    for y in range(12, 20):
        for x in (2, w - 3):
            px(x - 1, y, "0"); px(x, y, "b"); px(x + 1, y, "0")
    # back shelf with goods
    for x in range(4, w - 4):
        px(x, 14, "d")
    goods = "YBRGpYTRBg"
    for i, x in enumerate(range(5, w - 5, 4)):
        c = goods[i % len(goods)]
        px(x, 15, "0"); px(x + 1, 15, "0")
        px(x, 16, c); px(x + 1, 16, c)
        px(x, 17, c); px(x + 1, 17, "W")
    # counter
    for x in range(1, w - 1):
        px(x, 19, "0")
        for y in range(20, h - 1):
            px(x, y, "T" if y < 22 else "b")
        px(x, h - 1, "0")
    for y in range(19, h):
        px(0, y, "0"); px(w - 1, y, "0")
    for x in range(6, w - 6, 8):
        for y in range(23, h - 2):
            px(x, y, "d")
    return {
        "store-nw": im.crop((0, 0, 16, 16)), "store-n": im.crop((16, 0, 32, 16)), "store-ne": im.crop((32, 0, 48, 16)),
        "store-sw": im.crop((0, 16, 16, 32)), "store-s": im.crop((16, 16, 32, 32)), "store-se": im.crop((32, 16, 48, 32)),
    }


def add_life(EXTRA, PAL, rgba):
    s = lambda rows, ox=0, oy=0: sprite(PAL, rgba, rows, ox, oy)
    chicken = s(CHICKEN, 3, 3)
    EXTRA["chicken"] = chicken
    EXTRA["chicken-step"] = bob(chicken)
    dog = s(DOG, 0, 4)
    EXTRA["dog"] = dog
    EXTRA["dog-step"] = bob(dog)
    EXTRA["cat"] = s(CAT, 3, 3)
    EXTRA["cat-blink"] = s(CAT_BLINK, 3, 3)
    EXTRA["arrow"] = s(ARROW, 3, 3)
    EXTRA["talk"] = s(TALK, 0, 0)
    EXTRA["confetti"] = s(CONFETTI, 6, 7)
    EXTRA["lamp"] = s(LAMP, 0, 1)
    EXTRA["bench"] = s(BENCH, 0, 1)
    EXTRA["reeds"] = s(REEDS, 0, 6)
    # Mang Ben's taho pole, drawn across his shoulders.
    EXTRA["hold-taho"] = s(TAHO, 0, 7)
    EXTRA["flowers"] = s(FLOWERS, 0, 7)
    EXTRA["flag-wave"] = flag_frame(PAL, rgba, 0)
    EXTRA["flag-wave-2"] = flag_frame(PAL, rgba, 2)
    EXTRA.update(pond_tiles(PAL, rgba))
    EXTRA.update(store_tiles(PAL, rgba))
