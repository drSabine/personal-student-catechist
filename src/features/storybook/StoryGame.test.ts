import { describe, expect, it, vi } from "vitest";
import { InMemorySaveRepository } from "@/core/save/InMemorySaveRepository";
import type { LocalStore } from "@/core/save/SyncedStorage";
import { createSavedSession } from "./savedStore";
import { StoryGame } from "./StoryGame";

function memoryLocal(): LocalStore {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

/** A counter game: add a number, or 0 to do nothing. */
function counter() {
  const { store, sync } = createSavedSession(
    { lessonId: "lesson-test", activityId: "counter" },
    { version: 1, initial: () => 0, sanitize: (raw) => (typeof raw === "number" ? raw : 0) },
    { repository: new InMemorySaveRepository(), local: memoryLocal() },
  );
  return new StoryGame(store, sync, (n: number, by: number) => (by === 0 ? [n, "ignored"] : [n + by, "done"]));
}

describe("StoryGame", () => {
  it("saves what the rules return, and passes on the outcome", () => {
    const game = counter();
    expect(game.dispatch(2)).toBe("done");
    expect(game.store.getState().progress).toBe(2);
  });

  it("leaves the store alone when nothing changed, so nothing redraws", () => {
    const game = counter();
    const listener = vi.fn();
    game.store.subscribe(listener);
    expect(game.dispatch(0)).toBe("ignored");
    expect(listener).not.toHaveBeenCalled();
  });

  it("switches sound off and on", () => {
    const game = counter();
    game.setSound(false);
    expect(game.store.getState().sound).toBe(false);
  });
});
