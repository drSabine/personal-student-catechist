"""Filipino townsfolk drawn from parts: skin, hair, outfit, and extras, so nobody looks alike.

Every person is 16 by 16 and faces a little to the right (the game flips them to walk left).
Adults stand full height; children are three pixels shorter.
"""
from PIL import Image

T = 16
OUT_LINE = (63, 38, 49, 255)

COLORS = {
    # skins
    "skin1": "#f2c19b", "skin1s": "#d99e78",
    "skin2": "#d9a066", "skin2s": "#b07a48",
    "skin3": "#a8693f", "skin3s": "#83502e",
    # hair
    "black": "#262b44", "blacks": "#3a4466", "brown": "#5b3a29", "browns": "#7a5038",
    "gray": "#c0cbdc", "grays": "#8b9bb4",
    # cloth
    "white": "#ffffff", "whites": "#c0cbdc", "cream": "#f6ead2", "creams": "#d9c7a5",
    "navy": "#2b3a67", "navys": "#1d2747", "blue": "#3d8fd6", "blues": "#2a6aa8",
    "denim": "#4f6fa8", "denims": "#3a5280",
    "red": "#e84537", "reds": "#b0332a", "pink": "#f29bbd", "pinks": "#c97598",
    "yellow": "#fdbe53", "yellows": "#e38628", "green": "#5aa65a", "greens": "#3d7a43",
    "olive": "#8a8a4a", "olives": "#66663a", "orange": "#f08a3a", "oranges": "#c0662a",
    "purple": "#9b4ca3", "purples": "#6e3478", "magenta": "#c2307a", "magentas": "#8f2159",
    "khaki": "#c9a46a", "khakis": "#9c7d4c", "brownc": "#8a5a3c", "browncs": "#6a4430",
    "gray2": "#8b9bb4", "gray2s": "#52607c", "black2": "#2e2e3a", "black2s": "#1c1c26",
    "gold": "#fdbe53", "golds": "#e38628", "shoe": "#3f2631", "eye": "#262b44",
    "straw": "#e6c27a", "straws": "#b8923f", "teal": "#3aa6a0", "teals": "#287a76",
}


def rgba(name):
    h = COLORS[name].lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


class Fig:
    """A person being drawn. `top` is the first row of the head: 1 for adults, 4 for children."""

    def __init__(self, kid=False):
        self.im = Image.new("RGBA", (T, T), (0, 0, 0, 0))
        self.kid = kid
        self.top = 4 if kid else 1
        # Rows: head top..top+6, body, legs, shoes on the last row.
        self.body = self.top + 7
        self.legs = 13 if not kid else 14
        self.dark_lines = set()

    def px(self, x, y, color):
        if 0 <= x < T and 0 <= y < T:
            self.im.putpixel((x, y), rgba(color))

    def rect(self, x0, y0, x1, y1, color):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.px(x, y, color)

    def outline(self):
        src = self.im.copy()
        for y in range(T):
            for x in range(T):
                if src.getpixel((x, y))[3]:
                    continue
                if any(
                    0 <= x + dx < T and 0 <= y + dy < T and src.getpixel((x + dx, y + dy))[3]
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                ):
                    self.im.putpixel((x, y), OUT_LINE)
        return self.im


def person(skin, hair, hair_style, outfit, top, bottom=None, kid=False, extras=()):
    """skin: 1 to 3. top and bottom: color names with an `s` shade beside them."""
    f = Fig(kid)
    sk, sks = f"skin{skin}", f"skin{skin}s"
    hs = hair + "s" if hair + "s" in COLORS else hair
    t, ts = top, top + "s"
    b, bs = (bottom or "navy"), (bottom or "navy") + "s"
    h0, by, ly = f.top, f.body, f.legs

    # Long hair falls behind the shoulders, so it is drawn first.
    if hair_style in ("long", "ponytail-long"):
        f.rect(4, h0 + 2, 11, by + 2, hair)
        f.rect(4, by, 4, by + 2, hs)

    # Body. Torso x5..10, arms x4 and x11.
    if outfit in ("cassock", "choir", "alb"):
        f.rect(5, by, 10, 14, t)
        f.rect(4, by, 4, by + 3, t)
        f.rect(11, by, 11, by + 3, ts)
        f.rect(10, by, 10, 14, ts)
        f.px(4, by + 4, sk); f.px(11, by + 4, sk)
        f.rect(5, 15, 6, 15, "shoe"); f.rect(9, 15, 10, 15, "shoe")
    else:
        torso_end = ly - 1
        f.rect(5, by, 10, torso_end, t)
        f.rect(10, by, 10, torso_end, ts)
        sleeve = {"sando": 0, "barong": 3, "blouse": 3, "polo-long": 3}.get(outfit, 1)
        arm_end = torso_end
        for x in (4, 11):
            for y in range(by, arm_end + 1):
                on_sleeve = y < by + sleeve
                f.px(x, y, (t if x == 4 else ts) if on_sleeve else (sk if x == 4 else sks))
        if outfit in ("dress", "duster"):
            f.rect(4, ly, 11, ly + (1 if not kid else 0), t)
            f.rect(10, ly, 11, ly + (1 if not kid else 0), ts)
            f.rect(5, 15, 6, 15, sk); f.rect(9, 15, 10, 15, sk)
            f.px(5, 15, "shoe"); f.px(10, 15, "shoe")
        elif outfit == "skirt":
            f.rect(5, ly, 10, ly + (1 if not kid else 0), b)
            f.rect(10, ly, 10, ly + (1 if not kid else 0), bs)
            f.rect(5, 15, 6, 15, "shoe"); f.rect(9, 15, 10, 15, "shoe")
        elif outfit in ("shorts", "sando"):
            f.rect(5, ly, 10, ly, b); f.rect(10, ly, 10, ly, bs)
            if not kid:
                f.rect(5, ly + 1, 6, ly + 1, sk); f.rect(9, ly + 1, 10, ly + 1, sks)
            f.rect(5, 15, 6, 15, "shoe"); f.rect(9, 15, 10, 15, "shoe")
        else:
            f.rect(5, ly, 6, 14, b); f.rect(9, ly, 10, 14, bs)
            f.rect(7, ly, 8, ly, b)
            f.rect(5, 15, 6, 15, "shoe"); f.rect(9, 15, 10, 15, "shoe")

    # Outfit details.
    if outfit == "barong":
        for y in range(by + 1, ly):
            f.px(7, y, "creams")
        f.px(8, by + 1, "creams"); f.px(6, by + 2, "creams")
    if outfit in ("polo", "polo-long", "shirt-collar"):
        f.px(6, by, "white"); f.px(8, by, "white")
    if outfit == "cassock":
        for y in range(by + 1, 14, 2):
            f.px(7, y, ts)
    if outfit == "duster":
        for (x, y) in ((6, by + 1), (9, by + 3), (5, ly), (8, ly + 1), (7, by + 2)):
            f.px(x, y, "white")
    if outfit == "alb":
        for i, y in enumerate(range(by, by + 6)):
            f.px(5 + i, y, "red")
    if "apron" in extras:
        f.rect(6, by + 1, 9, ly + (1 if not kid else 0), "white")
        f.rect(9, by + 1, 9, ly + (1 if not kid else 0), "whites")
    if "tie" in extras:
        f.px(7, by, "red"); f.px(7, by + 1, "red"); f.px(7, by + 2, "reds")
    if "towel" in extras:
        f.rect(9, by, 11, by, "white"); f.px(11, by + 1, "white"); f.px(11, by + 2, "whites")
    if "pectoral" in extras:
        f.px(7, by + 1, "gold"); f.px(6, by + 2, "gold"); f.px(7, by + 2, "gold"); f.px(8, by + 2, "gold"); f.px(7, by + 3, "golds")
    if "sash" in extras:
        f.rect(5, by + 3, 10, by + 3, "purple")
    if "belt" in extras:
        f.rect(5, ly - 1, 10, ly - 1, "brownc")
    if "id" in extras:
        f.px(6, by + 2, "white"); f.px(6, by + 3, "blue")

    # Head: x4..11, rows h0..h0+6, skin on the face.
    f.rect(5, h0 + 1, 10, h0 + 6, sk)
    f.rect(4, h0 + 2, 11, h0 + 5, sk)
    f.rect(10, h0 + 2, 11, h0 + 5, sk)
    f.px(10, h0 + 6, sks); f.px(5, h0 + 6, sks)
    f.px(11, h0 + 4, sks)
    # Eyes look a little to the right.
    f.px(7, h0 + 4, "eye"); f.px(10, h0 + 4, "eye")
    if "blush" in extras:
        f.px(6, h0 + 5, "pink"); f.px(11, h0 + 5, "pink")
    if "mustache" in extras:
        f.rect(7, h0 + 5, 10, h0 + 5, hair)
    if "beard" in extras:
        f.rect(6, h0 + 5, 10, h0 + 6, "gray")

    # Hair styles on top.
    def cap(color, shade):
        f.rect(5, h0 - 1, 10, h0 + 1, color)
        f.rect(4, h0, 11, h0 + 1, color)
        f.rect(10, h0 - 1, 10, h0 + 1, shade)

    if hair_style == "short":
        f.rect(5, h0, 10, h0 + 1, hair); f.rect(4, h0 + 1, 11, h0 + 1, hair)
        f.rect(4, h0 + 2, 5, h0 + 3, hair); f.px(11, h0 + 2, hair)
        f.rect(8, h0, 10, h0, hs)
    elif hair_style == "side-part":
        f.rect(5, h0, 10, h0 + 1, hair); f.rect(4, h0 + 1, 11, h0 + 2, hair)
        f.rect(4, h0 + 3, 4, h0 + 3, hair); f.px(6, h0 + 2, sk); f.px(7, h0 + 2, sk)
        f.px(9, h0, hs)
    elif hair_style == "spiky":
        f.rect(4, h0, 11, h0 + 1, hair); f.px(5, h0 - 1, hair); f.px(8, h0 - 1, hair); f.px(10, h0 - 1, hair)
        f.rect(4, h0 + 2, 4, h0 + 3, hair)
    elif hair_style in ("long", "ponytail-long"):
        f.rect(4, h0, 11, h0 + 1, hair); f.rect(5, h0 - 1, 10, h0 - 1, hair)
        f.rect(4, h0 + 2, 4, h0 + 5, hair); f.rect(11, h0 + 2, 11, h0 + 3, hair)
        f.px(9, h0, hs); f.px(10, h0, hs)
    elif hair_style == "ponytail":
        f.rect(4, h0, 11, h0 + 1, hair); f.rect(5, h0 - 1, 10, h0 - 1, hair)
        f.rect(4, h0 + 2, 4, h0 + 3, hair)
        f.rect(12, h0 + 1, 13, h0 + 2, hair); f.rect(13, h0 + 3, 13, h0 + 5, hs)
        f.px(12, h0 + 1, "red")
    elif hair_style == "bun":
        f.rect(4, h0, 11, h0 + 1, hair); f.rect(5, h0 - 1, 10, h0 - 1, hair)
        f.rect(4, h0 + 2, 4, h0 + 3, hair)
        f.rect(6, h0 - 3, 9, h0 - 2, hair); f.rect(8, h0 - 3, 9, h0 - 3, hs)
    elif hair_style == "bob":
        f.rect(4, h0, 11, h0 + 1, hair); f.rect(5, h0 - 1, 10, h0 - 1, hair)
        f.rect(4, h0 + 2, 4, h0 + 5, hair); f.rect(11, h0 + 2, 11, h0 + 5, hair)
        f.rect(5, h0 + 2, 6, h0 + 2, hair)
    elif hair_style == "balding":
        f.rect(4, h0 + 1, 4, h0 + 3, hair); f.rect(11, h0 + 1, 11, h0 + 2, hair)
        f.rect(6, h0, 9, h0, sks)
    elif hair_style == "curly":
        for (x, y) in ((4, h0), (6, h0 - 1), (8, h0 - 1), (10, h0), (5, h0), (7, h0), (9, h0), (11, h0 + 1), (4, h0 + 1), (4, h0 + 2), (11, h0 + 2), (5, h0 + 1), (8, h0 + 1), (6, h0), (8, h0), (10, h0 + 1)):
            f.px(x, y, hair)
        f.px(7, h0 - 1, hs); f.px(9, h0 - 1, hs)

    # Hats over the hair.
    if "salakot" in extras:
        f.rect(2, h0 + 1, 13, h0 + 1, "straw")
        f.rect(4, h0, 11, h0, "straw")
        f.rect(6, h0 - 1, 9, h0 - 1, "straw")
        f.px(7, h0 - 2, "straws"); f.px(8, h0 - 2, "straws")
        f.rect(9, h0, 11, h0, "straws"); f.rect(10, h0 + 1, 13, h0 + 1, "straws")
    if "hardhat" in extras:
        cap("yellow", "yellows"); f.rect(3, h0 + 1, 12, h0 + 1, "yellow"); f.rect(11, h0 + 1, 12, h0 + 1, "yellows")
    if "bandana" in extras:
        f.rect(4, h0, 11, h0 + 1, "red"); f.rect(9, h0, 11, h0, "reds"); f.px(3, h0 + 2, "red")
    if "cap" in extras:
        cap("blue", "blues"); f.rect(10, h0 + 1, 13, h0 + 1, "blues")
    if "zucchetto" in extras:
        color = extras[extras.index("zucchetto") + 1]
        f.rect(6, h0 - 1, 9, h0 - 1, color); f.rect(5, h0, 10, h0, color)
    if "mitre" in extras:
        f.rect(6, h0 - 3, 9, h0, "white"); f.rect(7, h0 - 4, 8, h0 - 4, "white")
        f.rect(7, h0 - 3, 8, h0, "gold"); f.px(9, h0 - 2, "whites"); f.px(9, h0 - 1, "whites")
    if "headband" in extras:
        f.rect(4, h0 + 1, 11, h0 + 1, "pink")
    if "flower" in extras:
        f.px(11, h0 + 1, "pink"); f.px(12, h0 + 1, "yellow")

    im = f.outline()
    if "crozier" in extras:
        o, c, sh = OUT_LINE, rgba("gold"), rgba("golds")
        for y in range(4, 16):
            im.putpixel((13, y), c if y < 9 else sh); im.putpixel((14, y), o)
        for (x, y) in ((12, 1), (13, 1), (11, 2), (14, 2), (11, 3), (14, 3), (12, 4)):
            im.putpixel((x, y), o)
        for (x, y) in ((12, 2), (13, 2), (13, 3)):
            im.putpixel((x, y), c)
        im.putpixel((12, 3), o)
    return im


def step(im):
    """The walk frame: the body bobs down a pixel, the feet stay planted."""
    out = Image.new("RGBA", (T, T), (0, 0, 0, 0))
    out.paste(im.crop((0, 0, T, 13)), (0, 1))
    out.alpha_composite(im.crop((0, 14, T, T)), (0, 14))
    return out


# Who looks like whom. The lesson maps each person to one of these names.
PEOPLE = {
    "pupil": dict(skin=2, hair="black", hair_style="short", outfit="polo", top="white", bottom="navy", kid=True),
    "guide": dict(skin=2, hair="black", hair_style="ponytail", outfit="shorts", top="yellow", bottom="denim", extras=("blush",)),
    "father": dict(skin=3, hair="black", hair_style="short", outfit="sando", top="white", bottom="khaki", extras=("towel", "mustache")),
    "mother": dict(skin=2, hair="black", hair_style="bun", outfit="duster", top="pink", extras=("blush",)),
    "principal": dict(skin=1, hair="gray", hair_style="bob", outfit="blouse", top="navy", bottom="navy", extras=("id",)),
    "teacher": dict(skin=2, hair="brown", hair_style="long", outfit="blouse", top="pink", bottom="navy", extras=("id", "blush")),
    "president": dict(skin=2, hair="black", hair_style="side-part", outfit="barong", top="cream", bottom="black2"),
    "priest": dict(skin=2, hair="black", hair_style="short", outfit="cassock", top="white"),
    "pope": dict(skin=1, hair="gray", hair_style="balding", outfit="cassock", top="white", extras=("zucchetto", "white", "pectoral")),
    "nuncio": dict(skin=1, hair="gray", hair_style="short", outfit="cassock", top="black2", extras=("zucchetto", "magenta", "sash", "pectoral")),
    "archbishop": dict(skin=2, hair="black", hair_style="short", outfit="choir", top="purple", extras=("mitre", "pectoral", "crozier")),
    "deacon": dict(skin=3, hair="black", hair_style="short", outfit="alb", top="white"),
    "lay": dict(skin=3, hair="black", hair_style="bob", outfit="dress", top="teal", extras=("blush",)),
    # Builders: each with their own hat, hair, and work clothes.
    "builder-jose": dict(skin=3, hair="black", hair_style="short", outfit="shirt", top="orange", bottom="denim", extras=("hardhat",)),
    "builder-rosa": dict(skin=2, hair="black", hair_style="ponytail", outfit="shirt", top="green", bottom="khaki", extras=("bandana",)),
    "builder-tonyo": dict(skin=2, hair="gray", hair_style="balding", outfit="shirt", top="blue", bottom="khaki", extras=("mustache",)),
    "builder-liza": dict(skin=1, hair="brown", hair_style="bob", outfit="shirt", top="purple", bottom="denim", extras=("blush",)),
    "builder-dan": dict(skin=3, hair="black", hair_style="spiky", outfit="sando", top="red", bottom="denim"),
    "builder-pedro": dict(skin=2, hair="black", hair_style="short", outfit="shirt", top="olive", bottom="black2", extras=("salakot",)),
    "builder-cora": dict(skin=2, hair="gray", hair_style="bun", outfit="duster", top="teal"),
    "builder-ramon": dict(skin=3, hair="gray", hair_style="balding", outfit="polo", top="brownc", bottom="khaki", extras=("salakot",)),
    "kid-a": dict(skin=3, hair="black", hair_style="spiky", outfit="polo", top="white", bottom="navy", kid=True),
    "kid-b": dict(skin=1, hair="black", hair_style="long", outfit="skirt", top="white", bottom="blue", kid=True, extras=("blush",)),
    "tindera": dict(skin=2, hair="black", hair_style="bun", outfit="dress", top="red", extras=("apron", "headband")),
    "vendor": dict(skin=3, hair="black", hair_style="short", outfit="shirt", top="white", bottom="khaki", extras=("cap",)),
}


def build_people():
    return {name: person(**spec) for name, spec in PEOPLE.items()}
