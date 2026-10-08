import type * as Phaser from "phaser";
import { nextLot } from "../../BayanRules";
import type { BayanContent } from "../../content";
import type { Bubble, ProgressStore, UiStore } from "../../stores";
import { headOf, type Cast } from "./Cast";

const BUBBLE_MS = 3400;
const CHECK_EVERY_MS = 5000;
/** How long the class may wander without finding a leader before the guide gives a hint. */
const IDLE_HINT_MS = 40_000;

interface Spoken {
  id: string;
  text: string;
  until: number;
}

/**
 * Speech bubbles over people's heads: a line when the class talks to someone, and a nudge from the
 * guide when the class has not found a leader for a while. Nobody talks on their own otherwise, so
 * the screen stays quiet. Bubbles are drawn by React; this keeps their screen positions current.
 */
export class Chatter {
  private spoken: Spoken[] = [];
  private lastProgressAt = 0;
  private readonly timer: Phaser.Time.TimerEvent;
  private readonly stop: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly cast: Cast,
    private readonly content: BayanContent,
    private readonly saved: ProgressStore,
    private readonly ui: UiStore,
    private readonly toScreen: (x: number, y: number) => { x: number; y: number },
  ) {
    this.lastProgressAt = scene.time.now;
    this.stop = saved.subscribe((state, previous) => {
      if (state.progress !== previous.progress) this.lastProgressAt = scene.time.now;
    });
    this.timer = scene.time.addEvent({ delay: CHECK_EVERY_MS, loop: true, callback: () => this.nudge() });
  }

  say(id: string, text: string, ms = BUBBLE_MS): void {
    this.spoken = [...this.spoken.filter((s) => s.id !== id), { id, text, until: this.scene.time.now + ms }];
  }

  clear(): void {
    this.spoken = [];
  }

  /** Called every frame: drops old bubbles and moves the rest with their speakers. */
  update(): void {
    const now = this.scene.time.now;
    this.spoken = this.spoken.filter((s) => s.until > now);
    const bubbles: Bubble[] = [];
    for (const { id, text } of this.spoken) {
      const actor = this.cast.get(id);
      if (!actor) continue;
      const head = headOf(actor);
      const at = this.toScreen(head.x, head.y);
      bubbles.push({ id, text, x: Math.round(at.x), y: Math.round(at.y) });
    }
    if (!sameBubbles(bubbles, this.ui.getState().bubbles)) this.ui.setState({ bubbles });
  }

  dispose(): void {
    this.stop();
    this.timer.remove();
    this.ui.setState({ bubbles: [] });
  }

  private nudge() {
    const ui = this.ui.getState();
    if (!ui.started || ui.dialog || this.spoken.length > 0) return;
    if (this.scene.time.now - this.lastProgressAt < IDLE_HINT_MS || !nextLot(this.saved.getState().progress)) return;
    this.lastProgressAt = this.scene.time.now;
    const guide = this.cast.ofKind("guide")[0];
    if (guide) this.say(guide.id, pick(this.content.guide.idle));
  }
}

function sameBubbles(a: readonly Bubble[], b: readonly Bubble[]): boolean {
  return a.length === b.length && a.every((x, i) => x.id === b[i].id && x.text === b[i].text && x.x === b[i].x && x.y === b[i].y);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
