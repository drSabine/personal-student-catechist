import type { LotId } from "./content";

/** Moments the scenes and sounds react to. State lives in the stores; these only say "now". */
export type BayanEvent =
  | { type: "start" }
  | { type: "blip" }
  | { type: "pop" }
  | { type: "talk" }
  | { type: "correct" }
  | { type: "wrong" }
  | { type: "stage-complete"; stage: number }
  /** A building finished rising on screen. */
  | { type: "built"; lot: LotId }
  /** Stage 2: a part of the church lights up in the close-up. */
  | { type: "reveal" }
  | { type: "say"; id: string; text: string }
  /** The save was replaced by a jump or reset: the pupil goes back to the start. */
  | { type: "reset" };

type Handler = (event: BayanEvent) => void;

/** The one small bus between React and Phaser. */
export class EventBus {
  private readonly handlers = new Set<Handler>();

  on(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emit(event: BayanEvent): void {
    for (const handler of this.handlers) handler(event);
  }
}
