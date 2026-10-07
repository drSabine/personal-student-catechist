import { allLeadersFound, answer, currentQuestion, initialProgress, isLotDone, type BayanProgress } from "./BayanRules";
import type { BayanContent, Line, LotId } from "./content";
import type { EventBus } from "./events";
import type { Beat, Near, ProgressStore, UiStore } from "./stores";

/** Time for a building to rise and the town to cheer before the closing begins. */
export const CELEBRATION_MS = 3200;

/** What happens when a conversation ends. */
type Ending = "none" | "opening" | "lot" | "closing";

const say = (line: Line): Beat => ({ kind: "say", ...line });

/**
 * Runs the story: the opening, talking to leaders, questions, and the closing. Plain TypeScript,
 * so it is tested without a browser. React calls it; Phaser hears about it through the bus.
 */
export class Director {
  private ending: Ending = "none";
  private closingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly content: BayanContent,
    private readonly saved: ProgressStore,
    private readonly ui: UiStore,
    private readonly bus: EventBus,
  ) {}

  private get progress(): BayanProgress {
    return this.saved.getState().progress;
  }

  /** The class pressed Start: play the opening the first time, or pick up where they left off. */
  start(): void {
    this.ui.setState({ started: true });
    this.bus.emit({ type: "start" });
    if (!this.progress.openingSeen) this.playOpening();
    else this.maybeClose();
  }

  playOpening(): void {
    const speaker = this.content.guide.id;
    this.open(
      this.content.guide.opening.map((text) => say({ speaker, text })),
      "opening",
    );
  }

  interact(near: Near): void {
    switch (near.kind) {
      case "leader":
        return this.talkToLeader(near.lot);
      case "guide":
        return this.talkToGuide();
      case "townsfolk": {
        // Builders also talk about their lot: waiting for a leader, or proud of what they built.
        const lot = near.lot ? this.content.lots[near.lot].chatter : null;
        const mood = near.lot && (isLotDone(this.progress, near.lot) || this.progress.stage > 1) ? lot?.done : lot?.waiting;
        const lines = [...(this.content.townsfolk[near.id] ?? []), ...(mood ?? [])];
        if (lines.length > 0) this.bus.emit({ type: "say", id: near.id, text: pick(lines) });
        return;
      }
      case "animal":
        return this.bus.emit({ type: "pet", id: near.id });
    }
  }

  /** Moves to the next beat, or ends the conversation after the last one. */
  next(): void {
    const dialog = this.ui.getState().dialog;
    if (!dialog) return;
    const beat = dialog.beats[dialog.index];
    // A question only moves on once it is answered.
    if (beat.kind === "ask" && dialog.solved === null) return;
    if (dialog.index + 1 < dialog.beats.length) {
      this.ui.setState({ dialog: { ...dialog, index: dialog.index + 1, tried: [], hint: null, solved: null } });
      this.bus.emit({ type: "blip" });
    } else {
      this.finish();
    }
  }

  choose(choice: number): void {
    const dialog = this.ui.getState().dialog;
    const beat = dialog?.beats[dialog.index];
    if (!dialog || beat?.kind !== "ask" || dialog.solved !== null || dialog.tried.includes(choice)) return;
    const question = this.content.lots[beat.lot].questions[beat.question];

    const result = answer(this.progress, beat.lot, choice, this.content);
    if (!result.correct) {
      this.ui.setState({ dialog: { ...dialog, tried: [...dialog.tried, choice], hint: question.hint } });
      this.bus.emit({ type: "wrong" });
      return;
    }
    this.setProgress(result.progress);
    const follow: Beat[] = [say(question.praise)];
    if (result.lotDone) {
      follow.push(...this.content.lots[beat.lot].script.done.map(say));
      this.ending = "lot";
    } else {
      follow.push({ kind: "ask", lot: beat.lot, question: beat.question + 1 });
    }
    this.ui.setState({
      dialog: { ...dialog, beats: [...dialog.beats.slice(0, dialog.index + 1), ...follow], hint: null, solved: choice },
    });
    this.bus.emit({ type: "correct" });
  }

  /** Back to an empty town and the opening. Asked for twice by the teacher panel first. */
  reset(): void {
    this.clearClosing();
    this.ending = "none";
    this.saved.setState({ progress: initialProgress() });
    this.ui.setState({ dialog: null, bubbles: [] });
    this.bus.emit({ type: "reset" });
    if (this.ui.getState().started) this.playOpening();
  }

  dispose(): void {
    this.clearClosing();
  }

  private talkToLeader(lot: LotId) {
    const progress = this.progress;
    const script = this.content.lots[lot].script;
    this.bus.emit({ type: "talk" });
    if (!currentQuestion(progress, lot, this.content)) {
      this.open(script.thanks.map(say), "none");
      return;
    }
    const opening = progress.answered[lot] === 0 ? script.greet : script.resume;
    this.open([...opening.map(say), { kind: "ask", lot, question: progress.answered[lot] }], "none");
  }

  private talkToGuide() {
    const speaker = this.content.guide.id;
    const progress = this.progress;
    this.bus.emit({ type: "talk" });
    const text = allLeadersFound(progress)
      ? this.content.guide.allFound[0]
      : this.content.stages[progress.stage - 1].instructions;
    this.open([say({ speaker, text })], "none");
  }

  private open(beats: Beat[], ending: Ending) {
    this.ending = ending;
    this.ui.setState({ dialog: { beats, index: 0, tried: [], hint: null, solved: null } });
  }

  private finish() {
    const ending = this.ending;
    this.ending = "none";
    this.ui.setState({ dialog: null });
    if (ending === "opening") this.setProgress({ ...this.progress, openingSeen: true });
    // The scene sees the new progress once the conversation closes, and raises the building.
    if (ending === "lot") this.maybeClose(CELEBRATION_MS);
    if (ending === "closing") {
      this.setProgress({ ...this.progress, closingSeen: true });
      this.bus.emit({ type: "stage-complete" });
    }
  }

  /** Once all four leaders are found, the guide closes Stage 1 with the closing card. */
  private maybeClose(delay = 0) {
    const progress = this.progress;
    if (progress.stage !== 1 || progress.closingSeen || !allLeadersFound(progress)) return;
    this.clearClosing();
    this.closingTimer = setTimeout(() => {
      this.closingTimer = null;
      const speaker = this.content.guide.id;
      this.open(
        [...this.content.guide.allFound.map((text) => say({ speaker, text })), { kind: "card", card: this.content.closing }],
        "closing",
      );
    }, delay);
  }

  private clearClosing() {
    if (this.closingTimer) clearTimeout(this.closingTimer);
    this.closingTimer = null;
  }

  private setProgress(progress: BayanProgress) {
    this.saved.setState({ progress });
  }
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
