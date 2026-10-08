import { reflectionRepository } from "@/core/reflection/repository";
import { HttpSaveRepository } from "@/core/save/HttpSaveRepository";
import { SyncedStorage } from "@/core/save/SyncedStorage";
import { LOT_IDS, type BayanContent } from "./content";
import { Director } from "./Director";
import { EventBus } from "./events";
import { GroupPromises } from "./GroupPromises";
import { createProgressStore, createUiStore, type ProgressStore, type UiStore } from "./stores";

/** Everything one Build Our Bayan game shares between React and Phaser. */
export interface BayanSession {
  saved: ProgressStore;
  ui: UiStore;
  bus: EventBus;
  sync: SyncedStorage;
  director: Director;
}

/**
 * The game's shared state, made once per activity on first use in the browser (BayanActivity keeps
 * it). It outlives the page's components, so leaving the lesson and coming back keeps the
 * conversation and the save in step.
 */
export function createBayanSession(lessonId: string, activityId: string, content: BayanContent): BayanSession {
  const sync = new SyncedStorage(new HttpSaveRepository(), { lessonId, activityId }, window.localStorage);
  const saved = createProgressStore({
    getItem: () => sync.read(),
    setItem: (_name, value) => sync.write(value),
    removeItem: () => sync.remove(),
  });
  const ui = createUiStore();
  const bus = new EventBus();
  const groups = LOT_IDS.map((lot) => content.lots[lot].group);
  const director = new Director(content, saved, ui, bus, new GroupPromises(reflectionRepository, lessonId, groups));

  if (!saved.persist || saved.persist.hasHydrated()) ui.setState({ ready: true });
  else saved.persist.onFinishHydration(() => ui.setState({ ready: true }));

  // The session lives as long as the page, so this listener does too. It sends the last change
  // even when the tab is closed mid-lesson.
  window.addEventListener("pagehide", () => sync.flush());

  return { saved, ui, bus, sync, director };
}
