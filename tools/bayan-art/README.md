# Build Our Bayan art

These scripts draw Lesson 02's maps, sprites, and sounds. They are the source: change a script and run it, rather than editing the PNGs, or the maps in Tiled, by hand. A later run would overwrite those edits.

Needs Python 3 with Pillow (`pip install pillow`).

1. Download Kenney's Tiny Town (https://kenney.nl/assets/tiny-town) and unzip it into `kenney/` here, as `kenney/kenney_tiny-town`. The folder is not committed.
2. From this folder, run in order:

```
python gen_art.py
python gen_maps.py
python gen_sound.py
```

They write into `public/lessons/lesson-02`. `gen_maps.py` also writes PNG previews of every town and church state into `preview/`, which is not committed, so you can check the result without running the game.

| Script | Draws |
| --- | --- |
| `gen_art.py` | the tile sheets and sprite sheets, from the files below |
| `art_town.py` | buildings, the park, street life, held tools, the walk grid |
| `art_people.py` | everyone, from parts: skin, hair, outfit, hat |
| `art_life.py` | animals, markers, water, the store, the flag |
| `art_church.py` | the inside of the parish church, and the saints' statues |
| `gen_maps.py` | the town and church maps, and every position the game uses |
| `gen_sound.py` | the music loop and the synthesized sound effects |
