# Credits

All art and sound here is free to use in class. Only the files the game uses are copied.

| Pack | Source | License | Files here |
| --- | --- | --- | --- |
| Tiny Town 1.1 by Kenney | https://kenney.nl/assets/tiny-town | CC0 1.0 | `tiles/town.png` |
| Tiny Dungeon by Kenney | https://kenney.nl/assets/tiny-dungeon | CC0 1.0 | `tiles/dungeon.png`, and the people in `sprites/people.png` |
| Interface Sounds by Kenney | https://kenney.nl/assets/interface-sounds | CC0 1.0 | `sounds/talk.ogg` (question_001), `right.ogg` (confirmation_002), `door.ogg` (open_002) |
| Music Jingles by Kenney | https://kenney.nl/assets/music-jingles | CC0 1.0 | `sounds/build.ogg` (jingles_PIZZI03), `stage.ogg` (jingles_NES09) |

CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/

## Made for this lesson

Made in the same palette and released under CC0 1.0 like the packs:

- `tiles/extra.png`: the cross, the Philippine flag and its waving frames, the capstone, plaques, the question, check, and talk bubbles, the guide arrow, dust, hearts, sparks, confetti, the pond, reeds, flowers, lamps, benches, the sari-sari store, the taho pole, pews, carpet, stained glass, altar, candles, the animals (chickens, chicks, a dog, a cat, ducks, butterflies, birds), and the collision marker used only in Tiled.
- `sprites/people.png`: the pupil, the guide, the leaders, the children, the tindera, the taho vendor, and the villagers. They are Kenney Tiny Dungeon heads and bodies, recolored. The Pope, the Papal Nuncio, the Archbishop, the parish priest, and the deacon wear robes drawn for this lesson.
- `sprites/cloud.png`: the cloud.
- `sounds/town-loop.wav` (the background music with birdsong), `blip.wav`, `pop.wav`, `wrong.wav`, `sparkle.wav`, `hammer.wav`, `rise.wav`, `cheer.wav`, `cluck.wav`, `bark.wav`, `meow.wav`, and `quack.wav`: synthesized for this lesson.

`sprites/people.json` and `sprites/extra.json` name each row and frame, so the code and the maps refer to them by name.

## Editing the maps

`maps/town.json` and `maps/church.json` are Tiled maps. Open them in Tiled (https://www.mapeditor.org) to move people, lots, or buildings. Building states are layers in the `buildings` group, tree tops are on `above`, the forest is its own layer, and every position the game uses is in the `objects` layer. Each person's object name is their id, which the lesson content uses for their name and look, and their `behavior` property picks how they move.
