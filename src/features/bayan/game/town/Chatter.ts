import type * as Phaser from "phaser";
import { isLotDone, nextLot } from "../../BayanRules";
import type { BayanContent } from "../../content";
import type { Bubble, ProgressStore, UiStore } from "../../stores";
import { headOf, type Cast } from "./Cast";

const BUBBLE_MS = 3400;
const CHATTER_EVERY_MS = 4200;
const MAX_BUBBLES = 2;
/** How long the class may wander without finding a leader before the guide gives a hint. */
const IDLE_HINT_MS = 40_000;

interface Spoken {
  id: string;
  text: string;
  until: number;
}

/**
 * Speech bubbles over people's heads. The town chats by itself now and then, and anyone can be
 * made to say a line. Bubbles are drawn by React; this keeps their screen positions current.
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
    this.timer = scene.time.addEvent({ delay: CHATTER_EVERY_MS, loop: true, callback: () => this.chat() });
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

  private chat() {
    const ui = this.ui.getState();
    if (!ui.started || ui.dialog || this.spoken.length >= MAX_BUBBLES) return;
    const progress = this.saved.getState().progress;

    if (this.scene.time.now - this.lastProgressAt > IDLE_HINT_MS && nextLot(progress)) {
      this.lastProgressAt = this.scene.time.now;
      const guide = this.cast.ofKind("guide")[0];
      if (guide) this.say(guide.id, pick(this.content.guide.idle));
      return;
    }

    const options: { id: string; lines: readonly string[] }[] = [];
    for (const villager of this.cast.ofKind("villager")) {
      if (!villager.lot) continue;
      const lines = this.content.lots[villager.lot].chatter;
      const done = isLotDone(progress, villager.lot) || progress.stage > 1;
      options.push({ id: villager.id, lines: done ? lines.done : lines.waiting });
    }
    for (const folk of [...this.cast.ofKind("townsfolk"), ...this.cast.ofKind("vendor")]) {
      const lines = this.content.townsfolk[folk.id];
      if (lines) options.push({ id: folk.id, lines });
    }
    const free = options.filter((o) => o.lines.length > 0 && !this.spoken.some((s) => s.id === o.id));
    if (free.length === 0) return;
    const choice = pick(free);
    this.say(choice.id, pick(choice.lines));
  }
}

function sameBubbles(a: readonly Bubble[], b: readonly Bubble[]): boolean {
  return a.length === b.length && a.every((x, i) => x.id === b[i].id && x.text === b[i].text && x.x === b[i].x && x.y === b[i].y);
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
