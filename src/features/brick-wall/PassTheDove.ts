import { Observable } from "@/core/Observable";

export type PassPhase = "stopped" | "passing";

/**
 * Follows the music played in class while pupils pass the paper dove.
 * Play: the dove is passing and the brick waits.
 * Stop: whoever holds the dove may place the brick.
 */
export class PassTheDove extends Observable<PassPhase> {
  private phase: PassPhase = "stopped";

  get isPassing(): boolean {
    return this.phase === "passing";
  }

  play(): void {
    this.setPhase("passing");
  }

  stop(): void {
    this.setPhase("stopped");
  }

  toggle(): void {
    this.setPhase(this.isPassing ? "stopped" : "passing");
  }

  private setPhase(next: PassPhase): void {
    if (next === this.phase) return;
    this.phase = next;
    this.notify();
  }

  protected createSnapshot(): PassPhase {
    return this.phase;
  }
}
