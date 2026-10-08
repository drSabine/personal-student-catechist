"""Builds the Lesson 02 sprite sheets from the Kenney packs plus a few hand-drawn tiles.

Run from this folder: `python gen_art.py`, then `python gen_maps.py`. The Kenney packs go in `kenney/`
(see README.md). Outputs, into public/lessons/lesson-02 unless a folder is given:
  tiles/town.png      Kenney Tiny Town packed sheet (copied)
  tiles/extra.png     hand-drawn tiles: buildings, the park, street life, held tools, markers, the church inside, ...
  sprites/people.png  one row per person, frames: stand, step (drawn in art_people.py)
  sprites/people.json name -> row
"""
import json, os, shutil, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
KEN = os.path.join(HERE, "kenney")
# Writes straight into the lesson's public folder unless another folder is given.
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "public", "lessons", "lesson-02")
T = 16

PAL = {
    "0": "#3f2631", "W": "#ffffff", "L": "#c0cbdc", "M": "#8b9bb4", "D": "#52607c", "N": "#262b44",
    "Y": "#fdbe53", "O": "#e38628", "R": "#e84537", "r": "#c34b35", "B": "#0099db", "b": "#bd6c4a",
    "d": "#763b36", "T": "#eaa56c", "s": "#f7c282", "P": "#9b4ca3", "p": "#d176d0", "G": "#84c669",
    "g": "#479f4a", "n": "#3a4466", "f": "#fec99c", "c": "#76e4ff",
}


def rgba(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def from_rows(rows):
    assert len(rows) == 16, rows
    im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        assert len(row) == 16, (y, row, len(row))
        for x, ch in enumerate(row):
            if ch in PAL:
                im.putpixel((x, y), rgba(PAL[ch]))
    return im


def sheet_tile(sheet, idx):
    q, r = idx % 12, idx // 12
    return sheet.crop((q * T, r * T, q * T + T, r * T + T)).copy()


# ---------- hand-drawn extra tiles ----------
EXTRA = {}

EXTRA["plaque"] = from_rows([
    "................",
    ".....000000.....",
    "....0LLLLLL0....",
    "...0LWLLLLLM0...",
    "...0LDDDDDLM0...",
    "...0LLLLLLLM0...",
    "...0LDDDDLLM0...",
    "...0LLLLLLLM0...",
    "...0LDDDDDLM0...",
    "...0LLLLLLLM0...",
    "...0MMMMMMMM0...",
    "...0000000000...",
    "....0DMMMMD0....",
    "...0DDDDDDDD0...",
    "...0000000000...",
    "................",
])

EXTRA["plaque-open"] = from_rows([
    "................",
    ".....000000.....",
    "....0YYYYYY0....",
    "...0YWYYYYYO0...",
    "...0YddddYYO0...",
    "...0YYYYYYYO0...",
    "...0YddddYYO0...",
    "...0YYYYYYYO0...",
    "...0YdddddYO0...",
    "...0YYYYYYYO0...",
    "...0OOOOOOOO0...",
    "...0000000000...",
    "....0DMMMMD0....",
    "...0DDDDDDDD0...",
    "...0000000000...",
    "................",
])

EXTRA["ask"] = from_rows([
    "....00000000....",
    "...0WWWWWWWW0...",
    "..0WWWNNNNWWW0..",
    "..0WWNNWWNNWW0..",
    "..0WWWWWWNNWW0..",
    "..0WWWWWNNWWW0..",
    "..0WWWWNNWWWW0..",
    "..0WWWWNNWWWW0..",
    "..0WWWWWWWWWW0..",
    "..0WWWWNNWWWW0..",
    "...0WWWNNWWW0...",
    "....00WWW000....",
    "......0WW0......",
    ".......00.......",
    "................",
    "................",
])

EXTRA["done"] = from_rows([
    "....00000000....",
    "...0WWWWWWWW0...",
    "..0WWWWWWWWWW0..",
    "..0WWWWWWWWgW0..",
    "..0WWWWWWWggW0..",
    "..0WWWWWWggWW0..",
    "..0WgWWWggWWW0..",
    "..0WggWggWWWW0..",
    "..0WWgggWWWWW0..",
    "..0WWWgWWWWWW0..",
    "...0WWWWWWWW0...",
    "....00WWW000....",
    "......0WW0......",
    ".......00.......",
    "................",
    "................",
])

EXTRA["dust"] = from_rows([
    "................",
    "................",
    "................",
    "................",
    "................",
    "....LL....LL....",
    "...LWWL..LWWL...",
    "...LWWLLLLWWL...",
    "..LWWWWWWWWWWL..",
    ".LWWWWWLLWWWWWL.",
    ".LWWWWL..LWWWWL.",
    "..LLLL....LLLL..",
    "................",
    "................",
    "................",
    "................",
])

EXTRA["collide"] = from_rows([
    "RR............RR",
    "RRR..........RRR",
    ".RRR........RRR.",
    "..RRR......RRR..",
    "...RRR....RRR...",
    "....RRR..RRR....",
    ".....RRRRRR.....",
    "......RRRR......",
    "......RRRR......",
    ".....RRRRRR.....",
    "....RRR..RRR....",
    "...RRR....RRR...",
    "..RRR......RRR..",
    ".RRR........RRR.",
    "RRR..........RRR",
    "RR............RR",
])

EXTRA["pew-left"] = from_rows([
    "................",
    "................",
    "................",
    "................",
    "0000000000000000",
    "0bTTTTTTTTTTTTTT",
    "0bbbbbbbbbbbbbbb",
    "0ddddddddddddddd",
    "0000000000000000",
    "0bTTTTTTTTTTTTTT",
    "0bbbbbbbbbbbbbbb",
    "0000000000000000",
    "0d0.............",
    "000.............",
    "................",
    "................",
])
EXTRA["pew-mid"] = from_rows([
    "................",
    "................",
    "................",
    "................",
    "0000000000000000",
    "TTTTTTTTTTTTTTTT",
    "bbbbbbbbbbbbbbbb",
    "dddddddddddddddd",
    "0000000000000000",
    "TTTTTTTTTTTTTTTT",
    "bbbbbbbbbbbbbbbb",
    "0000000000000000",
    "................",
    "................",
    "................",
    "................",
])
EXTRA["pew-right"] = from_rows([
    "................",
    "................",
    "................",
    "................",
    "0000000000000000",
    "TTTTTTTTTTTTTTb0",
    "bbbbbbbbbbbbbbb0",
    "ddddddddddddddd0",
    "0000000000000000",
    "TTTTTTTTTTTTTTb0",
    "bbbbbbbbbbbbbbb0",
    "0000000000000000",
    ".............0d0",
    ".............000",
    "................",
    "................",
])

EXTRA["carpet"] = from_rows([
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
    "0YrRRRRRRRRRRrY0",
])

EXTRA["altar-left"] = from_rows([
    "................",
    "................",
    "................",
    "................",
    "....00..........",
    "...0YY0.........",
    "..0WYOW000000000",
    "0000000000000000",
    "0WWWWWWWWWWWWWWW",
    "0WLLLLLLLLLLLLLL",
    "0WLYYYYYYYYYYYYY",
    "0WLLLLLLLLLLLLLL",
    "0WLLLLLLLLLLLLLL",
    "0WLLLLLLLLLLLLLL",
    "0MMMMMMMMMMMMMMM",
    "0000000000000000",
])
EXTRA["altar-right"] = from_rows([
    "................",
    "................",
    "................",
    "................",
    "..........00....",
    ".........0YY0...",
    ".00000000WOYW0..",
    "0000000000000000",
    "WWWWWWWWWWWWWWW0",
    "LLLLLLLLLLLLLLW0",
    "YYYYYYYYYYYYYLW0",
    "LLLLLLLLLLLLLLW0",
    "LLLLLLLLLLLLLLW0",
    "LLLLLLLLLLLLLLW0",
    "MMMMMMMMMMMMMMM0",
    "0000000000000000",
])

EXTRA["altar-mid"] = from_rows([
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "0000000000000000",
    "0000000000000000",
    "WWWWWWWWWWWWWWWW",
    "LLLLLLLLLLLLLLLL",
    "YYYYYYYYYYYYYYYY",
    "LLLLLL0YY0LLLLLL",
    "LLLLL0YYYY0LLLLL",
    "LLLLLL0YY0LLLLLL",
    "MMMMMMMMMMMMMMMM",
    "0000000000000000",
])

EXTRA["candle"] = from_rows([
    "................",
    ".......0........",
    "......0Y0.......",
    "......0O0.......",
    ".......0........",
    "......0W0.......",
    "......0W0.......",
    "......0L0.......",
    ".....00000......",
    "......0Y0.......",
    "......0O0.......",
    "......0Y0.......",
    "......0O0.......",
    ".....0YYY0......",
    "....0OOOOO0.....",
    "....0000000.....",
])

import art_life, art_town, art_people, art_church
art_life.add_life(EXTRA, PAL, rgba)
# The flagpole lines up with the pole in the waving flag frames above it.
EXTRA["pole"] = from_rows([".0L0............"] * 16)
_town = Image.open(os.path.join(KEN, "kenney_tiny-town", "Tilemap", "tilemap_packed.png")).convert("RGBA")
EXTRA.update(art_town.all_tiles(sheet_tile(_town, 0)))
EXTRA.update(art_church.all_tiles())
EXTRA_ORDER = list(EXTRA)



def main():
    os.makedirs(os.path.join(OUT, "tiles"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "sprites"), exist_ok=True)
    town_src = os.path.join(KEN, "kenney_tiny-town", "Tilemap", "tilemap_packed.png")
    shutil.copyfile(town_src, os.path.join(OUT, "tiles", "town.png"))

    cols = 8
    rows = (len(EXTRA_ORDER) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * T, rows * T), (0, 0, 0, 0))
    for i, name in enumerate(EXTRA_ORDER):
        sheet.paste(EXTRA[name], ((i % cols) * T, (i // cols) * T))
    sheet.save(os.path.join(OUT, "tiles", "extra.png"), optimize=True)

    ppl = art_people.build_people()
    names = list(ppl)
    ps = Image.new("RGBA", (2 * T, len(names) * T), (0, 0, 0, 0))
    for r, name in enumerate(names):
        ps.paste(ppl[name], (0, r * T))
        ps.paste(art_people.step(ppl[name]), (T, r * T))
    ps.save(os.path.join(OUT, "sprites", "people.png"), optimize=True)
    with open(os.path.join(OUT, "sprites", "people.json"), "w") as f:
        json.dump({n: i for i, n in enumerate(names)}, f, indent=2)
        f.write("\n")
    with open(os.path.join(OUT, "sprites", "extra.json"), "w") as f:
        json.dump({n: i for i, n in enumerate(EXTRA_ORDER)}, f, indent=2)
        f.write("\n")
    art_town.buildings_sheet().save(os.path.join(OUT, "sprites", "buildings.png"), optimize=True)
    art_town.vehicles_sheet().save(os.path.join(OUT, "sprites", "vehicles.png"), optimize=True)
    # St. Peter's statue on its own, for the card the class reads by the church door.
    art_church.peter().save(os.path.join(OUT, "sprites", "statue.png"), optimize=True)


if __name__ == "__main__":
    main()
