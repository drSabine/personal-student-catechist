import type * as Phaser from "phaser";
import { isLotDone, nextLot } from "../../BayanRules";
import type { ProgressStore, UiStore } from "../../stores";
import { KEY, type Frames } from "../assets";
import { headOf, type Actor, type Cast } from "./Cast";

const DEPTH = { marker: 52, arrow: 53 };
/** Markers float a little above a head; the arrow above that. */
const LIFT = { marker: 2, arrow: 13 };

/**
 * What tells the class where to go: a question mark over leaders still to be found, a check over
 * found ones, an exclamation when the pupil can talk, and a bouncing arrow over the next leader.
 */
export class Markers {
  private readonly marks = new Map<string, Phaser.GameObjects.Sprite>();
  private readonly arrow: Phaser.GameObjects.Sprite;
  private readonly stops: (() => void)[] = [];
  private bob = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly cast: Cast,
    private readonly frames: Frames,
    private readonly saved: ProgressStore,
    private readonly ui: UiStore,
  ) {
    for (const leader of cast.ofKind("leader")) {
      this.marks.set(leader.id, scene.add.sprite(0, 0, KEY.extraFrames, frames.extra("ask")).setOrigin(0.5, 1).setDepth(DEPTH.marker));
    }
    this.arrow = scene.add.sprite(0, 0, KEY.extraFrames, frames.extra("arrow")).setOrigin(0.5, 1).setDepth(DEPTH.arrow);
    this.stops.push(
      saved.subscribe(() => this.refresh()),
      ui.subscribe((state, previous) => {
        if (state.near !== previous.near || state.dialog !== previous.dialog || state.started !== previous.started) this.refresh();
      }),
    );
    this.refresh();
  }

  /** Called every frame, so markers ride along with anyone who moves. */
  update(time: number): void {
    this.bob = Math.round(Math.sin(time / 220) * 1.5);
    for (const [id, mark] of this.marks) {
      const actor = this.cast.get(id);
      if (actor) place(mark, actor, LIFT.marker + this.bob);
    }
    const target = this.arrowTarget();
    if (target && this.arrow.visible) place(this.arrow, target, LIFT.arrow + this.bob * 2);
  }

  dispose(): void {
    for (const stop of this.stops) stop();
  }

  private refresh() {
    const progress = this.saved.getState().progress;
    const ui = this.ui.getState();
    for (const [id, mark] of this.marks) {
      const leader = this.cast.get(id);
      if (!leader?.lot) continue;
      const done = isLotDone(progress, leader.lot);
      const near = ui.near?.id === id && !ui.dialog;
      mark.setFrame(this.frames.extra(near ? "talk" : done ? "done" : "ask"));
      // Found leaders keep a small check; the rest stay big enough to spot from across the room.
      mark.setScale(done && !near ? 0.6 : 0.85);
      mark.setVisible(progress.stage === 1 || near);
    }
    this.arrow.setVisible(ui.started && !ui.dialog && this.arrowTarget() !== null);
  }

  private arrowTarget(): Actor | null {
    const lot = nextLot(this.saved.getState().progress);
    if (!lot) return null;
    return this.cast.ofKind("leader").find((leader) => leader.lot === lot) ?? null;
  }
}

function place(sprite: Phaser.GameObjects.Sprite, actor: Actor, lift: number) {
  const head = headOf(actor);
  sprite.setPosition(head.x, head.y - lift);
}
