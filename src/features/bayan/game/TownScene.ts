import { Direction, NoPathFoundStrategy, type GridEngine, type Position } from "grid-engine";
import * as Phaser from "phaser";
import { isLocked, type Near } from "../stores";
import { Frames, KEY, preloadTown, TILE } from "./assets";
import { planCamera } from "./camera";
import type { GameDeps } from "./createGame";
import { readTownObjects } from "./mapObjects";
import { SoundBoard } from "./SoundBoard";
import { Ambience } from "./town/Ambience";
import { Behaviors } from "./town/Behaviors";
import { Cast, type Actor } from "./town/Cast";
import { Chatter } from "./town/Chatter";
import { Construction } from "./town/Construction";
import { Markers } from "./town/Markers";

const PLAYER = "pupil";
const BUILDINGS = "buildings/";
/** Layers drawn over the people, such as tree tops. */
const ABOVE = "above";
const DEPTH = { ground: 0, above: 50, people: 10 };

type Keys = Record<"up" | "down" | "left" | "right" | "w" | "a" | "s" | "d", Phaser.Input.Keyboard.Key>;

/**
 * The town. It draws what the stores hold and moves the pupil. The story lives in the Director,
 * which this scene calls when the pupil taps someone; React shows every word.
 */
export class TownScene extends Phaser.Scene {
  // Set by the plugin's scene mapping in createGame.
  declare private readonly gridEngine: GridEngine;
  private keys?: Keys;
  private cast!: Cast;
  private chatter!: Chatter;
  private markers!: Markers;
  private ambience!: Ambience;
  private world = { width: 0, height: 0 };
  /** The town itself, in tiles. The camera frames it; the forest around fills the rest of the screen. */
  private view = { x: 0, y: 0, width: 0, height: 0 };
  /** Someone the pupil is walking over to talk to. */
  private heading: string | null = null;
  /** Walking to a tapped tile; a key press takes over. */
  private tapWalking = false;
  private readonly cleanups: (() => void)[] = [];

  constructor(private readonly deps: GameDeps) {
    super("town");
  }

  preload() {
    preloadTown(this, this.deps.assets);
  }

  create() {
    const { session, content } = this.deps;
    const frames = new Frames(this);
    const map = this.make.tilemap({ key: KEY.townMap });
    this.world = { width: map.widthInPixels, height: map.heightInPixels };
    const tilesets = [map.addTilesetImage("town", KEY.tilesTown), map.addTilesetImage("extra", KEY.tilesExtra)].filter(
      (tileset): tileset is Phaser.Tilemaps.Tileset => tileset !== null,
    );
    const buildingLayers = new Map<string, Phaser.Tilemaps.TilemapLayer>();
    for (const data of map.layers) {
      const layer = map.createLayer(data.name, tilesets);
      if (!layer) continue;
      layer.setDepth(data.name === ABOVE ? DEPTH.above : DEPTH.ground);
      if (data.name === "collisions") layer.setVisible(false);
      else if (data.name.startsWith(BUILDINGS)) buildingLayers.set(data.name.slice(BUILDINGS.length), layer);
    }

    const objects = readTownObjects(map);
    this.view = objects.view;
    const cast = new Cast(this, frames);
    this.cast = cast;
    // Who each person is comes from the lesson; where they stand and how they move, from the map.
    const look = (id: string) => {
      const person = content.people[id];
      if (!person) throw new Error(`The map has "${id}", but the lesson does not say who that is.`);
      return person.sprite;
    };
    cast.add({ id: PLAYER, kind: "pupil", look: look(objects.spawn.id), at: objects.spawn });
    const { guide, vendor } = objects;
    cast.add({ id: guide.id, kind: "guide", look: look(guide.id), at: guide, behavior: guide.behavior });
    for (const l of objects.leaders) cast.add({ id: l.id, kind: "leader", look: look(l.id), at: l, behavior: l.behavior, lot: l.lotId });
    for (const v of objects.villagers) {
      cast.add({ id: v.id, kind: "villager", look: look(v.id), at: v, behavior: v.behavior, lot: v.lotId, holds: v.holds });
    }
    for (const f of objects.townsfolk) cast.add({ id: f.id, kind: "townsfolk", look: look(f.id), at: f, behavior: f.behavior, roam: f.roam });
    cast.add({ id: vendor.id, kind: "vendor", look: look(vendor.id), at: vendor, behavior: vendor.behavior, holds: vendor.holds });
    for (const a of objects.animals) cast.add({ id: a.id, kind: "animal", look: a.kind, at: a, behavior: a.behavior, roam: a.roam });
    cast.start(this.gridEngine, map);

    const arrivals = this.gridEngine.positionChangeFinished().subscribe(({ charId }) => {
      if (charId === PLAYER) this.arrive();
    });

    const sounds = new SoundBoard(this, session.saved, session.ui, session.bus);
    this.chatter = new Chatter(this, cast, content, session.saved, session.ui, (x, y) => this.toScreen(x, y));
    this.markers = new Markers(this, cast, frames, session.saved, session.ui);
    this.ambience = new Ambience(this, this.gridEngine, cast, objects, frames, sounds, this.deps.palette, this.world);
    const behaviors = new Behaviors(this, this.gridEngine, cast, objects.route);
    behaviors.start();
    const construction = new Construction(
      this,
      this.gridEngine,
      buildingLayers,
      objects,
      cast,
      behaviors,
      frames,
      sounds,
      this.chatter,
      content,
      session.saved,
      session.ui,
      this.deps.palette,
    );

    const offBus = session.bus.on((event) => {
      if (event.type === "say") this.chatter.say(event.id, event.text);
      if (event.type === "pet") this.ambience.pet(event.id);
      if (event.type === "reset") this.backToStart(objects.spawn);
    });
    const offUi = session.ui.subscribe((state, previous) => {
      if (state.dialog && !previous.dialog) this.stopPlayer();
    });

    const keyboard = this.input.keyboard;
    if (keyboard) {
      const codes = Phaser.Input.Keyboard.KeyCodes;
      // No key capture, so typing in React still works.
      this.keys = keyboard.addKeys(
        { up: codes.UP, down: codes.DOWN, left: codes.LEFT, right: codes.RIGHT, w: codes.W, a: codes.A, s: codes.S, d: codes.D },
        false,
      ) as Keys;
    }
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.tap, this);

    this.fitCamera();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.fitCamera, this);

    this.cleanups.push(
      () => arrivals.unsubscribe(),
      () => behaviors.dispose(),
      offBus,
      offUi,
      () => sounds.dispose(),
      () => this.chatter.dispose(),
      () => this.markers.dispose(),
      () => this.ambience.dispose(),
      () => construction.dispose(),
      () => this.scale.off(Phaser.Scale.Events.RESIZE, this.fitCamera, this),
    );
    const leave = () => {
      for (const cleanup of this.cleanups.splice(0)) cleanup();
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, leave);
    this.events.once(Phaser.Scenes.Events.DESTROY, leave);
  }

  update(time: number) {
    if (!this.cast) return;
    // People lower on the map are drawn in front.
    for (const actor of this.cast.actors.values()) actor.container.setDepth(DEPTH.people + actor.container.y / 1000);
    this.markers.update(time);
    this.chatter.update();
    this.updateNear();

    if (isLocked(this.deps.session.ui.getState()) || !this.keys) return;
    const direction = heldDirection(this.keys);
    if (direction === Direction.NONE) return;
    if (this.tapWalking) this.stopPlayer();
    this.gridEngine.move(PLAYER, direction);
  }

  private player(): Actor {
    const player = this.cast.get(PLAYER);
    if (!player) throw new Error("The pupil is missing.");
    return player;
  }

  /** A tap walks the pupil there. Tapping someone walks over and talks to them. */
  private tap(pointer: Phaser.Input.Pointer) {
    const ui = this.deps.session.ui.getState();
    if (isLocked(ui)) return;
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const duck = this.ambience.duckAt(world.x, world.y);
    if (duck) {
      this.ambience.quack(duck);
      return;
    }
    const tile = { x: Math.floor(world.x / TILE), y: Math.floor(world.y / TILE) };
    if (tile.x < 0 || tile.y < 0 || world.x >= this.world.width || world.y >= this.world.height) return;

    const someone = this.gridEngine.getCharactersAt(tile).find((id) => id !== PLAYER && this.nearOf(id));
    if (someone && isNextTo(this.gridEngine.getPosition(PLAYER), this.gridEngine.getPosition(someone))) {
      this.talkTo(someone);
      return;
    }
    this.heading = someone ?? null;
    this.tapWalking = true;
    this.gridEngine
      .moveTo(PLAYER, tile, { noPathFoundStrategy: NoPathFoundStrategy.CLOSEST_REACHABLE })
      .subscribe({
        complete: () => {
          this.tapWalking = false;
          this.arrive();
        },
      });
  }

  /** At the end of a walk, talk to whoever the pupil was heading for. */
  private arrive() {
    const target = this.heading;
    if (!target || this.gridEngine.isMoving(PLAYER)) return;
    if (isNextTo(this.gridEngine.getPosition(PLAYER), this.gridEngine.getPosition(target))) {
      this.heading = null;
      this.talkTo(target);
    }
  }

  private talkTo(id: string) {
    const near = this.nearOf(id);
    if (!near || isLocked(this.deps.session.ui.getState())) return;
    this.deps.session.director.interact(near);
  }

  /** Who the pupil could talk to now: the one they face first, then anyone beside them. */
  private updateNear() {
    const ui = this.deps.session.ui;
    const here = this.gridEngine.getPosition(PLAYER);
    const facing = this.gridEngine.getFacingPosition(PLAYER);
    let best: Near | null = null;
    for (const id of this.cast.actors.keys()) {
      if (id === PLAYER) continue;
      const at = this.gridEngine.getPosition(id);
      if (!isNextTo(here, at)) continue;
      const near = this.nearOf(id);
      if (!near) continue;
      const faced = at.x === facing.x && at.y === facing.y;
      // The dog keeps close, so animals only count when the pupil turns to them.
      if (near.kind === "animal" && !faced) continue;
      if (faced) {
        best = near;
        break;
      }
      if (!best || rank(near) < rank(best)) best = near;
    }
    if (best?.id !== ui.getState().near?.id) ui.setState({ near: best });
  }

  private nearOf(id: string): Near | null {
    const actor = this.cast.get(id);
    if (!actor) return null;
    switch (actor.kind) {
      case "leader":
        return actor.lot ? { kind: "leader", id, lot: actor.lot } : null;
      case "guide":
        return { kind: "guide", id };
      case "townsfolk":
      case "vendor":
      case "villager":
        return { kind: "townsfolk", id, lot: actor.lot };
      case "animal":
        return { kind: "animal", id };
      default:
        return null;
    }
  }

  private stopPlayer() {
    this.heading = null;
    this.tapWalking = false;
    this.gridEngine.stopMovement(PLAYER);
  }

  private backToStart(spawn: Position) {
    this.stopPlayer();
    this.gridEngine.setPosition(PLAYER, spawn);
    this.chatter.clear();
  }

  /** World pixels to CSS pixels inside the game's box, for React to place speech bubbles. */
  private toScreen(x: number, y: number) {
    const camera = this.cameras.main;
    const ratio = window.devicePixelRatio || 1;
    return {
      x: ((x - camera.worldView.x) * camera.zoom) / ratio,
      y: ((y - camera.worldView.y) * camera.zoom) / ratio,
    };
  }

  private fitCamera() {
    const camera = this.cameras.main;
    const focus = { width: this.view.width * TILE, height: this.view.height * TILE };
    const plan = planCamera(
      { width: this.scale.width, height: this.scale.height },
      focus,
      TILE,
      window.devicePixelRatio || 1,
      this.deps.minTile,
    );
    camera.setZoom(plan.zoom);
    camera.setBounds(0, 0, this.world.width, this.world.height);
    if (plan.follow) {
      camera.startFollow(this.player().container, true);
    } else {
      // The whole town in view; the forest around it fills whatever space the screen has left.
      camera.stopFollow();
      camera.centerOn((this.view.x + this.view.width / 2) * TILE, (this.view.y + this.view.height / 2) * TILE);
    }
  }
}

function heldDirection(keys: Keys): Direction {
  const pressed = (...pair: Phaser.Input.Keyboard.Key[]) =>
    pair.some((key) => key.isDown) || pair.map((key) => Phaser.Input.Keyboard.JustDown(key)).some(Boolean);
  if (pressed(keys.left, keys.a)) return Direction.LEFT;
  if (pressed(keys.right, keys.d)) return Direction.RIGHT;
  if (pressed(keys.up, keys.w)) return Direction.UP;
  if (pressed(keys.down, keys.s)) return Direction.DOWN;
  return Direction.NONE;
}

function isNextTo(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

/** Leaders come first when several are beside the pupil. */
function rank(near: Near): number {
  return { leader: 0, guide: 1, townsfolk: 2, animal: 3 }[near.kind];
}
