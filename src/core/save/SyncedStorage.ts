import { Observable } from "../Observable";
import { readSave, type GameSave, type SaveSlot } from "./GameSave";
import type { SaveRepository } from "./SaveRepository";

/**
 * saved: the server has the latest. saving: on its way. offline: kept on this device and retried.
 * loading: reading the save when the page opens.
 */
export type SaveStatus = "loading" | "saved" | "saving" | "offline";

/** The bits of `localStorage` used, so tests can pass a fake. */
export interface LocalStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SyncedStorageOptions {
  /** Wait this long after a change before sending, so a burst of changes is one request. */
  debounceMs?: number;
  /** Try again this long after a failed send. */
  retryMs?: number;
  now?: () => number;
}

/** Give up on the server's copy at start after this long, and use this device's. */
const LOAD_TIMEOUT_MS = 5000;

/**
 * Saves a game's state on this device at once and on the server soon after, so a refresh,
 * a closed tab, or a different laptop all pick up where the class left off. The newer save wins.
 */
export class SyncedStorage extends Observable<SaveStatus> {
  private status: SaveStatus = "loading";
  private lastSent: string | null = null;
  private pending: GameSave | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly debounceMs: number;
  private readonly retryMs: number;
  private readonly now: () => number;

  constructor(
    private readonly repository: SaveRepository,
    private readonly slot: SaveSlot,
    private readonly local: LocalStore,
    options: SyncedStorageOptions = {},
  ) {
    super();
    this.debounceMs = options.debounceMs ?? 400;
    this.retryMs = options.retryMs ?? 5000;
    this.now = options.now ?? Date.now;
  }

  private get localKey(): string {
    return `save:${this.slot.lessonId}/${this.slot.activityId}`;
  }

  /** The newer of this device's save and the server's. */
  async read(): Promise<string | null> {
    const local = this.readLocal();
    let remote: GameSave | null = null;
    let reached = false;
    try {
      remote = await withTimeout(this.repository.load(this.slot), LOAD_TIMEOUT_MS);
      reached = true;
    } catch {
      // Offline or slow: this device's copy is used, and sent once the server answers.
    }
    if (local && (!remote || local.savedAt > remote.savedAt)) {
      // This device is ahead of the server: send its copy.
      this.lastSent = remote?.state ?? null;
      this.queue(local);
      return local.state;
    }
    if (remote) {
      this.writeLocal(remote);
      this.lastSent = remote.state;
    }
    this.setStatus(reached ? "saved" : "offline");
    return remote?.state ?? null;
  }

  write(state: string): void {
    if (state === this.lastSent && this.pending === null) return;
    const save = { state, savedAt: this.now() };
    this.writeLocal(save);
    this.queue(save);
  }

  remove(): void {
    this.local.removeItem(this.localKey);
  }

  /** Sends anything waiting right away. Used when the page is closing. */
  flush(): void {
    if (!this.pending) return;
    const save = this.pending;
    this.clearTimer();
    void this.repository.save(this.slot, save, { keepalive: true }).catch(() => undefined);
  }

  protected createSnapshot(): SaveStatus {
    return this.status;
  }

  private queue(save: GameSave) {
    this.pending = save;
    this.setStatus("saving");
    this.clearTimer();
    this.timer = setTimeout(() => void this.send(), this.debounceMs);
  }

  private async send() {
    this.timer = null;
    const save = this.pending;
    if (!save) return;
    try {
      await this.repository.save(this.slot, save);
      this.lastSent = save.state;
      // A newer change may have arrived while this one was on its way.
      if (this.pending === save) {
        this.pending = null;
        this.setStatus("saved");
      }
    } catch {
      this.setStatus("offline");
      if (this.pending === save) this.timer = setTimeout(() => void this.send(), this.retryMs);
    }
  }

  private readLocal(): GameSave | null {
    try {
      return readSave(this.local.getItem(this.localKey));
    } catch {
      return null;
    }
  }

  private writeLocal(save: GameSave) {
    try {
      this.local.setItem(this.localKey, JSON.stringify(save));
    } catch {
      // Private mode or full: the server copy still works.
    }
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private setStatus(status: SaveStatus) {
    if (status === this.status) return;
    this.status = status;
    this.notify();
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out.")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
