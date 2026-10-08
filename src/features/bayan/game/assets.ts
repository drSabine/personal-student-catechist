import type * as Phaser from "phaser";
import type { BayanAssets, SoundName } from "../BayanActivity";

/** Cache keys for everything the scenes load. */
export const KEY = {
  townMap: "town-map",
  churchMap: "church-map",
  tilesTown: "tiles-town",
  tilesExtra: "tiles-extra",
  /** The extra tiles as single frames: markers, animals, held tools, effects. */
  extraFrames: "extra-frames",
  people: "people",
  peopleIndex: "people-index",
  extraIndex: "extra-index",
  vehicles: "vehicles",
} as const;

export const TILE = 16;
/** The jeepney's frame, in pixels. */
export const VEHICLE = { width: 48, height: 32 };

export function soundKey(name: SoundName): string {
  return `sound-${name}`;
}

/** Both scenes' files, loaded once by the town, which opens first. */
export function preloadAll(scene: Phaser.Scene, assets: BayanAssets): void {
  const load = scene.load;
  load.tilemapTiledJSON(KEY.townMap, assets.townMap);
  load.tilemapTiledJSON(KEY.churchMap, assets.churchMap);
  load.image(KEY.tilesTown, assets.tiles.town);
  load.image(KEY.tilesExtra, assets.tiles.extra);
  load.spritesheet(KEY.extraFrames, assets.tiles.extra, { frameWidth: TILE, frameHeight: TILE });
  load.spritesheet(KEY.people, assets.people, { frameWidth: TILE, frameHeight: TILE });
  load.spritesheet(KEY.vehicles, assets.vehicles, { frameWidth: VEHICLE.width, frameHeight: VEHICLE.height });
  load.json(KEY.peopleIndex, assets.peopleIndex);
  load.json(KEY.extraIndex, assets.extraIndex);
  for (const [name, url] of Object.entries(assets.sounds)) load.audio(soundKey(name as SoundName), url);
}

/** Looks up frames by name, so code never holds frame numbers. */
export class Frames {
  private readonly people: Record<string, number>;
  private readonly extras: Record<string, number>;

  constructor(scene: Phaser.Scene) {
    this.people = scene.cache.json.get(KEY.peopleIndex) as Record<string, number>;
    this.extras = scene.cache.json.get(KEY.extraIndex) as Record<string, number>;
  }

  /** A person's standing frame. Their step frame is the next one. */
  person(name: string): number {
    const row = this.people[name];
    if (row === undefined) throw new Error(`No person named "${name}" in the people sheet.`);
    return row * 2;
  }

  extra(name: string): number {
    const frame = this.extras[name];
    if (frame === undefined) throw new Error(`No frame named "${name}" in the extra sheet.`);
    return frame;
  }

  hasExtra(name: string): boolean {
    return name in this.extras;
  }
}
