import type * as Phaser from "phaser";
import { LOT_IDS, type LotId } from "../content";

/** A tile on the map. */
export interface TilePoint {
  x: number;
  y: number;
}

/** An area on the map, in tiles. */
export interface TileRect extends TilePoint {
  width: number;
  height: number;
}

/** Someone on the map. Their id is the object's name; the lesson content says who they are. */
export interface Person extends TilePoint {
  id: string;
  /** How they move and idle. See town/Behaviors.ts. */
  behavior: string;
}

/** Something carried: a frame in the town sheet or a name in the extra sheet. */
export type Held = { sheet: "town"; frame: number } | { sheet: "extra"; frame: string };

export interface Leader extends Person {
  lotId: LotId;
}

export interface Villager extends Person {
  lotId: LotId;
  holds: Held;
}

export interface Townsfolk extends Person {
  /** How far they wander from home, in tiles. */
  roam: number;
}

export interface Animal extends Townsfolk {
  /** Its frame in the extra sheet. */
  kind: string;
}

export interface Lot extends TileRect {
  id: LotId;
}

export interface TownObjects {
  /** The part of the map the camera frames; the forest around it fills any spare screen. */
  view: TileRect;
  spawn: TilePoint & { id: string };
  guide: Person;
  lots: Lot[];
  leaders: Leader[];
  villagers: Villager[];
  /** Where a lot's villagers stand once their building is up. */
  gathers: Record<LotId, TilePoint[]>;
  townsfolk: Townsfolk[];
  vendor: Person & { holds: Held };
  /** The vendor's round, in order. */
  route: TilePoint[];
  animals: Animal[];
  ponds: (TileRect & { ducks: number })[];
  meadows: (TileRect & { butterflies: number })[];
  flag: TilePoint;
  chimney: TilePoint;
}

type TiledObject = Phaser.Types.Tilemaps.TiledObject;

function prop(object: TiledObject, name: string): unknown {
  const properties = object.properties as { name: string; value: unknown }[] | undefined;
  return properties?.find((p) => p.name === name)?.value;
}

function stringProp(object: TiledObject, name: string): string {
  const value = prop(object, name);
  if (typeof value !== "string") throw new Error(`Map object "${object.name}" needs a text property "${name}".`);
  return value;
}

function numberProp(object: TiledObject, name: string, fallback?: number): number {
  const value = prop(object, name);
  if (typeof value === "number") return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Map object "${object.name}" needs a number property "${name}".`);
}

function lotProp(object: TiledObject): LotId {
  const value = stringProp(object, "lotId");
  const lot = LOT_IDS.find((id) => id === value);
  if (!lot) throw new Error(`Map object "${object.name}" has an unknown lotId "${value}".`);
  return lot;
}

/** "town:106" or "extra:taho". */
function heldProp(object: TiledObject): Held {
  const [sheet, frame] = stringProp(object, "holds").split(":");
  if (sheet === "town" && frame && Number.isInteger(Number(frame))) return { sheet, frame: Number(frame) };
  if (sheet === "extra" && frame) return { sheet, frame };
  throw new Error(`Map object "${object.name}" has an unreadable "holds" property.`);
}

export class MapReader {
  private readonly objects: TiledObject[];
  private readonly size: number;

  constructor(map: Phaser.Tilemaps.Tilemap) {
    const layer = map.getObjectLayer("objects");
    if (!layer) throw new Error('The map needs an object layer named "objects".');
    this.objects = layer.objects;
    this.size = map.tileWidth;
  }

  all(type: string): TiledObject[] {
    return this.objects.filter((object) => object.type === type);
  }

  one(type: string): TiledObject {
    const [object] = this.all(type);
    if (!object) throw new Error(`The map needs a "${type}" object.`);
    return object;
  }

  /** Points are stored at a tile's center. */
  tile(object: TiledObject): TilePoint {
    return { x: Math.floor((object.x ?? 0) / this.size), y: Math.floor((object.y ?? 0) / this.size) };
  }

  rect(object: TiledObject): TileRect {
    return {
      ...this.tile(object),
      width: Math.round((object.width ?? 0) / this.size),
      height: Math.round((object.height ?? 0) / this.size),
    };
  }

  person(object: TiledObject): Person {
    if (!object.name) throw new Error(`A "${object.type}" object on the map has no name to use as its id.`);
    return { ...this.tile(object), id: object.name, behavior: stringProp(object, "behavior") };
  }
}

/** Reads every position the town scene uses from the map, so none is written in code. */
export function readTownObjects(map: Phaser.Tilemaps.Tilemap): TownObjects {
  const read = new MapReader(map);
  const gathers: Record<LotId, TilePoint[]> = { house: [], school: [], hall: [], church: [] };
  for (const object of read.all("gather")) gathers[lotProp(object)].push(read.tile(object));
  const vendor = read.one("vendor");
  const spawn = read.one("spawn");
  return {
    view: read.rect(read.one("view")),
    spawn: { ...read.tile(spawn), id: spawn.name },
    guide: read.person(read.one("guide")),
    lots: read.all("lot").map((o) => ({ ...read.rect(o), id: lotProp(o) })),
    leaders: read.all("leader").map((o) => ({ ...read.person(o), lotId: lotProp(o) })),
    villagers: read.all("villager").map((o) => ({ ...read.person(o), lotId: lotProp(o), holds: heldProp(o) })),
    gathers,
    townsfolk: read.all("townsfolk").map((o) => ({ ...read.person(o), roam: numberProp(o, "roam", 0) })),
    vendor: { ...read.person(vendor), holds: heldProp(vendor) },
    route: read
      .all("route")
      .sort((a, b) => numberProp(a, "order") - numberProp(b, "order"))
      .map((o) => read.tile(o)),
    animals: read.all("animal").map((o) => ({ ...read.person(o), kind: stringProp(o, "kind"), roam: numberProp(o, "roam", 0) })),
    ponds: read.all("pond").map((o) => ({ ...read.rect(o), ducks: numberProp(o, "ducks", 0) })),
    meadows: read.all("meadow").map((o) => ({ ...read.rect(o), butterflies: numberProp(o, "butterflies", 0) })),
    flag: read.tile(read.one("flag")),
    chimney: read.tile(read.one("smoke")),
  };
}
