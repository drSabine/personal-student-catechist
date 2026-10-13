// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { InMemorySaveRepository } from "@/core/save/InMemorySaveRepository";
import { createSavedSession } from "./savedStore";
import { StoryGame } from "./StoryGame";
import { useSaveStatus } from "./useGame";

describe("the game save listener", () => {
  it("flushes on page close and unmount, and removes its listener before mounting again", async () => {
    const { store, sync } = createSavedSession(
      { lessonId: "lesson-test", activityId: "listener" },
      { version: 1, initial: () => 0, sanitize: () => 0 },
      { repository: new InMemorySaveRepository(), local: window.localStorage },
    );
    if (!store.persist.hasHydrated()) await new Promise<void>((resolve) => store.persist.onFinishHydration(resolve));
    const game = new StoryGame(store, sync, (n: number) => [n, "ignored"]);
    const flush = vi.spyOn(sync, "flush");
    function View() {
      useSaveStatus(game);
      return null;
    }
    const container = document.createElement("div");
    const root = createRoot(container);
    await act(async () => root.render(createElement(View)));
    window.dispatchEvent(new Event("pagehide"));
    expect(flush).toHaveBeenCalledTimes(1);
    await act(async () => root.unmount());
    expect(flush).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new Event("pagehide"));
    expect(flush).toHaveBeenCalledTimes(2);
    const returning = createRoot(container);
    await act(async () => returning.render(createElement(View)));
    window.dispatchEvent(new Event("pagehide"));
    expect(flush).toHaveBeenCalledTimes(3);
    await act(async () => returning.unmount());
  });
});
