import { HttpSaveRepository } from "@/core/save/HttpSaveRepository";
import { SyncedStorage } from "@/core/save/SyncedStorage";
import type { BayanContent } from "./content";
import { Director } from "./Director";
import { EventBus } from "./events";
import { createProgressStore, createUiStore, type ProgressStore, type UiStore } from "./stores";

/** Everything one Build Our Bayan game shares between React and Phaser. */
export interface BayanSession {
  saved: ProgressStore;
  ui: UiStore;
  bus: EventBus;
  sync: SyncedStorage;
  director: Director;
}

const sessions = new Map<string, BayanSession>();

/**
 * One session per activity, made on first use in the browser. It outlives the page's components,
 * so leaving the lesson and coming back keeps the conversation and the save in step.
 */
export function getBayanSession(lessonId: string, activityId: string, content: BayanContent): BayanSession {
  const key = `${lessonId}/${activityId}`;
  const existing = sessions.get(key);
  if (existing) return existing;

  const sync = new SyncedStorage(new HttpSaveRepository(), { lessonId, activityId }, window.localStorage);
  const saved = createProgressStore({
    getItem: () => sync.read(),
    setItem: (_name, value) => sync.write(value),
    removeItem: () => sync.remove(),
  });
  const ui = createUiStore();
  const bus = new EventBus();
  const director = new Director(content, saved, ui, bus);

  if (!saved.persist || saved.persist.hasHydrated()) ui.setState({ ready: true });
  else saved.persist.onFinishHydration(() => ui.setState({ ready: true }));

  // The session lives as long as the page, so this listener does too. It sends the last change
  // even when the tab is closed mid-lesson.
  window.addEventListener("pagehide", () => sync.flush());

  const session = { saved, ui, bus, sync, director };
  sessions.set(key, session);
  return session;
}
