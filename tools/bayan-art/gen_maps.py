"""Writes the Lesson 02 Tiled maps (town.json, church.json) and PNG previews of every state.

Tiled 1.10 JSON, embedded tilesets, so the maps open in Tiled for editing.
Tile ids below are 0-based ids inside each tileset; gids are added per tileset.
"""
import json, os, random, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "public", "lessons", "lesson-02")
PREVIEW = os.path.join(HERE, "preview")
T = 16
# Written by gen_art.py, so run that first.
EXTRA = json.load(open(os.path.join(OUT, "sprites", "extra.json")))

TILESETS = {
    # name: (image relative to maps/, columns, tilecount, image w, h)
    "town": ("../tiles/town.png", 12, 132, 192, 176),
    "extra": ("../tiles/extra.png", 8, 8 * ((len(EXTRA) + 7) // 8), 128, 16 * ((len(EXTRA) + 7) // 8)),
}


class Map:
    def __init__(self, w, h, tilesets, inner=None):
        """With `inner` = (width, height, x, y), layer() and obj() work inside that area of a bigger world."""
        self.w, self.h = w, h
        self.inner = inner or (w, h, 0, 0)
        self.tilesets = tilesets
        self.first = {}
        gid = 1
        for name in tilesets:
            self.first[name] = gid
            gid += TILESETS[name][2]
        self.layers = []  # (path, grid) path like "ground" or "buildings/house-built"
        self.objects = []
        self.next_object = 1

    def layer(self, path):
        iw, ih, _, _ = self.inner
        grid = [[0] * iw for _ in range(ih)]
        self.layers.append((path, grid))
        return grid

    def world_layer(self, path):
        grid = [[0] * self.w for _ in range(self.h)]
        self.layers.append((path, grid))
        return grid

    def full(self, grid):
        """A layer at world size, whether it was made inside the inner area or not."""
        if len(grid) == self.h and len(grid[0]) == self.w:
            return grid
        _, _, ox, oy = self.inner
        out = [[0] * self.w for _ in range(self.h)]
        for y, row in enumerate(grid):
            for x, v in enumerate(row):
                out[y + oy][x + ox] = v
        return out

    def gid(self, ts, tid):
        return self.first[ts] + tid

    def obj(self, type_, x, y, name="", w=0, h=0, **props):
        """x, y in tiles inside the inner area. Points sit at the tile center."""
        x += self.inner[2]
        y += self.inner[3]
        o = {
            "id": self.next_object, "name": name, "type": type_, "rotation": 0, "visible": True,
            "x": x * T + (0 if w else T / 2), "y": y * T + (0 if h else T / 2),
            "width": w * T, "height": h * T,
        }
        if not w:
            o["point"] = True
        if props:
            o["properties"] = [
                {"name": k, "type": "int" if isinstance(v, int) else "string", "value": v} for k, v in props.items()
            ]
        self.next_object += 1
        self.objects.append(o)

    def to_json(self):
        layers, lid = [], 1
        groups = {}
        for path, grid in self.layers:
            parts = path.split("/")
            data = [c for row in self.full(grid) for c in row]
            tl = {
                "data": data, "width": self.w, "height": self.h, "id": 0, "name": parts[-1],
                "opacity": 1, "type": "tilelayer", "visible": True, "x": 0, "y": 0,
            }
            if parts[-1] == "collisions":
                tl["opacity"] = 0.5
            if len(parts) == 2:
                if parts[0] not in groups:
                    g = {"id": 0, "name": parts[0], "layers": [], "opacity": 1, "type": "group", "visible": True, "x": 0, "y": 0}
                    groups[parts[0]] = g
                    layers.append(g)
                groups[parts[0]]["layers"].append(tl)
            else:
                layers.append(tl)
        objects_layer = {
            "draworder": "topdown", "id": 0, "name": "objects", "objects": self.objects, "opacity": 1,
            "type": "objectgroup", "visible": True, "x": 0, "y": 0,
        }
        # collisions above buildings, objects last
        coll = [l for l in layers if l["name"] == "collisions"]
        rest = [l for l in layers if l["name"] != "collisions"]
        layers = rest + coll + [objects_layer]

        def number(ls):
            nonlocal lid
            for l in ls:
                l["id"] = lid
                lid += 1
                if l["type"] == "group":
                    number(l["layers"])
        number(layers)

        tilesets = []
        for name in self.tilesets:
            img, cols, count, iw, ih = TILESETS[name]
            ts = {
                "columns": cols, "firstgid": self.first[name], "image": img, "imageheight": ih, "imagewidth": iw,
                "margin": 0, "name": name, "spacing": 0, "tilecount": count, "tileheight": T, "tilewidth": T,
            }
            if name == "extra":
                ts["tiles"] = [{"id": EXTRA["collide"], "properties": [{"name": "ge_collide", "type": "bool", "value": True}]}]
            tilesets.append(ts)
        return {
            "compressionlevel": -1, "height": self.h, "width": self.w, "infinite": False,
            "orientation": "orthogonal", "renderorder": "right-down", "tiledversion": "1.10.2",
            "type": "map", "version": "1.10", "tileheight": T, "tilewidth": T,
            "nextlayerid": lid, "nextobjectid": self.next_object, "layers": layers, "tilesets": tilesets,
        }


def put(grid, x, y, gid):
    grid[y][x] = gid


def rect(grid, x, y, rows):
    for dy, row in enumerate(rows):
        for dx, g in enumerate(row):
            if g:
                grid[y + dy][x + dx] = g


# ---------------- town ----------------
# Who looks like whom, for the previews only. The game reads this from the lesson content.
PREVIEW_SPRITES = {
    "pupil": "pupil", "bea": "guide", "tatay": "father", "nanay": "mother", "principal": "principal",
    "teacher": "teacher", "president": "president", "priest": "priest", "mang-jose": "builder-jose",
    "aling-rosa": "builder-rosa", "mang-tonyo": "builder-tonyo", "ate-liza": "builder-liza", "kuya-dan": "builder-dan",
    "mang-pedro": "builder-pedro", "aling-cora": "builder-cora", "lolo-ramon": "builder-ramon", "paolo": "kid-a",
    "joy": "kid-b", "aling-nena": "tindera", "mang-ben": "vendor",
}

# The town is a clearing in a forest, with a road running through it. The world is wide enough that
# a whole-number zoom fills even a very wide screen with forest around the town.
WORLD_W, WORLD_H = 64, 36
INNER_W, INNER_H = 32, 22
OX, OY = (WORLD_W - INNER_W) // 2, (WORLD_H - INNER_H) // 2
ROAD_Y = 19


def town():
    W, H = INNER_W, INNER_H
    m = Map(WORLD_W, WORLD_H, ["town", "extra"], inner=(W, H, OX, OY))
    tw = lambda i: m.gid("town", i)
    ex = lambda n: m.gid("extra", EXTRA[n])
    rnd = random.Random(7)
    blocked = set()

    def place(grid, x, y, piece, w, h, block=True):
        """Puts a piece cut by art_town (`piece-col-row` tiles) at x, y."""
        for r in range(h):
            for c in range(w):
                name = f"{piece}-{c}-{r}"
                if name in EXTRA:
                    grid[y + r][x + c] = ex(name)
                    if block:
                        blocked.add((x + c, y + r))

    grass = m.world_layer("grass")
    for y in range(WORLD_H):
        for x in range(WORLD_W):
            grass[y][x] = tw(0)

    # Grass in patches of shade, not one flat green.
    ground = m.layer("ground")
    patch = {}
    for by in range(0, H, 3):
        for bx in range(0, W, 3):
            r = rnd.random()
            patch[(bx // 3, by // 3)] = None if r < 0.5 else "grass-dark" if r < 0.7 else "grass-light" if r < 0.85 else "grass-dry"
    for y in range(H):
        for x in range(W):
            shade = patch[(x // 3, y // 3)]
            if rnd.random() < 0.2:
                shade = patch.get(((x + rnd.choice((-1, 1))) // 3, y // 3), shade)
            r = rnd.random()
            ground[y][x] = tw(1 if r < 0.05 else 2) if r < 0.08 else (ex(shade) if shade else tw(0))

    grid = m.layer("grid")

    def dirt_tile(x, y, cells):
        n = (x, y - 1) in cells; s = (x, y + 1) in cells; w = (x - 1, y) in cells; e = (x + 1, y) in cells
        col = 0 if not w else 2 if not e else 1
        row = 0 if not n else 2 if not s else 1
        return [[12, 13, 14], [24, 25, 26], [36, 37, 38]][row][col]

    def dirt(cells):
        for (x, y) in cells:
            ground[y][x] = tw(dirt_tile(x, y, cells))
            grid[y][x] = ex("grid")

    # Streets: the main street, the south street, and the avenue through the park to the road.
    streets = set()
    for x in range(1, W - 1):
        streets.add((x, 7))
    for x in range(1, 18):
        streets.add((x, 13))
    for y in range(7, ROAD_Y):
        streets.add((15, y)); streets.add((16, y))
    # The yards in front of the south buildings, where their leaders stand.
    for x in range(2, 11):
        streets.add((x, 18))
    for x in range(17, 27):
        streets.add((x, 18))
    dirt(streets)

    # Lots: a dirt yard around each building, so the empty lot reads as a building site.
    lots = {"house": (2, 1, 7, 6), "school": (17, 1, 11, 6), "hall": (2, 13, 9, 5), "church": (18, 11, 9, 7)}
    for lot, (lx, ly, lw, lh) in lots.items():
        yard = {(x, y) for x in range(lx, lx + lw) for y in range(ly, ly + lh) if (x, y) not in streets}
        dirt(yard)

    # The road, through the forest and the town, for the jeepney.
    road_cells = {(x, y) for x in range(WORLD_W) for y in (ROAD_Y + OY, ROAD_Y + OY + 1)}
    road = m.world_layer("road")
    for (x, y) in road_cells:
        road[y][x] = ex("road-top" if y == ROAD_Y + OY else "road-bottom")

    water = m.layer("water")
    px0, py0, pw, ph = 2, 9, 5, 2
    names = {"n": {"w": "nw", "e": "ne", "": "n"}, "s": {"w": "sw", "e": "se", "": "s"}, "c": {"w": "w", "e": "e", "": "c"}}
    for y in range(py0, py0 + ph):
        for x in range(px0, px0 + pw):
            v = "n" if y == py0 else "s" if y == py0 + ph - 1 else "c"
            h = "w" if x == px0 else "e" if x == px0 + pw - 1 else ""
            water[y][x] = ex("water-" + names[v][h])
            blocked.add((x, y))
    # A small rice paddy with a carabao resting beside it.
    for y in range(2, 6):
        for x in range(10, 14):
            water[y][x] = ex("paddy")
            blocked.add((x, y))

    clearing = {(x + OX, y + OY) for x in range(1, W - 1) for y in range(1, ROAD_Y)}
    forest_cells = {(x, y) for x in range(WORLD_W) for y in range(WORLD_H)} - clearing - road_cells
    forest = m.world_layer("forest")
    for (x, y) in forest_cells:
        below = (x, y + 1) in forest_cells or y == WORLD_H - 1
        above_ = (x, y - 1) in forest_cells or y == 0
        right = (x + 1, y) in forest_cells or x == WORLD_W - 1
        left = (x - 1, y) in forest_cells or x == 0
        forest[y][x] = tw(31 if not below else 7 if not above_ else 20 if not right else 18 if not left else 19)

    decor = m.layer("decor")
    above = m.layer("above")

    # The park: hedges, flower beds, a monument, a gazebo, benches, lamps, and paving with the grid.
    park = {(x, y) for x in range(10, 22) for y in range(8, 13)}
    for (x, y) in park:
        if (x, y) in streets:
            ground[y][x] = tw(43)
    for x in range(10, 22):
        for y in (8, 12):
            if x not in (14, 15, 16, 17):
                decor[y][x] = ex("hedge"); blocked.add((x, y))
    for (x, y) in ((11, 9), (11, 11), (20, 9), (20, 11)):
        decor[y][x] = ex("flowerbed"); blocked.add((x, y))
    plaza = {(x, y) for x in range(13, 19) for y in range(9, 12)}
    for (x, y) in plaza:
        ground[y][x] = tw(43); grid[y][x] = ex("grid")
    place(decor, 15, 9, "monument", 1, 2, block=False)
    above[9][15] = decor[9][15]; decor[9][15] = 0
    blocked.add((15, 10))
    for (x, y) in ((13, 9), (18, 9)):
        decor[y][x] = ex("lamp"); blocked.add((x, y))
    for (x, y) in ((12, 10), (19, 10)):
        decor[y][x] = ex("bench"); blocked.add((x, y))

    # Big trees in the clearing: the tip sits on the layer above the people, so they pass behind it.
    for (x, y, tip, base) in [(9, 4, 4, 16), (9, 11, 4, 16), (22, 11, 4, 16), (1, 3, 4, 16), (27, 15, 4, 16)]:
        decor[y][x] = tw(base); above[y - 1][x] = tw(tip); blocked.add((x, y))
    # Coconut palms: the crown hangs over the people, the trunk's foot blocks.
    for (x, y) in ((28, 1), (11, 14), (29, 14)):
        place(above, x, y, "coconut", 2, 2, block=False)
        for c in range(2):
            name = f"coconut-{c}-2"
            if name in EXTRA:
                decor[y + 2][x + c] = ex(name)
        blocked.add((x + 1, y + 2))
    for (x, y) in ((8, 8), (30, 4)):
        above[y][x] = ex("banana-0-0"); decor[y + 1][x] = ex("banana-0-1"); blocked.add((x, y + 1))
    for (x, y) in ((1, 6), (24, 6), (12, 6), (6, 12), (13, 16), (30, 12), (8, 11)):
        decor[y][x] = ex("tallgrass")
    for (x, y) in ((14, 1), (16, 6), (1, 11), (23, 13), (7, 12)):
        decor[y][x] = ex("flowers")
    decor[11][7] = ex("reeds")
    decor[10][1] = ex("reeds")
    place(decor, 14, 5, "carabao", 2, 1)

    # Sari-sari store, its goods stand, and a basketball half court.
    rect(decor, 22, 8, [[ex("store-nw"), ex("store-n"), ex("store-ne")], [ex("store-sw"), ex("store-s"), ex("store-se")]])
    for x in range(22, 25):
        for y in (8, 9):
            blocked.add((x, y))
    decor[9][25] = ex("stand"); blocked.add((25, 9))
    place(ground, 26, 8, "court", 5, 4, block=False)
    for y in range(8, 12):
        for x in range(26, 31):
            grid[y][x] = ex("grid")
    decor[8][28] = ex("hoop"); blocked.add((28, 8))

    # Banderitas strung over the main street for the fiesta.
    for x in range(9, 23):
        above[7][x] = ex("banderitas-a" if x % 2 else "banderitas-b")

    # By the road: a waiting shed and a parked tricycle.
    place(decor, 11, 17, "shed", 3, 2, block=False)
    blocked.update({(11, 17), (13, 17), (11, 18), (13, 18)})
    place(decor, 27, 17, "trike", 2, 2)

    # Buildings. Each lot has its site and its finished building. The church's site is the Lesson 01 wall.
    footprints = {"house": (3, 2, 4, 4), "school": (18, 2, 7, 4), "hall": (3, 14, 6, 4), "church": (19, 12, 7, 6)}
    sites = {
        "house": [(3, 3, "planks"), (5, 4, "stones"), (6, 2, "sack")],
        "school": [(18, 3, "stones"), (21, 4, "planks"), (24, 2, "sack")],
        "hall": [(4, 15, "planks"), (7, 16, "stones"), (3, 17, "sack")],
    }
    for lot, (bx, by, bw, bh) in footprints.items():
        for y in range(by, by + bh):
            for x in range(bx, bx + bw):
                if lot != "church" or f"church-{x - bx}-{y - by}" in EXTRA:
                    blocked.add((x, y))
        site_layer = m.layer(f"buildings/{lot}-site")
        if lot == "church":
            place(site_layer, bx, by, "lesson1-wall", bw, bh, block=False)
        else:
            for (x, y, kind) in sites[lot]:
                site_layer[y][x] = ex(f"site-{kind}")
        built = m.layer(f"buildings/{lot}-built")
        place(built, bx, by, lot, bw, bh, block=False)
    # Flagpoles: the waving flag on top is drawn by the game once the building stands.
    flags = {"school": (26, 3), "hall": (9, 15)}
    for (x, y) in flags.values():
        decor[y + 1][x] = ex("pole"); decor[y + 2][x] = ex("pole")
        blocked.update({(x, y + 1), (x, y + 2)})
    # St. Peter by the church door, three tiles tall: his upper body over whoever passes behind, all of him solid.
    STATUE = (26, 15)
    above[STATUE[1]][STATUE[0]] = ex("statue-peter-0-0")
    above[STATUE[1] + 1][STATUE[0]] = ex("statue-peter-0-1")
    decor[STATUE[1] + 2][STATUE[0]] = ex("statue-peter-0-2")
    blocked.update({(STATUE[0], STATUE[1] + i) for i in range(3)})

    coll = m.world_layer("collisions")
    for (x, y) in forest_cells:
        coll[y][x] = ex("collide")
    for (x, y) in road_cells:
        if (x - OX) < 1 or (x - OX) > W - 2:
            coll[y][x] = ex("collide")
    for (x, y) in blocked:
        coll[y + OY][x + OX] = ex("collide")

    # Objects: every position the scenes use.
    m.obj("view", 0, 0, name="town", w=W, h=H)
    m.obj("spawn", 15, 13, name="pupil")
    m.obj("guide", 16, 13, name="bea", behavior="leader")
    for lot, (lx, ly, lw, lh) in lots.items():
        m.obj("lot", lx, ly, name=lot, w=lw, h=lh, lotId=lot)
    leaders = {
        "house": [("tatay", 4, 6), ("nanay", 6, 6)],
        "school": [("principal", 20, 6), ("teacher", 22, 6)],
        "hall": [("president", 7, 18)],
        "church": [("priest", 24, 18)],
    }
    for lot, people in leaders.items():
        for pid, x, y in people:
            m.obj("leader", x, y, name=pid, lotId=lot, behavior="leader")
    villagers = {
        "house": [(2, 5, "mang-jose", "hold-hammer"), (8, 3, "aling-rosa", "hold-plank")],
        "school": [(17, 4, "mang-tonyo", "hold-books"), (25, 3, "ate-liza", "hold-bucket")],
        "hall": [(2, 16, "kuya-dan", "hold-flag"), (10, 15, "mang-pedro", "hold-saw")],
        "church": [(18, 16, "aling-cora", "hold-bucket"), (26, 13, "lolo-ramon", "hold-hammer")],
    }
    for lot, vs in villagers.items():
        for (x, y, pid, holds) in vs:
            m.obj("villager", x, y, name=pid, lotId=lot, holds=holds, behavior="builder")
    gathers = {
        "house": [(3, 6), (7, 6)], "school": [(18, 6), (24, 6)],
        "hall": [(4, 18), (9, 18)], "church": [(19, 18), (21, 18)],
    }
    for lot, ps in gathers.items():
        for (x, y) in ps:
            m.obj("gather", x, y, lotId=lot)
    m.obj("door", 23, 18, name="church", target="church")
    # The statue and, at its foot, the only open tile in front of it, where the pupil stands to read it.
    m.obj("statue", STATUE[0], STATUE[1], name="peter", w=1, h=4)
    for lot, (x, y) in flags.items():
        m.obj("flag", x, y, name=f"flag-{lot}", lotId=lot)
    for i, (x, y) in enumerate([(14, 11), (16, 11), (18, 11)]):
        m.obj("plaque", x, y, name=f"plaque-{i + 1}", index=i)
    m.obj("lane", -OX, ROAD_Y, name="road", w=WORLD_W, h=2, stop=OX + 12)
    m.obj("townsfolk", 13, 10, name="paolo", behavior="playful", roam=3)
    m.obj("townsfolk", 18, 10, name="joy", behavior="wanderer", roam=2)
    m.obj("townsfolk", 23, 10, name="aling-nena", behavior="shopkeeper", roam=1)
    m.obj("vendor", 2, 7, name="mang-ben", holds="hold-taho", behavior="vendor")
    for i, (x, y) in enumerate([(2, 7), (29, 7), (16, 7), (16, 13), (2, 13), (15, 13), (15, 7)]):
        m.obj("route", x, y, name=f"route-{i + 1}", order=i)
    animals = [
        (14, 2, "hen-1", "hen", 2), (16, 4, "hen-2", "hen", 2), (7, 4, "muning", "cat", 1), (14, 14, "bantay", "dog", 3),
    ]
    for (x, y, aid, behavior, roam) in animals:
        m.obj("animal", x, y, name=aid, behavior=behavior, roam=roam)
    return m


# ---------------- church interior ----------------
def church():
    """The parish church inside: the retablo and altar up front, the rail where the leaders stand
    in a line, pews on both sides of a red carpet, and the main door at the back."""
    W, H = 25, 15
    # Thick stone around the room, like the forest around the town, so a screen of any shape crops only wall.
    world_w, world_h = W + 16, H + 10
    ox, oy = 8, 5
    m = Map(world_w, world_h, ["extra"], inner=(W, H, ox, oy))
    ex = lambda n: m.gid("extra", EXTRA[n])
    stone = m.world_layer("stone")
    for y in range(world_h):
        for x in range(world_w):
            stone[y][x] = ex("church-front")
    mid = W // 2
    blocked = set()

    ground = m.layer("ground")
    grid = m.layer("grid")
    for y in range(H):
        for x in range(W):
            ground[y][x] = ex("church-floor" if (x + y) % 2 else "church-floor-2")
            grid[y][x] = ex("grid")
    for y in (3, 4):
        for x in range(1, W - 1):
            ground[y][x] = ex("church-sanctuary")
    for y in range(5, H - 1):
        ground[y][mid] = ex("carpet")

    walls = m.layer("walls")
    for x in range(W):
        walls[0][x] = ex("church-wall"); walls[1][x] = ex("church-wall"); walls[2][x] = ex("church-wall-base")
        walls[H - 1][x] = ex("church-front")
        for y in (0, 1, 2, H - 1):
            blocked.add((x, y))
    for x in (3, 6, 18, 21):
        walls[1][x] = ex("church-window")
    for y in range(3, H - 1):
        walls[y][0] = ex("church-side"); walls[y][W - 1] = ex("church-side-r")
        blocked.update({(0, y), (W - 1, y)})
    walls[H - 1][mid] = ex("church-door")
    blocked.discard((mid, H - 1))

    furn = m.layer("furniture")
    def put_piece(x, y, piece, w, h):
        for r in range(h):
            for c in range(w):
                name = f"{piece}-{c}-{r}"
                if name in EXTRA:
                    furn[y + r][x + c] = ex(name)
                    blocked.add((x + c, y + r))
    put_piece(9, 0, "retablo", 7, 4)
    furn[4][mid - 1] = ex("altar-left"); furn[4][mid] = ex("altar-mid"); furn[4][mid + 1] = ex("altar-right")
    for x in (mid - 2, mid + 2):
        furn[4][x] = ex("candle")
    furn[4][7] = ex("church-ambo"); furn[4][17] = ex("church-vase"); furn[4][8] = ex("church-vase")
    blocked.update({(x, 4) for x in range(mid - 2, mid + 3)} | {(7, 4), (8, 4), (17, 4)})
    put_piece(2, 3, "statue-mary", 1, 2)
    put_piece(22, 3, "statue-nino", 1, 2)
    # The communion rail, open in the middle.
    for x in range(1, W - 1):
        if mid - 1 <= x <= mid + 1:
            continue
        end = x in (mid - 2, mid + 2)
        furn[5][x] = ex("church-rail-end" if end else "church-rail")
        blocked.add((x, 5))
    pew = [ex("pew-left")] + [ex("pew-mid")] * 6 + [ex("pew-right")]
    for y in (8, 10, 12):
        rect(furn, 2, y, [pew])
        rect(furn, mid + 3, y, [pew])
        blocked.update({(x, y) for x in list(range(2, 10)) + list(range(mid + 3, mid + 11))})
    for y in (7, 11):
        furn[y][0] = ex("church-fan"); furn[y][W - 1] = ex("church-fan-r")
    for x in (1, W - 2):
        furn[H - 2][x] = ex("church-plant"); blocked.add((x, H - 2))

    coll = m.world_layer("collisions")
    for y in range(world_h):
        for x in range(world_w):
            inside = ox <= x < ox + W and oy <= y < oy + H
            if not inside or (x - ox, y - oy) in blocked:
                coll[y][x] = ex("collide")

    m.obj("view", 0, 0, name="church", w=W, h=H)
    m.obj("spawn", mid, H - 2, name="pupil", sprite="pupil")
    m.obj("exit", mid, H - 1, name="town", target="town")
    figures = ["pope", "nuncio", "archbishop", "priest", "deacon", "lay"]
    for i, (sprite, x) in enumerate(zip(figures, [2, 5, 8, 16, 19, 22])):
        m.obj("figure", x, 6, name=sprite, index=i, sprite=sprite)
    return m


def save(m, name):
    os.makedirs(os.path.join(OUT, "maps"), exist_ok=True)
    with open(os.path.join(OUT, "maps", f"{name}.json"), "w") as f:
        json.dump(m.to_json(), f, separators=(",", ":"))
        f.write("\n")


# ---------------- previews ----------------
def render(m, show, path, people=None):
    sheets = {n: Image.open(os.path.join(OUT, "tiles", TILESETS[n][0].split("/")[-1])).convert("RGBA") for n in m.tilesets}
    im = Image.new("RGBA", (m.w * T, m.h * T), (0, 0, 0, 255))

    def tile(gid):
        for name in reversed(m.tilesets):
            if gid >= m.first[name]:
                i = gid - m.first[name]
                cols = TILESETS[name][1]
                return sheets[name].crop(((i % cols) * T, (i // cols) * T, (i % cols) * T + T, (i // cols) * T + T))

    for lp, grid in sorted(m.layers, key=lambda l: l[0] == "above"):
        if lp == "collisions" or (lp.startswith("buildings/") and lp.split("/")[1] not in show and lp.split("/")[1] not in ("walls", "furniture")):
            continue
        world = m.full(grid)
        for y in range(m.h):
            for x in range(m.w):
                if world[y][x]:
                    im.alpha_composite(tile(world[y][x]), (x * T, y * T))
    if people:
        ps = Image.open(os.path.join(OUT, "sprites", "people.png")).convert("RGBA")
        rows = json.load(open(os.path.join(OUT, "sprites", "people.json")))
        extra_sheet = Image.open(os.path.join(OUT, "tiles", "extra.png")).convert("RGBA")
        for o in m.objects:
            props = {p["name"]: p["value"] for p in o.get("properties", [])}
            sprite = props.get("sprite") or PREVIEW_SPRITES.get(o["name"])
            if sprite:
                r = rows[sprite]
                x, y = int(o["x"] - 8), int(o["y"] - 8)
                im.alpha_composite(ps.crop((0, r * T, T, r * T + T)), (x, y))
                if "holds" in props:
                    i = EXTRA[props["holds"]]
                    t = extra_sheet.crop(((i % 8) * T, (i // 8) * T, (i % 8) * T + T, (i // 8) * T + T))
                    im.alpha_composite(t, (x, y))
    im.resize((im.width * 4, im.height * 4), Image.NEAREST).save(path)


def main():
    os.makedirs(PREVIEW, exist_ok=True)
    t = town()
    save(t, "town")
    render(t, {"house-site", "school-site", "hall-site", "church-site"}, os.path.join(PREVIEW, "town-start.png"), people=True)
    render(t, {"house-built", "school-built", "hall-built", "church-built"}, os.path.join(PREVIEW, "town-done.png"), people=True)
    c = church()
    save(c, "church")
    render(c, set(), os.path.join(PREVIEW, "church.png"), people=True)


if __name__ == "__main__":
    main()
