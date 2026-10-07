import { Direction, type CharacterData, type GridEngine } from "grid-engine";
import type * as Phaser from "phaser";
import type { LotId } from "../../content";
import { KEY, TILE, type Frames } from "../assets";
import type { Held, TilePoint } from "../mapObjects";

export type ActorKind = "pupil" | "guide" | "leader" | "villager" | "townsfolk" | "vendor" | "animal";

/** Someone on the map, moved by grid-engine. */
export interface Actor {
  /** Their id from the map, the same id the lesson content uses. */
  id: string;
  kind: ActorKind;
  /** Their row in the people sheet, or an animal's frame name. */
  look: string;
  behavior: string;
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  /** Where they started on the map. */
  origin: TilePoint;
  /** Where they hang about now. The story can move it, as when builders gather by a finished building. */
  home: TilePoint;
  /** How far they wander from home, in tiles. */
  roam: number;
  lot?: LotId;
  held?: Phaser.GameObjects.Sprite;
}

export interface ActorInit {
  id: string;
  kind: ActorKind;
  look: string;
  at: TilePoint;
  behavior?: string;
  roam?: number;
  lot?: LotId;
  holds?: Held;
}

/** The pupil collides with leaders and builders. Townsfolk and animals step around everyone without blocking the pupil. */
const GROUPS: Record<ActorKind, string[]> = {
  pupil: ["solid"],
  guide: ["solid", "life"],
  leader: ["solid", "life"],
  villager: ["solid", "life"],
  townsfolk: ["life"],
  vendor: ["life"],
  animal: ["life"],
};

/** Carried tools ride small at the hip; a vendor's pole sits across the shoulders at full size. */
const HELD_SCALE = 0.6;
const HELD_OFFSET = { x: 6, y: 3 };
const SHOULDER = 5;

/** Everyone on the map, by id. */
export class Cast {
  readonly actors = new Map<string, Actor>();
  private readonly data: CharacterData[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly frames: Frames,
  ) {}

  get(id: string): Actor | undefined {
    return this.actors.get(id);
  }

  ofKind(kind: ActorKind): Actor[] {
    return [...this.actors.values()].filter((actor) => actor.kind === kind);
  }

  add(init: ActorInit): Actor {
    const animal = init.kind === "animal";
    const standing = animal ? this.frames.extra(init.look) : this.frames.person(init.look);
    const stepName = `${init.look}-step`;
    const step = animal ? (this.frames.hasExtra(stepName) ? this.frames.extra(stepName) : standing) : standing + 1;
    const sprite = this.scene.add.sprite(0, 0, animal ? KEY.extraFrames : KEY.people, standing).setOrigin(0);
    const container = this.scene.add.container(0, 0, [sprite]);

    let held: Phaser.GameObjects.Sprite | undefined;
    if (init.holds) {
      const town = init.holds.sheet === "town";
      const frame = init.holds.sheet === "town" ? init.holds.frame : this.frames.extra(init.holds.frame);
      held = this.scene.add.sprite(0, 0, town ? KEY.townFrames : KEY.extraFrames, frame).setOrigin(0);
      if (town) held.setPosition(HELD_OFFSET.x, HELD_OFFSET.y).setScale(HELD_SCALE);
      else held.setPosition(0, SHOULDER);
      container.add(held);
    }

    const frames = { leftFoot: step, standing, rightFoot: step };
    this.data.push({
      id: init.id,
      sprite,
      container,
      startPosition: { x: init.at.x, y: init.at.y },
      facingDirection: Direction.DOWN,
      collides: { collisionGroups: GROUPS[init.kind] },
      walkingAnimationMapping: {
        [Direction.UP]: frames,
        [Direction.DOWN]: frames,
        [Direction.LEFT]: frames,
        [Direction.RIGHT]: frames,
      },
    });
    const actor: Actor = {
      id: init.id,
      kind: init.kind,
      look: init.look,
      behavior: init.behavior ?? "still",
      container,
      sprite,
      origin: init.at,
      home: init.at,
      roam: init.roam ?? 0,
      lot: init.lot,
      held,
    };
    this.actors.set(actor.id, actor);
    return actor;
  }

  /** Hands everyone to grid-engine. Call once, after adding them all. */
  start(gridEngine: GridEngine, map: Phaser.Tilemaps.Tilemap): void {
    gridEngine.create(map, { characters: this.data });
  }
}

/** The top middle of an actor, in world pixels: where markers and speech bubbles sit. */
export function headOf(actor: Actor): { x: number; y: number } {
  return { x: actor.container.x + TILE / 2, y: actor.container.y };
}
