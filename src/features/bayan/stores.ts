import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { createStore, type StoreApi } from "zustand/vanilla";
import { initialProgress, sanitizeProgress, type BayanProgress } from "./BayanRules";
import type { Card, Line, LotId, QuestionSet } from "./content";

/** What is saved: the class's progress and the teacher's sound choices. */
export interface SavedState {
  progress: BayanProgress;
  music: boolean;
  sounds: boolean;
}

export type ProgressStore = StoreApi<SavedState> & {
  /** Present when saved; reading the save takes a moment because it may come from the server. */
  persist?: { hasHydrated(): boolean; onFinishHydration(listener: () => void): () => void };
};

const SAVE_VERSION = 1;

export function savedDefaults(): SavedState {
  return { progress: initialProgress(), music: true, sounds: true };
}

/** With `storage`, the state is saved there and read back when the page opens. */
export function createProgressStore(storage?: StateStorage): ProgressStore {
  if (!storage) return createStore<SavedState>()(savedDefaults);
  return createStore<SavedState>()(
    persist(savedDefaults, {
      name: "bayan",
      version: SAVE_VERSION,
      storage: createJSONStorage(() => storage),
      // A save from another device or an older build is checked before it is trusted.
      merge: (saved, current) => {
        const raw = (typeof saved === "object" && saved !== null ? saved : {}) as Partial<Record<keyof SavedState, unknown>>;
        return {
          ...current,
          progress: sanitizeProgress(raw.progress),
          music: raw.music !== false,
          sounds: raw.sounds !== false,
        };
      },
    }),
  );
}

/** One line, question, card, Stage 3 figure, or St. Peter's statue in a conversation. */
export type Beat =
  | ({ kind: "say" } & Line)
  | { kind: "ask"; set: QuestionSet; question: number }
  | { kind: "card"; card: Card }
  | { kind: "figure"; index: number }
  | { kind: "statue" };

export interface Dialog {
  beats: readonly Beat[];
  index: number;
  /** Wrong choices tried on the current question. */
  tried: readonly number[];
  /** The leader's nudge after the last wrong choice. */
  hint: Line | null;
  /** The right choice, once picked, shown before moving on. */
  solved: number | null;
}

/** Someone or something the pupil stands next to. */
export type Near =
  | { kind: "leader"; id: string; lot: LotId }
  | { kind: "guide"; id: string }
  | { kind: "townsfolk"; id: string; lot?: LotId }
  | { kind: "figure"; id: string; index: number }
  | { kind: "plaque"; id: string; index: number }
  | { kind: "statue"; id: string }
  | { kind: "door"; id: string }
  | { kind: "exit"; id: string };

/** A line floating over someone's head, at a point on screen in CSS pixels. */
export interface Bubble {
  id: string;
  text: string;
  x: number;
  y: number;
}

/** What is on screen right now. Never saved. */
export interface UiState {
  /** The save has been read, so the town shows the class's progress. False for a moment while a jump replaces it. */
  ready: boolean;
  /** The class pressed Start, which also lets the browser play sound. */
  started: boolean;
  dialog: Dialog | null;
  near: Near | null;
  bubbles: readonly Bubble[];
  /** A building the class just finished, shown on the built card until they carry on. */
  built: LotId | null;
  /** Stage 2: the close-up of the church is open. */
  closeUp: boolean;
  /** The pupil is inside the church (Stage 3 onward). */
  inside: boolean;
  /** Stage 5: a group is writing its sentence. */
  writing: boolean;
}

export type UiStore = StoreApi<UiState>;

export function createUiStore(): UiStore {
  return createStore<UiState>()(() => ({
    ready: false,
    started: false,
    dialog: null,
    near: null,
    bubbles: [],
    built: null,
    closeUp: false,
    inside: false,
    writing: false,
  }));
}

/** The pupil may not walk while a conversation, a card, or the writing panel is open, or before the class starts. */
export function isLocked(ui: UiState): boolean {
  return !ui.started || ui.dialog !== null || ui.built !== null || ui.closeUp || ui.writing;
}
