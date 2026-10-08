import { Direction, type CharacterData, type GridEngine } from "grid-engine";
import type * as Phaser from "phaser";
import type { LotId } from "../../content";
import { KEY, TILE, type Frames } from "../assets";
import { DEPTH } from "../depth";
import type { TilePoint } from "../mapObjects";

export type ActorKind = "pupil" | "guide" | "leader" | "villager" | "townsfolk" | "vendor" | "animal" | "figure" | "plaque";

/** Someone or something on the map, moved and blocked by grid-engine. */
export interface Actor {
  /** Their id from the map, the same id the lesson content uses. */
  id: string;
  kind: ActorKind;
  /** Their row in the people sheet, or a frame name in the extra sheet. */
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
  /** A figure's or plaque's place in line. */
  index?: number;
  /** The held tool's frame name. */
  holds?: string;
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
  index?: number;
  /** A frame in the extra sheet, drawn already in the hand. */
  holds?: string;
}

/** The pupil collides with leaders, builders, figures, and plaques. Townsfolk and animals step around everyone. */
const GROUPS: Record<ActorKind, string[]> = {
  pupil: ["solid"],
  guide: ["solid", "life"],
  leader: ["solid", "life"],
  villager: ["solid", "life"],
  figure: ["solid", "life"],
  plaque: ["solid", "life"],
  townsfolk: ["life"],
  vendor: ["life"],
  animal: ["life"],
};

/** Drawn from the extra sheet rather than the people sheet. */
const EXTRA_KINDS: readonly ActorKind[] = ["animal", "plaque"];

/** Everyone on the map, by id. */
export class Cast {
  readonly actors = new Map<string, Actor>();
  private readonly data: CharacterData[] = [];
  private turning: { unsubscribe(): void } | null = null;

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
    const extra = EXTRA_KINDS.includes(init.kind);
    const standing = extra ? this.frames.extra(init.look) : this.frames.person(init.look);
    const stepName = `${init.look}-step`;
    const step = extra ? (this.frames.hasExtra(stepName) ? this.frames.extra(stepName) : standing) : standing + 1;
    const sprite = this.scene.add.sprite(0, 0, extra ? KEY.extraFrames : KEY.people, standing).setOrigin(0);
    const container = this.scene.add.container(0, 0, [sprite]);

    // Tools are drawn in place in their own frame, so they sit in the hand at the person's size.
    let held: Phaser.GameObjects.Sprite | undefined;
    if (init.holds) {
      held = this.scene.add.sprite(0, 0, KEY.extraFrames, this.frames.extra(init.holds)).setOrigin(0);
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
      index: init.index,
      holds: init.holds,
      held,
    };
    this.actors.set(actor.id, actor);
    return actor;
  }

  /** Hands everyone to grid-engine. Call once, after adding them all. */
  start(gridEngine: GridEngine, map: Phaser.Tilemaps.Tilemap): void {
    gridEngine.create(map, { characters: this.data });
    // grid-engine numbers every map layer's depth by its order, which would bury anything drawn on the
    // ground and put tree tops under the people. Ground layers go back to the ground; "above" goes on top.
    for (const layer of map.layers) layer.tilemapLayer?.setDepth(layer.name === "above" ? DEPTH.above : DEPTH.ground);
    // Everyone faces the way they walk. The art faces right, so walking left flips it, tool and all.
    this.turning = gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      const actor = this.get(charId);
      if (!actor || (direction !== Direction.LEFT && direction !== Direction.RIGHT)) return;
      const left = direction === Direction.LEFT;
      actor.sprite.setFlipX(left);
      actor.held?.setFlipX(left);
    });
  }

  dispose(): void {
    this.turning?.unsubscribe();
  }
}

/** The top middle of an actor, in world pixels: where markers and speech bubbles sit. */
export function headOf(actor: Actor): { x: number; y: number } {
  return { x: actor.container.x + TILE / 2, y: actor.container.y };
}
