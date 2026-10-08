import type * as Phaser from "phaser";
import type { BayanProgress } from "../../BayanRules";
import type { ProgressStore, UiState, UiStore } from "../../stores";
import { KEY, TILE, type Frames } from "../assets";
import { DEPTH } from "../depth";
import type { TilePoint } from "../mapObjects";
import { headOf, type Cast } from "./Cast";

/** Markers float a little above a head; the arrow above that. */
const LIFT = { marker: 2, arrow: 13 };

/** What a scene wants marked now: who still has something to say, who is done, and where to go next. */
export interface MarkPlan {
  /** Actor id to mark. Anyone left out has no mark. */
  marks: Map<string, "ask" | "done">;
  /** The next place to go: someone by id, or a tile. */
  arrow: { actor: string } | { tile: TilePoint } | null;
}

/**
 * What tells the class where to go: a question mark over whoever is next, a check over those done,
 * a speech mark when the pupil can talk, and a bouncing arrow over the next place to go. Each scene
 * says what to mark through `plan`.
 */
export class Markers {
  private readonly marks = new Map<string, Phaser.GameObjects.Sprite>();
  private readonly arrow: Phaser.GameObjects.Sprite;
  private readonly stops: (() => void)[] = [];
  private current: MarkPlan = { marks: new Map(), arrow: null };
  private bob = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly cast: Cast,
    private readonly frames: Frames,
    private readonly saved: ProgressStore,
    private readonly ui: UiStore,
    private readonly plan: (progress: BayanProgress, ui: UiState) => MarkPlan,
  ) {
    this.arrow = scene.add.sprite(0, 0, KEY.extraFrames, frames.extra("arrow")).setOrigin(0.5, 1).setDepth(DEPTH.arrow);
    this.stops.push(
      saved.subscribe(() => this.refresh()),
      ui.subscribe((state, previous) => {
        if (quiet(state) !== quiet(previous) || state.near !== previous.near) {
          this.refresh();
        }
      }),
    );
    this.refresh();
  }

  /** Called every frame, so markers ride along with anyone who moves. */
  update(time: number): void {
    this.bob = Math.round(Math.sin(time / 220) * 1.5);
    for (const [id, mark] of this.marks) {
      const actor = this.cast.get(id);
      if (actor) place(mark, headOf(actor), LIFT.marker + this.bob);
    }
    const target = this.arrowPoint();
    if (target && this.arrow.visible) place(this.arrow, target, LIFT.arrow + this.bob * 2);
  }

  dispose(): void {
    for (const stop of this.stops) stop();
  }

  private refresh() {
    const ui = this.ui.getState();
    this.current = this.plan(this.saved.getState().progress, ui);
    const still = quiet(ui);
    const ids = new Set([...this.current.marks.keys(), ...(ui.near ? [ui.near.id] : [])]);
    for (const [id, mark] of this.marks) if (!ids.has(id)) mark.setVisible(false);
    for (const id of ids) {
      if (!this.cast.get(id)) continue;
      const mark = this.markFor(id);
      const near = ui.near?.id === id && !still;
      const kind = this.current.marks.get(id);
      mark.setFrame(this.frames.extra(near ? "talk" : kind === "done" ? "done" : "ask"));
      // Done marks stay small; the rest stay big enough to spot from across the room.
      mark.setScale(kind === "done" && !near ? 0.6 : 0.85);
      mark.setVisible(near || kind !== undefined);
    }
    this.arrow.setVisible(!still && this.arrowPoint() !== null);
  }

  private markFor(id: string) {
    let mark = this.marks.get(id);
    if (!mark) {
      mark = this.scene.add.sprite(0, 0, KEY.extraFrames, this.frames.extra("ask")).setOrigin(0.5, 1).setDepth(DEPTH.marker);
      this.marks.set(id, mark);
    }
    return mark;
  }

  private arrowPoint(): { x: number; y: number } | null {
    const arrow = this.current.arrow;
    if (!arrow) return null;
    if ("tile" in arrow) return { x: arrow.tile.x * TILE + TILE / 2, y: arrow.tile.y * TILE };
    const actor = this.cast.get(arrow.actor);
    return actor ? headOf(actor) : null;
  }
}

/** Nothing is marked before the class starts, or while a conversation or a card covers the town. */
function quiet(ui: UiState): boolean {
  return !ui.started || ui.dialog !== null || ui.built !== null || ui.closeUp;
}

function place(sprite: Phaser.GameObjects.Sprite, at: { x: number; y: number }, lift: number) {
  sprite.setPosition(at.x, at.y - lift);
}
