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

export interface Leader extends Person {
  lotId: LotId;
}

export interface Villager extends Person {
  lotId: LotId;
  /** A frame in the extra sheet, drawn already in the hand. */
  holds: string;
}

export interface Townsfolk extends Person {
  /** How far they wander from home, in tiles. */
  roam: number;
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
  vendor: Person & { holds: string };
  /** The vendor's round, in order. */
  route: TilePoint[];
  animals: Townsfolk[];
  /** A flag waves over each of these lots once its building stands. */
  flags: (TilePoint & { lot: LotId })[];
  /** Stage 4's plaques, by index. */
  plaques: (TilePoint & { id: string; index: number })[];
  /** Where the pupil stands to go into the church. */
  door: TilePoint & { id: string };
  /** St. Peter's statue, and the tile at its foot where the pupil stands to read it. */
  statue: TileRect & { id: string };

  /** The road the jeepney drives along, and the tile column where it stops for passengers. */
  lane: TileRect & { stop: number };
}

export interface ChurchObjects {
  /** The room itself; the stone around it fills any spare screen. */
  view: TileRect;
  spawn: TilePoint & { id: string };
  exit: TilePoint & { id: string };
  /** The leaders of the Church, by their place in line. */
  figures: (TilePoint & { id: string; index: number })[];
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

class MapReader {
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
  const door = read.one("door");
  const statue = read.one("statue");
  const lane = read.one("lane");
  return {
    view: read.rect(read.one("view")),
    spawn: { ...read.tile(spawn), id: spawn.name },
    guide: read.person(read.one("guide")),
    lots: read.all("lot").map((o) => ({ ...read.rect(o), id: lotProp(o) })),
    leaders: read.all("leader").map((o) => ({ ...read.person(o), lotId: lotProp(o) })),
    villagers: read.all("villager").map((o) => ({ ...read.person(o), lotId: lotProp(o), holds: stringProp(o, "holds") })),
    gathers,
    townsfolk: read.all("townsfolk").map((o) => ({ ...read.person(o), roam: numberProp(o, "roam", 0) })),
    vendor: { ...read.person(vendor), holds: stringProp(vendor, "holds") },
    route: read
      .all("route")
      .sort((a, b) => numberProp(a, "order") - numberProp(b, "order"))
      .map((o) => read.tile(o)),
    animals: read.all("animal").map((o) => ({ ...read.person(o), roam: numberProp(o, "roam", 0) })),
    flags: read.all("flag").map((o) => ({ ...read.tile(o), lot: lotProp(o) })),
    plaques: read.all("plaque").map((o) => ({ ...read.tile(o), id: o.name, index: numberProp(o, "index") })),
    door: { ...read.tile(door), id: door.name },
    statue: { ...read.rect(statue), id: statue.name },
    lane: { ...read.rect(lane), stop: numberProp(lane, "stop") },
  };
}

export function readChurchObjects(map: Phaser.Tilemaps.Tilemap): ChurchObjects {
  const read = new MapReader(map);
  const spawn = read.one("spawn");
  const exit = read.one("exit");
  return {
    view: read.rect(read.one("view")),
    spawn: { ...read.tile(spawn), id: spawn.name },
    exit: { ...read.tile(exit), id: exit.name },
    figures: read.all("figure").map((o) => ({ ...read.tile(o), id: o.name, index: numberProp(o, "index") })),
  };
}
