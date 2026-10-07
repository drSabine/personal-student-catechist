/** Moments the scenes and sounds react to. State lives in the stores; these only say "now". */
export type BayanEvent =
  | { type: "start" }
  | { type: "blip" }
  | { type: "pop" }
  | { type: "talk" }
  | { type: "correct" }
  | { type: "wrong" }
  | { type: "stage-complete" }
  | { type: "say"; id: string; text: string }
  | { type: "pet"; id: string }
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
