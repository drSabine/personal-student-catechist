# Credits

All art and sound here is free to use in class. Only the files the game uses are copied.

| Pack | Source | License | Files here |
| --- | --- | --- | --- |
| Tiny Town 1.1 by Kenney | https://kenney.nl/assets/tiny-town | CC0 1.0 | `tiles/town.png` |
| Interface Sounds by Kenney | https://kenney.nl/assets/interface-sounds | CC0 1.0 | `sounds/talk.ogg` (question_001), `right.ogg` (confirmation_002), `door.ogg` (open_002) |
| Music Jingles by Kenney | https://kenney.nl/assets/music-jingles | CC0 1.0 | `sounds/build.ogg` (jingles_PIZZI03), `stage.ogg` (jingles_NES09) |

CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/

## Made for this lesson

Made in the same palette and released under CC0 1.0 like the packs:

- `tiles/extra.png`: the buildings, the park, the street life, held tools, markers, effects, animals, and the inside of the church.
- `sprites/people.png`: everyone in the town and the church, drawn from parts (skin, hair, outfit, and hat).
- `sprites/buildings.png`: the finished buildings, for the card shown when one is built.
- `sprites/vehicles.png`: the jeepney.
- `sounds/town-loop.wav` (the background music with birdsong), `blip.wav`, `pop.wav`, `wrong.wav`, `sparkle.wav`, `hammer.wav`, `rise.wav`, and `cheer.wav`: synthesized for this lesson.

`sprites/people.json` and `sprites/extra.json` name each row and frame, so the code and the maps refer to them by name.

## Editing the art and maps

Everything made for this lesson, the maps included, is drawn by the scripts in `tools/bayan-art` (see its README). Change a script and run it again; edits made by hand to these files are lost on the next run. The maps are Tiled maps, so Tiled can open them to look around. Every position the game uses is in the `objects` layer; each person's object name is their id, which the lesson content uses for their name and look, and their `behavior` property picks how they move.
