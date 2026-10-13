import { createJSONStorage, persist } from "zustand/middleware";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { SaveSlot } from "@/core/save/GameSave";
import { HttpSaveRepository } from "@/core/save/HttpSaveRepository";
import type { SaveRepository } from "@/core/save/SaveRepository";
import { SyncedStorage, type LocalStore } from "@/core/save/SyncedStorage";

/** Every Lesson 03 game saves its progress and the teacher's sound switch. */
export interface Saved<TProgress> {
  progress: TProgress;
  sound: boolean;
}

export type SavedStore<TProgress> = StoreApi<Saved<TProgress>> & {
  /** Reading the save takes a moment, because it may come from the server. */
  persist: { hasHydrated(): boolean; onFinishHydration(listener: () => void): () => void };
};

interface SavedStoreOptions<TProgress> {
  version: number;
  initial: () => TProgress;
  /** Turns anything read back into a valid progress, so an old or broken save never breaks the game. */
  sanitize: (raw: unknown) => TProgress;
}

/** Where a save goes. The browser uses the saves API and localStorage; tests pass memory. */
interface SaveTargets {
  repository: SaveRepository;
  local: LocalStore;
}

/**
 * A game's progress, saved on this device at once and on the server soon after (docs/game-saves.md).
 * Made once per activity, so leaving the lesson and coming back reuses it.
 */
export function createSavedSession<TProgress>(
  slot: SaveSlot,
  options: SavedStoreOptions<TProgress>,
  targets: SaveTargets = { repository: new HttpSaveRepository(), local: window.localStorage },
): { store: SavedStore<TProgress>; sync: SyncedStorage } {
  const sync = new SyncedStorage(targets.repository, slot, targets.local);
  const store = createStore<Saved<TProgress>>()(
    persist((): Saved<TProgress> => ({ progress: options.initial(), sound: true }), {
      name: slot.activityId,
      version: options.version,
      storage: createJSONStorage(() => ({
        getItem: () => sync.read(),
        setItem: (_name, value) => sync.write(value),
        removeItem: () => sync.remove(),
      })),
      // A save from another device or an older build is checked before it is trusted.
      merge: (saved, current) => {
        const raw = (typeof saved === "object" && saved !== null ? saved : {}) as Partial<
          Record<keyof Saved<TProgress>, unknown>
        >;
        return { ...current, progress: options.sanitize(raw.progress), sound: raw.sound !== false };
      },
    }),
  );
  return { store, sync };
}
