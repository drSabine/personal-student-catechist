"""The inside of the parish church: walls, a gold retablo, stained glass, the rail, statues, and the floor.

Drawn with the same Canvas and colors as art_town, so the church matches the town outside.
"""
from art_town import C, Canvas, tiles_of

T = 16
C.update({
    "marble": "#f2e8d5", "marbles": "#ddd0b6", "marbled": "#c4b391", "plaster": "#efe3cc", "plasters": "#d9c8a8",
    "gold": "#f2c14e", "golds": "#c98f2a", "goldd": "#8a5a1c", "mary": "#4f86c6", "marys": "#33609a",
})


def wall():
    """The back wall: plaster over a dark wooden wainscot."""
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "plaster")
    c.hline(0, 15, 7, "plasters")
    c.vline(7, 0, 6, "plasters")
    c.vline(15, 8, 15, "plasters")
    return c.im


def wall_base():
    c = Canvas(T, T)
    c.rect(0, 0, 15, 7, "plaster")
    c.rect(0, 8, 15, 15, "woods")
    c.hline(0, 15, 8, "wood")
    c.hline(0, 15, 15, "woodd")
    for x in (3, 11):
        c.rect(x, 10, x + 2, 13, "woodd")
    return c.im


def side_wall(right):
    """A side wall seen from above: its thickness, with the room's edge in shadow."""
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "stones")
    for y in (3, 9, 15):
        c.hline(0, 15, y, "stoned")
    c.vline(7, 0, 3, "stoned"); c.vline(3, 4, 9, "stoned"); c.vline(11, 10, 15, "stoned")
    edge = 0 if right else 15
    c.vline(edge, 0, 15, "0")
    return c.im


def front_wall():
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "stones")
    for x in (0, 8):
        c.vline(x, 0, 15, "stoned")
    c.hline(0, 15, 7, "stoned")
    c.hline(0, 15, 0, "0")
    return c.im


def doorway():
    """The open main door: a threshold with the two leaves swung inward."""
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "concrete")
    c.rect(0, 0, 2, 15, "wood"); c.rect(13, 0, 15, 15, "wood")
    c.vline(2, 0, 15, "woodd"); c.vline(13, 0, 15, "woodd")
    c.hline(0, 15, 0, "0")
    return c.im


def window():
    """Stained glass set in the plaster wall."""
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "plaster")
    c.disc(8, 5, 4, "0")
    c.rect(4, 5, 12, 14, "0")
    c.disc(8, 5, 3, "blue")
    c.rect(5, 5, 11, 13, "blue")
    c.rect(5, 9, 7, 13, "red"); c.rect(9, 9, 11, 13, "yellow")
    c.vline(8, 3, 13, "0"); c.hline(5, 11, 8, "0")
    c.px(7, 4, "sky"); c.px(9, 6, "pink")
    return c.im


def floor(dark):
    c = Canvas(T, T)
    base, vein = ("marbles", "marbled") if dark else ("marble", "marbles")
    c.rect(0, 0, 15, 15, base)
    for (x, y) in ((2, 3), (3, 4), (4, 4), (10, 9), (11, 10), (12, 10), (6, 12)):
        c.px(x, y, vein)
    return c.im


def sanctuary():
    c = Canvas(T, T)
    c.rect(0, 0, 15, 15, "reds")
    c.hline(0, 15, 15, "redd")
    c.vline(15, 0, 15, "redd")
    return c.im


def retablo():
    """The gold altarpiece behind the altar: columns, niches with saints, and the crucifix in the middle."""
    c = Canvas(112, 64)
    c.rect(2, 8, 109, 63, "woods")
    # crest with rays
    c.disc(56, 9, 9, "gold")
    c.disc(56, 9, 6, "golds")
    c.disc(56, 9, 3, "white")
    for x in range(30, 83):
        c.px(x, 8, "gold")
    # cornices
    for y in (8, 34, 60):
        c.rect(2, y, 109, y + 2, "gold")
        c.hline(2, 109, y + 2, "golds")
    # columns
    for x in (4, 34, 74, 104):
        c.rect(x, 11, x + 3, 59, "gold")
        c.vline(x + 3, 11, 59, "golds")
        for y in range(14, 58, 6):
            c.px(x + 1, y, "goldd")
    # side niches with saints
    for x in (14, 84):
        for (y0, y1) in ((14, 32), (39, 58)):
            c.rect(x, y0 + 3, x + 13, y1, "navy")
            c.disc(x + 7, y0 + 4, 6, "navy")
            c.rect(x + 5, y0 + 6, x + 8, y0 + 8, "adobe")
            c.rect(x + 4, y0 + 9, x + 9, y1 - 2, "white" if y0 == 14 else "mary")
    # the crucifix in the tall middle niche
    c.rect(42, 18, 69, 58, "navy")
    c.disc(55, 18, 13, "navy")
    c.rect(54, 14, 57, 52, "wood")
    c.rect(46, 22, 65, 24, "wood")
    c.rect(54, 22, 57, 34, "adobe")
    c.rect(48, 23, 63, 23, "adobe")
    c.px(55, 21, "golds"); c.px(56, 21, "golds")
    return c.outline().im


def rail(end):
    """The communion rail: a wooden top on turned balusters."""
    c = Canvas(T, T)
    c.rect(0, 5, 15, 7, "wood"); c.hline(0, 15, 7, "woods")
    for x in range(1, 16, 3):
        c.rect(x, 8, x + 1, 13, "woods")
    c.rect(0, 14, 15, 15, "woodd")
    if end:
        c.rect(12, 3, 15, 15, "wood"); c.vline(15, 3, 15, "woodd")
    return c.im


def statue(kind):
    """A saint on a pedestal: Mary in blue, or the Santo Nino in red with a gold crown."""
    c = Canvas(T, 32)
    c.rect(3, 22, 12, 31, "marbles"); c.hline(3, 12, 22, "marble"); c.vline(12, 22, 31, "marbled")
    robe, robes = ("mary", "marys") if kind == "mary" else ("red", "reds")
    c.rect(5, 9, 10, 21, robe); c.vline(10, 9, 21, robes)
    c.rect(6, 4, 9, 8, "adobe")
    if kind == "mary":
        c.rect(5, 3, 10, 5, "white"); c.vline(5, 3, 12, "white"); c.vline(10, 3, 12, "white")
    else:
        c.rect(6, 1, 9, 3, "gold"); c.px(6, 0, "gold"); c.px(9, 0, "gold")
        c.disc(11, 13, 2, "gold")
    return c.outline().im


def peter():
    """St. Peter on a tall pedestal: a halo, a bald head with a white beard, a green robe under a gold
    cloak, and the crossed keys of the kingdom, gold and silver, held up in his hand."""
    c = Canvas(T, 48)
    # pedestal, with the crossed keys carved on its face
    c.rect(2, 36, 13, 37, "marble"); c.rect(3, 38, 12, 46, "marbles"); c.vline(12, 38, 46, "marbled")
    c.rect(1, 46, 14, 46, "marbled")
    for i in range(5):
        c.px(5 + i, 39 + i, "golds"); c.px(9 - i, 39 + i, "golds")
    # halo behind the head
    c.disc(7, 5, 4, "gold")
    # bald head, white fringe and a full white beard
    c.rect(6, 3, 9, 8, "adobe"); c.px(7, 3, "cream"); c.vline(9, 4, 8, "adobes")
    c.vline(5, 5, 8, "white"); c.vline(10, 5, 8, "white")
    c.px(7, 6, "0"); c.px(9, 6, "0")
    c.rect(5, 9, 10, 11, "white"); c.rect(6, 12, 9, 13, "white"); c.hline(7, 8, 14, "white")
    # green robe to the feet
    c.rect(3, 13, 10, 34, "green"); c.vline(10, 13, 34, "greens"); c.vline(3, 20, 34, "greens")
    c.rect(4, 12, 4, 12, "green")
    c.hline(4, 5, 35, "woodd"); c.hline(8, 9, 35, "woodd")
    # gold cloak over the left shoulder, falling across to the right hip
    c.rect(3, 13, 5, 19, "yellow")
    for y in range(17, 30):
        x = 3 + (y - 17) * 7 // 12
        c.hline(x, min(x + 3, 10), y, "yellow")
        c.px(min(x + 3, 10), y, "yellows")
    # the silver key, leaning across behind the gold one
    for i in range(12):
        c.px(8 + i * 5 // 11, 22 - i, "light")
    c.px(14, 11, "light"); c.px(14, 12, "mid")
    # the gold key, upright: its bit at the top, its ring in his hand
    c.vline(12, 5, 21, "gold"); c.vline(13, 5, 21, "golds")
    c.hline(14, 14, 5, "gold"); c.hline(14, 14, 7, "gold"); c.px(14, 6, "golds")
    c.rect(11, 21, 14, 25, "gold"); c.rect(12, 22, 13, 24, "golds"); c.px(12, 23, "0"); c.px(13, 23, "0")
    c.rect(10, 18, 11, 20, "adobe")
    return c.outline().im


def ambo():
    c = Canvas(T, T)
    c.rect(4, 3, 11, 14, "wood"); c.vline(11, 3, 14, "woods")
    c.rect(3, 2, 12, 4, "woods")
    c.rect(6, 6, 9, 11, "red"); c.rect(7, 7, 8, 9, "gold")
    return c.outline().im


def vase():
    c = Canvas(T, T)
    c.rect(6, 10, 9, 15, "white"); c.vline(9, 10, 15, "light")
    for i, (x, y) in enumerate(((5, 5), (8, 3), (10, 6), (6, 8), (9, 8), (7, 6))):
        c.px(x, y, ("red", "yellow", "pink", "white", "red", "yellow")[i])
        c.px(x, y + 1, "leafs")
    return c.outline().im


def wall_fan(right):
    """An electric fan on the side wall, as in most Filipino churches."""
    c = Canvas(T, T)
    c.disc(8, 8, 6, "light")
    c.disc(8, 8, 5, "mid")
    for (dx, dy) in ((-3, -2), (3, 2), (2, -3), (-2, 3)):
        c.px(8 + dx, 8 + dy, "white")
    c.disc(8, 8, 1, "dark")
    x = 15 if not right else 0
    c.rect(min(x, 13), 7, max(x, 2), 9, "dark")
    return c.outline().im


def plant():
    c = Canvas(T, T)
    c.rect(5, 11, 10, 15, "wood"); c.hline(5, 10, 11, "woods")
    for (x0, y0, x1, y1) in ((8, 11, 2, 3), (8, 11, 13, 2), (8, 11, 8, 1), (8, 11, 14, 8), (8, 11, 1, 9)):
        steps = max(abs(x1 - x0), abs(y1 - y0))
        for i in range(steps + 1):
            c.px(x0 + (x1 - x0) * i // steps, y0 + (y1 - y0) * i // steps, "leafs" if i % 3 else "green")
    return c.outline().im


def all_tiles():
    tiles = {
        "church-wall": wall(), "church-wall-base": wall_base(),
        "church-side": side_wall(False), "church-side-r": side_wall(True),
        "church-front": front_wall(), "church-door": doorway(), "church-window": window(),
        "church-floor": floor(False), "church-floor-2": floor(True), "church-sanctuary": sanctuary(),
        "church-rail": rail(False), "church-rail-end": rail(True),
        "church-ambo": ambo(), "church-vase": vase(), "church-fan": wall_fan(False), "church-fan-r": wall_fan(True),
        "church-plant": plant(),
    }
    tiles.update(tiles_of("retablo", retablo()))
    tiles.update(tiles_of("statue-mary", statue("mary")))
    tiles.update(tiles_of("statue-nino", statue("nino")))
    tiles.update(tiles_of("statue-peter", peter()))
    return tiles
