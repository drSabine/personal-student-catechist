"""The town's own art: buildings, the park, Filipino street life, held tools, and the walk grid.

Big pieces are drawn whole on a canvas and cut into 16px tiles named `<piece>-<col>-<row>`,
so the map can place them by name. Empty tiles are left out.
"""
from PIL import Image

T = 16
OUT = (63, 38, 49, 255)

C = {
    "0": "#3f2631", "white": "#ffffff", "whites": "#d6dde8", "light": "#c0cbdc", "mid": "#8b9bb4", "dark": "#52607c",
    "navy": "#262b44", "red": "#e84537", "reds": "#b0332a", "redd": "#7f2420", "yellow": "#fdbe53", "yellows": "#e38628",
    "blue": "#3d8fd6", "blues": "#2a6aa8", "sky": "#9fd6ff", "green": "#5aa65a", "greens": "#3d7a43", "greend": "#2b5a33",
    "leaf": "#84c669", "leafs": "#479f4a", "cream": "#f6ead2", "creams": "#d9c7a5", "straw": "#e6c27a", "straws": "#b8923f",
    "thatch": "#c9a35a", "thatchs": "#9a7a3a", "thatchd": "#6e5426", "wood": "#bd6c4a", "woods": "#8a4a32", "woodd": "#5e3226",
    "stone": "#d8c3a0", "stones": "#b09a76", "stoned": "#857153", "adobe": "#e0b080", "adobes": "#b8865a",
    "concrete": "#c6c4b8", "concretes": "#aaa89c", "concreted": "#8e8c80", "paint": "#d9785a",
    "water": "#6fb6c9", "waters": "#4f93a8", "paddy": "#8cc7a8", "sprout": "#5aa65a",
    "bronze": "#9a7a44", "bronzes": "#6e5426", "pink": "#f29bbd", "purple": "#9b4ca3", "orange": "#f08a3a", "teal": "#3aa6a0",
    "carabao": "#5d5f73", "carabaos": "#43455a", "horn": "#e8dcc0",
}


def rgba(name, alpha=255):
    h = C[name].lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), alpha)


class Canvas:
    def __init__(self, w, h):
        self.im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.w, self.h = w, h

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.im.putpixel((x, y), rgba(c) if isinstance(c, str) else c)

    def rect(self, x0, y0, x1, y1, c):
        for y in range(max(0, y0), min(self.h, y1 + 1)):
            for x in range(max(0, x0), min(self.w, x1 + 1)):
                self.im.putpixel((x, y), rgba(c))

    def box(self, x0, y0, x1, y1, fill, line="0"):
        self.rect(x0, y0, x1, y1, line)
        self.rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1, fill)

    def hline(self, x0, x1, y, c):
        self.rect(x0, y, x1, y, c)

    def vline(self, x, y0, y1, c):
        self.rect(x, y0, x, y1, c)

    def disc(self, cx, cy, r, c):
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r + r:
                    self.px(x, y, c)

    def outline(self):
        src = self.im.copy()
        for y in range(self.h):
            for x in range(self.w):
                if src.getpixel((x, y))[3]:
                    continue
                if any(
                    0 <= x + dx < self.w and 0 <= y + dy < self.h and src.getpixel((x + dx, y + dy))[3] == 255
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                ):
                    self.im.putpixel((x, y), OUT)
        return self


def tiles_of(name, im):
    """Cuts a piece into named 16px tiles, skipping empty ones."""
    out = {}
    for row in range(im.height // T):
        for col in range(im.width // T):
            tile = im.crop((col * T, row * T, col * T + T, row * T + T))
            if tile.getbbox():
                out[f"{name}-{col}-{row}"] = tile
    return out


def sprite(rows, key):
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch in key:
                im.putpixel((x, y), OUT if key[ch] == "0" else rgba(key[ch]))
    return im


# ---------- held tools, already placed in a builder's right hand ----------
TOOL_KEY = {"0": "0", "w": "wood", "W": "woods", "m": "light", "M": "mid", "y": "yellow", "Y": "yellows", "b": "blue",
            "r": "red", "g": "green", "s": "white", "k": "straw", "K": "straws", "d": "dark"}

HOLDS = {
    "hold-hammer": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "...........000..",
        "..........0mmM0.",
        "..........0mmM00",
        "...........0w0..",
        "...........0w0..",
        "...........0W0..",
        "................",
        "................",
        "................",
        "................",
    ],
    "hold-hammer-up": [
        "................",
        "................",
        "................",
        "............000.",
        "...........0mm0.",
        "...........0mM0.",
        "...........0Mw0.",
        "............0w0.",
        "............0w0.",
        "...........0W0..",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    "hold-plank": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "......0000000000",
        ".....0kkkkkkkkkk",
        ".....0KKKKKKKKKK",
        "......0000000000",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
    ],
    "hold-books": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        ".....000000.....",
        ".....0rrrr0.....",
        ".....0ssss0.....",
        ".....0bbbb0.....",
        ".....0gggg0.....",
        ".....000000.....",
        "................",
        "................",
    ],
    "hold-bucket": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "...........000..",
        "..........0..0..",
        "..........0000..",
        "..........0MM0..",
        "..........0MM0..",
        "..........0000..",
        "................",
    ],
    "hold-saw": [
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "..........000...",
        "..........0w0...",
        "..........0mm0..",
        "...........0mm0.",
        "............0mm0",
        ".............000",
        "................",
    ],
    "hold-flag": [
        "............000.",
        "...........0rr0.",
        "...........0bb0.",
        "...........0000.",
        "...........0s0..",
        "...........0s0..",
        "...........0s0..",
        "...........0s0..",
        "...........0s0..",
        "...........0s0..",
        "...........0s0..",
        "...........0M0..",
        "................",
        "................",
        "................",
        "................",
    ],
}


def holds():
    return {name: sprite(rows, TOOL_KEY) for name, rows in HOLDS.items()}


# ---------- the walk grid: thin lines on the top and left edge, so tiles read as steps ----------
def grid_tile():
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    line = (63, 38, 49, 44)
    for i in range(T):
        im.putpixel((i, 0), line)
        im.putpixel((0, i), line)
    return im


def scaffold():
    c = Canvas(T, T)
    for x in (1, 13):
        c.rect(x, 0, x + 1, 15, "woods")
    for y in (3, 10):
        c.rect(0, y, 15, y + 1, "straw")
        c.hline(0, 15, y + 1, "straws")
    for i in range(6):
        c.px(3 + i, 4 + i, "woods")
    return c.im


# ---------- buildings ----------
def house():
    """A bahay kubo on bamboo stilts, with a thatched nipa roof and a ladder to the door."""
    c = Canvas(64, 64)
    # stilts and ladder
    for x in (8, 22, 40, 54):
        c.rect(x, 50, x + 2, 62, "straw"); c.vline(x + 2, 50, 62, "straws")
    for x in (27, 35):
        c.vline(x, 47, 63, "woods")
    for y in (50, 54, 58, 62):
        c.hline(27, 35, y, "wood")
    # floor
    c.rect(4, 46, 59, 50, "wood"); c.hline(4, 59, 50, "woods")
    # woven bamboo walls
    c.rect(6, 25, 57, 45, "straw")
    for y in range(25, 46):
        for x in range(6, 58):
            if (x // 2 + y // 2) % 2 == 0 and (x + y) % 3 == 0:
                c.px(x, y, "straws")
    for x in (6, 31, 57):
        c.vline(x, 25, 45, "woods")
    # door and window with a propped shutter
    c.box(22, 30, 30, 46, "woodd")
    c.box(39, 31, 52, 40, "woodd")
    c.rect(41, 33, 50, 38, "thatchd")
    c.rect(38, 27, 53, 29, "thatch"); c.hline(38, 53, 29, "thatchs")
    c.vline(39, 29, 31, "woods"); c.vline(52, 29, 31, "woods")
    # nipa roof
    for y in range(2, 27):
        half = 10 + (y - 2) * 22 // 24
        x0, x1 = 32 - half, 31 + half
        c.hline(max(0, x0), min(63, x1), y, "thatch")
        if (y - 2) % 4 == 3:
            c.hline(max(0, x0), min(63, x1), y, "thatchs")
    c.hline(20, 43, 2, "thatchd"); c.hline(20, 43, 3, "thatchs")
    for x in range(1, 63, 3):
        c.px(x, 26, "thatchd")
    return c.outline().im


def school():
    """A Filipino public school: cream walls, green trim, a red roof, a bell, and a sign over the door."""
    c = Canvas(112, 64)
    # bell frame on the roof
    c.box(50, 0, 61, 10, "wood")
    c.rect(52, 2, 59, 9, "woodd")
    c.rect(54, 3, 57, 8, "yellow"); c.rect(53, 7, 58, 8, "yellow"); c.px(57, 4, "yellows")
    # roof
    for y in range(8, 23):
        inset = (22 - y) * 6 // 14
        c.hline(inset, 111 - inset, y, "red")
        if (y - 8) % 4 == 3:
            c.hline(inset, 111 - inset, y, "reds")
    for x in range(3, 109, 6):
        c.vline(x, 12, 21, "reds")
    c.hline(0, 111, 22, "redd")
    # walls with trim
    c.rect(2, 23, 109, 57, "cream")
    c.rect(2, 23, 109, 25, "green"); c.hline(2, 109, 25, "greens")
    c.rect(2, 53, 109, 57, "green"); c.hline(2, 109, 53, "greens")
    c.vline(2, 23, 57, "creams")
    # windows
    for x in (8, 22, 36, 66, 80, 94):
        c.box(x, 30, x + 10, 44, "sky")
        c.vline(x + 5, 31, 43, "white"); c.hline(x + 1, x + 9, 37, "white")
        c.rect(x + 1, 31, x + 4, 33, "white")
        c.hline(x - 1, x + 11, 45, "creams")
    # sign board over the door, with lines standing in for words
    c.box(44, 27, 67, 34, "greend")
    c.hline(47, 64, 30, "white"); c.hline(49, 62, 32, "white")
    # door
    c.box(49, 37, 62, 57, "wood")
    c.vline(55, 38, 56, "woodd"); c.vline(56, 38, 56, "woodd")
    c.px(53, 47, "yellow"); c.px(58, 47, "yellow")
    # steps
    c.rect(46, 58, 65, 60, "concrete"); c.rect(44, 61, 67, 63, "concretes")
    return c.outline().im


def hall():
    """The town hall: a white front with a pediment, columns, and steps."""
    c = Canvas(96, 64)
    # pediment with the town seal
    for y in range(2, 17):
        half = (y - 2) * 46 // 14
        c.hline(48 - half, 47 + half, y, "white")
    for y in range(4, 17):
        half = (y - 4) * 40 // 13
        c.hline(48 - half, 47 + half, y, "whites")
    c.disc(48, 12, 3, "yellow"); c.px(48, 12, "yellows"); c.px(47, 11, "white")
    # entablature
    c.rect(2, 17, 93, 21, "white"); c.hline(2, 93, 21, "light")
    # recessed wall with windows
    c.rect(6, 22, 89, 52, "light")
    for x in (14, 70):
        c.box(x, 28, x + 11, 44, "sky"); c.vline(x + 5, 29, 43, "white"); c.vline(x + 6, 29, 43, "white")
    c.box(40, 30, 55, 52, "wood")
    c.vline(47, 31, 51, "woodd"); c.vline(48, 31, 51, "woodd")
    # columns
    for x in (6, 30, 58, 82):
        c.rect(x, 22, x + 7, 52, "white")
        c.vline(x + 6, 22, 52, "whites"); c.vline(x + 7, 22, 52, "light")
        c.rect(x - 1, 22, x + 8, 23, "whites")
        c.rect(x - 1, 51, x + 8, 52, "whites")
    # steps
    c.rect(2, 53, 93, 56, "whites"); c.rect(0, 57, 95, 60, "light"); c.rect(0, 61, 95, 63, "mid")
    c.hline(2, 93, 56, "light"); c.hline(0, 95, 60, "mid")
    return c.outline().im


def church():
    """A Spanish-era stone church: bell tower on the left, a pediment with a cross, a rose window, an arched door."""
    c = Canvas(112, 96)
    # bell tower
    c.rect(2, 20, 29, 95, "stone")
    c.vline(28, 20, 95, "stones"); c.vline(29, 20, 95, "stones")
    for y in (38, 60, 82):
        c.rect(0, y, 31, y + 2, "stones"); c.hline(0, 31, y, "stoned")
    for y in range(4, 20):
        half = 3 + (y - 4) * 12 // 16
        c.hline(16 - half, 15 + half, y, "redd" if (y % 3) else "reds")
    c.rect(14, 0, 17, 5, "yellow")
    c.rect(12, 1, 19, 2, "yellow")
    c.box(8, 23, 23, 37, "navy")
    c.rect(9, 23, 22, 25, "stone"); c.px(9, 26, "stone"); c.px(22, 26, "stone")
    c.rect(13, 28, 18, 34, "yellow"); c.rect(12, 33, 19, 35, "yellow"); c.px(17, 29, "yellows"); c.px(15, 36, "yellows")
    for y in (45, 67):
        c.box(12, y, 19, y + 10, "navy"); c.rect(13, y, 18, y + 1, "stone")
    # nave front
    c.rect(32, 40, 111, 95, "stone")
    c.vline(110, 40, 95, "stones"); c.vline(111, 40, 95, "stones")
    for y in range(18, 41):
        half = (y - 18) * 40 // 22
        c.hline(72 - half, 71 + half, y, "stone")
    for y in range(22, 41):
        half = (y - 22) * 34 // 18
        c.hline(72 - half, 71 + half, y, "adobe")
    c.hline(32, 111, 40, "stoned"); c.rect(32, 41, 111, 43, "stones")
    # the cross on top
    c.rect(70, 4, 73, 19, "yellow"); c.rect(66, 8, 77, 10, "yellow"); c.vline(73, 4, 19, "yellows")
    # rose window
    c.disc(72, 31, 6, "navy"); c.disc(72, 31, 4, "blue"); c.disc(72, 31, 1, "yellow")
    for (dx, dy) in ((0, -3), (0, 3), (-3, 0), (3, 0)):
        c.px(72 + dx, 31 + dy, "red")
    # pilasters
    for x in (34, 52, 90, 107):
        c.rect(x, 44, x + 2, 95, "stones")
    # side niches
    for x in (40, 96):
        c.box(x, 52, x + 8, 68, "navy"); c.rect(x + 1, 52, x + 7, 54, "stone")
        c.rect(x + 3, 56, x + 5, 66, "white")
    # arched door
    c.disc(72, 70, 9, "stoned")
    c.rect(63, 70, 81, 95, "stoned")
    c.disc(72, 70, 8, "wood")
    c.rect(64, 70, 80, 95, "wood")
    c.vline(72, 62, 95, "woodd")
    for y in range(66, 95, 5):
        for x in (67, 77):
            c.px(x, y, "yellow")
    # base
    c.rect(32, 91, 111, 95, "stones"); c.rect(2, 91, 29, 95, "stones")
    c.rect(62, 91, 82, 95, "concretes")
    return c.outline().im


def brick_wall():
    """The wall the class built in Lesson 01, on the church lot before the church."""
    c = Canvas(112, 96)
    for y in range(80, 95):
        for x in range(26, 90):
            c.px(x, y, "red")
    for y in range(80, 95, 4):
        c.hline(26, 89, y, "redd")
        off = 0 if (y // 4) % 2 else 4
        for x in range(26 + off, 90, 8):
            c.vline(x, y, y + 3, "redd")
    # stones and planks waiting by the wall
    for (x, y) in ((6, 88), (14, 90), (98, 88)):
        c.box(x, y, x + 6, y + 5, "stone")
    c.box(94, 82, 108, 85, "straw")
    return c.outline().im


def site(seed):
    """Materials waiting on an empty lot: a pile of planks, stones, and a sack."""
    c = Canvas(T, T)
    if seed == "planks":
        for i, y in enumerate((8, 11)):
            c.box(1 + i, y, 14 - i, y + 3, "straw"); c.hline(2 + i, 13 - i, y + 2, "straws")
    elif seed == "stones":
        c.box(2, 9, 8, 14, "stone"); c.box(8, 10, 14, 14, "stones"); c.box(5, 5, 11, 10, "stone")
    else:
        c.box(4, 5, 11, 14, "creams"); c.hline(5, 10, 7, "straws")
    return c.im


# ---------- the park ----------
def monument():
    c = Canvas(16, 32)
    # bronze figure on a stone pedestal
    c.rect(6, 1, 9, 4, "bronze"); c.px(9, 2, "bronzes")
    c.rect(5, 5, 10, 12, "bronze"); c.vline(10, 5, 12, "bronzes")
    c.rect(4, 6, 4, 10, "bronze"); c.rect(11, 6, 11, 9, "bronzes")
    c.rect(6, 13, 7, 16, "bronze"); c.rect(8, 13, 9, 16, "bronzes")
    c.rect(4, 17, 11, 25, "light"); c.vline(11, 17, 25, "mid")
    c.rect(5, 20, 10, 21, "mid")
    c.rect(2, 26, 13, 28, "whites"); c.rect(1, 29, 14, 31, "light")
    return c.outline().im


def hedge():
    c = Canvas(T, T)
    c.rect(0, 2, 15, 14, "leafs")
    for (x, y) in ((2, 4), (6, 3), (11, 5), (4, 8), (9, 9), (13, 10), (3, 12), (8, 12)):
        c.px(x, y, "leaf"); c.px(x + 1, y, "leaf")
    c.hline(0, 15, 13, "greens"); c.hline(0, 15, 14, "greend")
    c.hline(0, 15, 2, "greens")
    return c.im


def flowerbed():
    c = Canvas(T, T)
    c.box(0, 2, 15, 15, "woods", line="stoned")
    c.rect(1, 3, 14, 14, "woods")
    colors = ("red", "yellow", "pink", "white", "purple")
    for i, (x, y) in enumerate(((3, 5), (7, 4), (11, 6), (5, 9), (9, 10), (13, 11), (3, 12), (8, 7))):
        c.px(x, y + 1, "leafs")
        c.px(x, y, colors[i % len(colors)])
    return c.im


def tallgrass():
    c = Canvas(T, T)
    for x, h in ((3, 6), (5, 8), (7, 5), (10, 7), (12, 6)):
        c.vline(x, 15 - h, 14, "leafs")
        c.px(x, 15 - h, "leaf")
    return c.im


def grass_shades(base):
    """Shades of the town grass, painted in patches so the ground is not one flat green."""
    out = {}
    shifts = {"grass-dark": (-14, -12, -10), "grass-light": (10, 10, 6), "grass-dry": (14, 6, -16)}
    for name, (dr, dg, db) in shifts.items():
        im = base.copy()
        for y in range(T):
            for x in range(T):
                r, g, b, a = im.getpixel((x, y))
                im.putpixel((x, y), (max(0, min(255, r + dr)), max(0, min(255, g + dg)), max(0, min(255, b + db)), a))
        out[name] = im
    return out


# ---------- Filipino street life ----------
def coconut():
    c = Canvas(32, 48)
    pts = [(16, 47), (16, 44), (17, 40), (17, 36), (18, 32), (18, 28), (19, 24), (19, 20), (19, 16)]
    for (x, y) in pts:
        c.rect(x - 1, y - 3, x + 1, y, "woods")
        c.px(x, y - 2, "wood")
    for (x, y) in pts[1::2]:
        c.hline(x - 1, x + 1, y, "woodd")
    fronds = [((19, 13), (2, 18)), ((19, 13), (8, 6)), ((19, 13), (20, 2)), ((19, 13), (31, 7)), ((19, 13), (31, 19)), ((19, 13), (12, 22))]
    for (x0, y0), (x1, y1) in fronds:
        steps = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(steps + 1):
            x = x0 + (x1 - x0) * i // steps
            y = y0 + (y1 - y0) * i // steps + (i * (steps - i)) // (steps * 2)
            c.rect(x - 1, y, x + 1, y + 1, "leafs" if i % 3 else "green")
    c.disc(17, 15, 2, "woods"); c.disc(21, 16, 2, "woods"); c.px(17, 14, "wood")
    return c.outline().im


def banana():
    c = Canvas(16, 32)
    c.rect(7, 18, 9, 31, "leafs"); c.vline(9, 18, 31, "greens")
    for (x0, y0, x1, y1) in ((8, 18, 1, 6), (8, 18, 14, 4), (8, 16, 2, 14), (8, 16, 15, 13), (8, 14, 8, 1)):
        steps = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(steps + 1):
            x = x0 + (x1 - x0) * i // steps
            y = y0 + (y1 - y0) * i // steps
            c.rect(x - 1, y - 1, x + 1, y + 1, "leaf" if i % 4 else "leafs")
    return c.outline().im


def carabao():
    """A carabao resting in the shade, legs folded under."""
    c = Canvas(32, 16)
    c.rect(6, 6, 25, 13, "carabao"); c.hline(6, 25, 13, "carabaos")
    c.rect(4, 7, 6, 12, "carabao")
    c.rect(24, 4, 30, 11, "carabao"); c.vline(30, 6, 10, "carabaos")
    c.px(28, 6, "navy")
    for (x, y) in ((22, 3), (23, 2), (24, 1), (25, 1), (31, 3), (31, 2), (30, 1), (29, 1)):
        c.px(x, y, "horn")
    c.hline(8, 12, 14, "carabaos"); c.hline(18, 22, 14, "carabaos")
    c.px(3, 8, "carabaos"); c.px(2, 9, "carabaos")
    return c.outline().im


def paddy():
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "paddy")
    c.hline(0, 15, 0, "leafs"); c.vline(0, 0, 15, "leafs")
    for y in (4, 9, 14):
        for x in (3, 7, 11, 15):
            c.px(x, y, "sprout"); c.px(x, y - 1, "leaf"); c.px(x - 1, y - 1, "sprout")
    return c.im


def road(kind):
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "concrete")
    for (x, y) in ((3, 5), (11, 9), (7, 13)):
        c.px(x, y, "concretes")
    if kind == "top":
        c.rect(0, 0, 15, 1, "concreted")
        c.rect(0, 15, 7, 15, "white")
    else:
        c.rect(0, 14, 15, 15, "concreted")
    c.vline(15, 2, 13, "concretes") if kind == "top" else c.vline(15, 0, 13, "concretes")
    return c.im


def shed():
    """A waiting shed by the road: a tin roof on two posts and a bench."""
    c = Canvas(48, 32)
    c.rect(1, 2, 46, 7, "blue")
    for x in range(3, 46, 4):
        c.vline(x, 2, 7, "blues")
    c.hline(0, 47, 8, "dark")
    c.rect(4, 9, 5, 29, "light"); c.rect(42, 9, 43, 29, "light")
    c.rect(8, 21, 39, 23, "wood"); c.vline(10, 24, 29, "woods"); c.vline(37, 24, 29, "woods")
    c.rect(2, 30, 45, 31, "concretes")
    return c.outline().im


def tricycle():
    c = Canvas(32, 32)
    # sidecar with a roof
    c.rect(2, 6, 20, 9, "blue"); c.hline(2, 20, 9, "blues")
    c.rect(3, 10, 4, 18, "light"); c.rect(18, 10, 19, 18, "light")
    c.rect(2, 18, 20, 25, "red"); c.hline(2, 20, 21, "yellow"); c.rect(5, 12, 15, 17, "navy")
    # motorcycle
    c.rect(20, 18, 28, 22, "dark"); c.rect(25, 13, 26, 18, "mid"); c.rect(23, 12, 29, 13, "navy")
    for (cx, cy) in ((8, 27), (26, 27)):
        c.disc(cx, cy, 4, "navy"); c.disc(cx, cy, 1, "light")
    return c.outline().im


def banderitas(shift):
    c = Canvas(T, T)
    colors = ("red", "yellow", "blue", "white", "green", "pink")
    for x in range(T):
        sag = 2 + (1 if 4 <= x <= 11 else 0)
        c.px(x, sag, "dark")
    for i, x0 in enumerate((1, 6, 11)):
        col = colors[(i + shift) % len(colors)]
        top = 3 + (1 if 4 <= x0 + 1 <= 11 else 0)
        for row in range(4):
            c.hline(x0 + row // 2, x0 + 3 - row // 2, top + row, col)
    return c.im


def court():
    """A basketball half court, painted on concrete."""
    c = Canvas(80, 64)
    c.rect(0, 0, 79, 63, "concrete")
    for y in range(0, 64, 16):
        c.hline(0, 79, y, "concretes")
    c.rect(30, 2, 49, 26, "paint")
    for x0, y0, x1, y1 in ((2, 2, 77, 2), (2, 2, 2, 61), (77, 2, 77, 61), (2, 61, 77, 61), (30, 2, 30, 26), (49, 2, 49, 26), (30, 26, 49, 26)):
        c.rect(x0, y0, x1, y1, "white")
    for x in range(8, 72):
        dx = (x - 40) / 32
        y = int(2 + 44 * (1 - dx * dx) ** 0.5) if abs(dx) <= 1 else None
        if y:
            c.px(x, y, "white")
    for x in range(33, 47):
        dx = (x - 40) / 7
        if abs(dx) <= 1:
            c.px(x, 26 + int(7 * (1 - dx * dx) ** 0.5), "white")
    return c.im


def hoop():
    c = Canvas(T, T)
    c.rect(7, 6, 8, 15, "mid")
    c.box(2, 0, 13, 7, "white"); c.box(5, 3, 10, 6, "white", line="red")
    c.hline(5, 10, 8, "orange"); c.px(5, 9, "orange"); c.px(10, 9, "orange")
    return c.im


def store_sign():
    """Bottles and packs on a little stand outside the sari-sari store."""
    c = Canvas(T, T)
    c.rect(2, 9, 13, 14, "wood"); c.hline(2, 13, 14, "woods")
    for i, x in enumerate((3, 6, 9, 12)):
        col = ("red", "yellow", "blue", "green")[i]
        c.rect(x, 5, x + 1, 8, col); c.px(x, 4, "dark")
    return c.outline().im


def jeepney(bob):
    """A jeepney facing right: silver body, painted stripes, a horse on the hood. Two frames: the body bobs."""
    c = Canvas(48, 32)
    dy = 1 if bob else 0
    # roof rack and body
    c.rect(2, 4 + dy, 37, 6 + dy, "light"); c.hline(2, 37, 3 + dy, "mid")
    c.rect(1, 7 + dy, 38, 25 + dy, "whites")
    c.rect(38, 13 + dy, 46, 25 + dy, "whites")
    c.hline(1, 46, 25 + dy, "mid")
    # windows with passengers
    c.rect(4, 9 + dy, 35, 14 + dy, "navy")
    for i, x in enumerate(range(7, 34, 6)):
        c.rect(x, 11 + dy, x + 2, 14 + dy, ("adobe", "adobes", "pink", "adobe", "adobes")[i % 5])
    for x in range(9, 36, 6):
        c.vline(x + 1, 9 + dy, 14 + dy, "light")
    # stripes
    c.rect(1, 17 + dy, 46, 18 + dy, "red"); c.rect(1, 19 + dy, 46, 20 + dy, "yellow"); c.rect(1, 21 + dy, 46, 21 + dy, "blue")
    # windshield, hood, horse, lamp, bumper
    c.rect(37, 8 + dy, 38, 13 + dy, "sky")
    c.rect(42, 9 + dy, 43, 12 + dy, "light"); c.px(44, 9 + dy, "light"); c.px(41, 12 + dy, "light")
    c.px(46, 15 + dy, "yellow"); c.px(46, 16 + dy, "yellow")
    c.rect(44, 23 + dy, 47, 24 + dy, "mid")
    c.rect(0, 22 + dy, 2, 24 + dy, "mid")
    for cx in (10, 37):
        c.disc(cx, 26, 4, "navy"); c.disc(cx, 26, 1, "light")
    return c.outline().im


def all_tiles(base_grass):
    tiles = {}
    tiles.update(holds())
    tiles["grid"] = grid_tile()
    tiles["scaffold"] = scaffold()
    tiles.update({f"site-{k}": site(k) for k in ("planks", "stones", "sack")})
    tiles.update(tiles_of("house", house()))
    tiles.update(tiles_of("school", school()))
    tiles.update(tiles_of("hall", hall()))
    tiles.update(tiles_of("lesson1-wall", brick_wall()))
    tiles.update(tiles_of("church", church()))
    tiles.update(tiles_of("monument", monument()))
    tiles["hedge"] = hedge()
    tiles["flowerbed"] = flowerbed()
    tiles["tallgrass"] = tallgrass()
    tiles.update(grass_shades(base_grass))
    tiles.update(tiles_of("coconut", coconut()))
    tiles.update(tiles_of("banana", banana()))
    tiles.update(tiles_of("carabao", carabao()))
    tiles["paddy"] = paddy()
    tiles["road-top"] = road("top")
    tiles["road-bottom"] = road("bottom")
    tiles.update(tiles_of("shed", shed()))
    tiles.update(tiles_of("trike", tricycle()))
    tiles["banderitas-a"] = banderitas(0)
    tiles["banderitas-b"] = banderitas(3)
    tiles.update(tiles_of("court", court()))
    tiles["hoop"] = hoop()
    tiles["stand"] = store_sign()
    return tiles


def buildings_sheet():
    """The finished buildings, one cell each in lesson order (home, school, town hall, church), for the built card."""
    pieces = [house(), school(), hall(), church()]
    cell_w, cell_h = 112, 96
    sheet = Image.new("RGBA", (cell_w, cell_h * len(pieces)), (0, 0, 0, 0))
    for i, im in enumerate(pieces):
        sheet.alpha_composite(im, ((cell_w - im.width) // 2, i * cell_h + (cell_h - im.height)))
    return sheet


def vehicles_sheet():
    sheet = Image.new("RGBA", (96, 32), (0, 0, 0, 0))
    sheet.alpha_composite(jeepney(False), (0, 0))
    sheet.alpha_composite(jeepney(True), (48, 0))
    return sheet
