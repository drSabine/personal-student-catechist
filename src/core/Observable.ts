export type Listener = () => void;

/**
 * Base for classes React watches. Subclasses change state, then call notify().
 * getSnapshot() is stable until the next notify(), which useSyncExternalStore needs.
 */
export abstract class Observable<TSnapshot> {
  private readonly listeners = new Set<Listener>();
  private snapshot: TSnapshot | null = null;

  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  readonly getSnapshot = (): TSnapshot => {
    if (this.snapshot === null) {
      this.snapshot = this.createSnapshot();
    }
    return this.snapshot;
  };

  protected abstract createSnapshot(): TSnapshot;

  protected notify(): void {
    this.snapshot = null;
    for (const listener of this.listeners) {
      listener();
    }
  }
}
