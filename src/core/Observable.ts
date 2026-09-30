export type Listener = () => void;

/**
 * Small base for classes that React needs to watch.
 * Subclasses change their state, then call notify().
 * getSnapshot() returns the same object until the next notify(),
 * so it plugs straight into useSyncExternalStore.
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
