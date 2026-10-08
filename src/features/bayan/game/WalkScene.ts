import { Direction, NoPathFoundStrategy, type GridEngine, type Position } from "grid-engine";
import * as Phaser from "phaser";
import { isLocked, type Near } from "../stores";
import { Frames, TILE } from "./assets";
import { planCamera, type Size } from "./camera";
import type { GameDeps } from "./createGame";
import { standingDepth } from "./depth";
import type { TilePoint, TileRect } from "./mapObjects";
import { Cast, type Actor } from "./town/Cast";
import type { Spotlight } from "./town/Construction";
import { Cursor } from "./town/Cursor";

export const PLAYER = "pupil";
const PAN_MS = 700;

type Keys = Record<"up" | "down" | "left" | "right" | "w" | "a" | "s" | "d", Phaser.Input.Keyboard.Key>;

/** The pupil walks in four directions only. */
type Walk = Direction.LEFT | Direction.RIGHT | Direction.UP | Direction.DOWN;

const STEP: Record<Walk, TilePoint> = {
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
  [Direction.UP]: { x: 0, y: -1 },
  [Direction.DOWN]: { x: 0, y: 1 },
};

/**
 * A place the pupil walks around: the town or the church. It moves the pupil by keys or taps, shows
 * where they cannot go, frames the camera, and keeps track of who they could talk to. The story lives
 * in the Director, which this calls when the pupil talks to someone; React shows every word.
 */
export abstract class WalkScene extends Phaser.Scene implements Spotlight {
  // Set by the plugin's scene mapping in createGame.
  declare protected readonly gridEngine: GridEngine;
  protected cast!: Cast;
  protected frames!: Frames;
  protected world: Size = { width: 0, height: 0 };
  /** The part of the map the camera frames. */
  protected view: TileRect = { x: 0, y: 0, width: 0, height: 0 };
  protected readonly cleanups: (() => void)[] = [];
  private cursor!: Cursor;
  private keys?: Keys;
  /** Someone the pupil is walking over to talk to, or a spot such as a door. */
  private heading: { id: string; spot: Near | null } | null = null;
  /** Walking to a tapped tile; a key press takes over. */
  private tapWalking = false;
  /** A building moment has the camera. */
  private spotlit = false;

  constructor(
    key: string,
    protected readonly deps: GameDeps,
  ) {
    super(key);
  }

  /** What an actor is to the story, or null when there is nothing to say to them. */
  protected abstract nearOf(id: string): Near | null;
  /** A spot the pupil uses by standing on it, such as a door. */
  protected abstract spotAt(tile: TilePoint): Near | null;

  /** Call once at the end of a subclass's create(), after the cast has started. */
  protected startWalking() {
    this.cursor = new Cursor(this, this.deps.palette);
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
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.point, this);
    this.input.on(Phaser.Input.Events.GAME_OUT, () => this.cursor.show(null, false));

    const arrivals = this.gridEngine.positionChangeFinished().subscribe(({ charId }) => {
      if (charId === PLAYER) this.arrive();
    });
    const offUi = this.deps.session.ui.subscribe((state, previous) => {
      if (isLocked(state) && !isLocked(previous)) {
        this.stopPlayer();
        this.cursor.show(null, false);
      }
    });

    const fit = () => this.fitCamera();
    fit();
    this.scale.on(Phaser.Scale.Events.RESIZE, fit);
    this.cleanups.push(
      () => arrivals.unsubscribe(),
      offUi,
      () => this.cast.dispose(),
      () => this.scale.off(Phaser.Scale.Events.RESIZE, fit),
    );
    const leave = () => {
      for (const cleanup of this.cleanups.splice(0)) cleanup();
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, leave);
    this.events.once(Phaser.Scenes.Events.DESTROY, leave);
  }

  /** Call from the subclass's update(): sorts people by depth, finds who is near, and moves the pupil. */
  protected walk() {
    // People lower on the map are drawn in front.
    for (const actor of this.cast.actors.values()) actor.container.setDepth(standingDepth(actor.container.y + TILE));
    this.updateNear();

    if (isLocked(this.deps.session.ui.getState()) || !this.keys || typing()) return;
    const direction = heldDirection(this.keys);
    if (!direction) return;
    if (this.tapWalking) this.stopPlayer();
    if (!this.gridEngine.isMoving(PLAYER)) {
      const here = this.gridEngine.getPosition(PLAYER);
      const step = STEP[direction];
      const next = { x: here.x + step.x, y: here.y + step.y };
      if (this.gridEngine.isBlocked(next, undefined, ["solid"])) this.cursor.bump(next);
    }
    this.gridEngine.move(PLAYER, direction);
  }

  look(x: number, y: number): void {
    this.spotlit = true;
    const camera = this.cameras.main;
    camera.stopFollow();
    camera.pan(x, y, PAN_MS, "Sine.easeInOut", true);
  }

  /** Pans back to where the camera belongs, then frames it as usual. */
  back(): void {
    const plan = this.plan();
    const player = this.player().container;
    const x = plan.follow ? player.x + TILE / 2 : (this.view.x + this.view.width / 2) * TILE;
    const y = plan.follow ? player.y + TILE / 2 : (this.view.y + this.view.height / 2) * TILE;
    this.cameras.main.pan(x, y, PAN_MS, "Sine.easeInOut", true, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress < 1) return;
      this.spotlit = false;
      this.fitCamera();
    });
  }

  protected player(): Actor {
    const player = this.cast.get(PLAYER);
    if (!player) throw new Error("The pupil is missing.");
    return player;
  }

  protected stopPlayer() {
    this.heading = null;
    this.tapWalking = false;
    this.gridEngine.stopMovement(PLAYER);
  }

  /** World pixels to CSS pixels inside the game's box, for React to place speech bubbles and banners. */
  protected toScreen(x: number, y: number) {
    const camera = this.cameras.main;
    const ratio = window.devicePixelRatio || 1;
    return {
      x: ((x - camera.worldView.x) * camera.zoom) / ratio,
      y: ((y - camera.worldView.y) * camera.zoom) / ratio,
    };
  }

  /** With a mouse, outline the tile under the pointer. */
  private point(pointer: Phaser.Input.Pointer) {
    if (pointer.wasTouch || isLocked(this.deps.session.ui.getState())) return this.cursor.show(null, false);
    const tile = this.tileAt(pointer);
    if (!tile) return this.cursor.show(null, false);
    this.cursor.show(tile, this.gridEngine.isTileBlocked(tile));
  }

  /** A tap walks the pupil there. Tapping someone walks over and talks to them; a blocked tile shows an X. */
  private tap(pointer: Phaser.Input.Pointer) {
    if (isLocked(this.deps.session.ui.getState())) return;
    const tile = this.tileAt(pointer);
    if (!tile) return;

    const someone = this.gridEngine.getCharactersAt(tile).find((id) => id !== PLAYER && this.nearOf(id));
    if (someone && isNextTo(this.gridEngine.getPosition(PLAYER), this.gridEngine.getPosition(someone))) {
      this.talkTo(someone);
      return;
    }
    const spot = someone ? null : this.spotAt(tile);
    if (!someone && !spot && this.gridEngine.isTileBlocked(tile)) {
      this.cursor.bump(tile);
      return;
    }
    this.heading = someone ? { id: someone, spot: null } : spot ? { id: spot.id, spot } : null;
    this.tapWalking = true;
    this.gridEngine.moveTo(PLAYER, tile, { noPathFoundStrategy: NoPathFoundStrategy.CLOSEST_REACHABLE }).subscribe({
      complete: () => {
        this.tapWalking = false;
        this.arrive();
      },
    });
  }

  private tileAt(pointer: Phaser.Input.Pointer): TilePoint | null {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    if (world.x < 0 || world.y < 0 || world.x >= this.world.width || world.y >= this.world.height) return null;
    return { x: Math.floor(world.x / TILE), y: Math.floor(world.y / TILE) };
  }

  /** At the end of a walk, talk to whoever the pupil was heading for, or use the spot they reached. */
  private arrive() {
    const target = this.heading;
    if (!target || this.gridEngine.isMoving(PLAYER)) return;
    const here = this.gridEngine.getPosition(PLAYER);
    if (target.spot) {
      const spot = this.spotAt(here);
      this.heading = null;
      if (spot?.id === target.id) this.use(spot);
      return;
    }
    if (isNextTo(here, this.gridEngine.getPosition(target.id))) {
      this.heading = null;
      this.talkTo(target.id);
    }
  }

  private talkTo(id: string) {
    const near = this.nearOf(id);
    if (near) this.use(near);
  }

  private use(near: Near) {
    if (isLocked(this.deps.session.ui.getState())) return;
    this.deps.session.director.interact(near);
  }

  /** Who the pupil could talk to now: a spot they stand on, the one they face, then anyone beside them. */
  private updateNear() {
    const ui = this.deps.session.ui;
    const here = this.gridEngine.getPosition(PLAYER);
    const facing = this.gridEngine.getFacingPosition(PLAYER);
    let best: Near | null = this.gridEngine.isMoving(PLAYER) ? null : this.spotAt(here);
    if (!best) {
      for (const id of this.cast.actors.keys()) {
        if (id === PLAYER) continue;
        const at = this.gridEngine.getPosition(id);
        if (!isNextTo(here, at)) continue;
        const near = this.nearOf(id);
        if (!near) continue;
        const faced = at.x === facing.x && at.y === facing.y;
        if (faced) {
          best = near;
          break;
        }
        if (!best || rank(near) < rank(best)) best = near;
      }
    }
    if (best?.id !== ui.getState().near?.id) ui.setState({ near: best });
  }

  private fitCamera() {
    if (this.spotlit) return;
    const camera = this.cameras.main;
    const plan = this.plan();
    camera.setZoom(plan.zoom);
    camera.setBounds(0, 0, this.world.width, this.world.height);
    if (plan.follow) {
      camera.startFollow(this.player().container, true);
    } else {
      // The whole view in sight, with the world around it filling whatever space is left.
      camera.stopFollow();
      camera.centerOn((this.view.x + this.view.width / 2) * TILE, (this.view.y + this.view.height / 2) * TILE);
    }
  }

  private plan() {
    return planCamera(
      { width: this.scale.width, height: this.scale.height },
      { width: this.view.width * TILE, height: this.view.height * TILE },
      TILE,
      window.devicePixelRatio || 1,
      this.deps.minTile,
      this.world,
    );
  }
}

/** Keys typed into a field, such as a group's sentence, are words, not steps. */
function typing(): boolean {
  const active = document.activeElement;
  return active instanceof HTMLElement && active.closest("input, textarea, select") !== null;
}

function heldDirection(keys: Keys): Walk | null {
  const pressed = (...pair: Phaser.Input.Keyboard.Key[]) =>
    pair.some((key) => key.isDown) || pair.map((key) => Phaser.Input.Keyboard.JustDown(key)).some(Boolean);
  if (pressed(keys.left, keys.a)) return Direction.LEFT;
  if (pressed(keys.right, keys.d)) return Direction.RIGHT;
  if (pressed(keys.up, keys.w)) return Direction.UP;
  if (pressed(keys.down, keys.s)) return Direction.DOWN;
  return null;
}

function isNextTo(a: Position, b: Position): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

/** Leaders come first when several are beside the pupil. */
function rank(near: Near): number {
  return { leader: 0, figure: 0, plaque: 1, statue: 1, guide: 1, door: 1, exit: 1, townsfolk: 2 }[near.kind];
}
