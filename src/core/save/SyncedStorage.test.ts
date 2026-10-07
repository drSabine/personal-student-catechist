import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameSave, SaveSlot } from "./GameSave";
import { InMemorySaveRepository } from "./InMemorySaveRepository";
import { SyncedStorage, type LocalStore } from "./SyncedStorage";

const slot: SaveSlot = { lessonId: "lesson-02", activityId: "game" };

class FakeLocal implements LocalStore {
  readonly items = new Map<string, string>();
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
}

/** A server that can be switched off. */
class FlakyServer extends InMemorySaveRepository {
  down = false;
  sent: GameSave[] = [];
  async load(s: SaveSlot) {
    if (this.down) throw new Error("offline");
    return super.load(s);
  }
  async save(s: SaveSlot, save: GameSave) {
    if (this.down) throw new Error("offline");
    this.sent.push(save);
    return super.save(s, save);
  }
}

function setup(clock = { t: 1000 }) {
  const server = new FlakyServer();
  const local = new FakeLocal();
  const storage = new SyncedStorage(server, slot, local, { debounceMs: 10, retryMs: 50, now: () => clock.t });
  return { server, local, storage, clock };
}

describe("SyncedStorage", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("saves on this device at once and on the server after a short wait", async () => {
    const { server, local, storage } = setup();
    await storage.read();
    storage.write("A");
    expect([...local.items.values()][0]).toContain('"state":"A"');
    expect(storage.getSnapshot()).toBe("saving");
    await vi.advanceTimersByTimeAsync(10);
    expect(server.sent.map((s) => s.state)).toEqual(["A"]);
    expect(storage.getSnapshot()).toBe("saved");
  });

  it("sends a burst of changes once", async () => {
    const { server, storage } = setup();
    await storage.read();
    storage.write("A");
    storage.write("B");
    storage.write("C");
    await vi.advanceTimersByTimeAsync(10);
    expect(server.sent.map((s) => s.state)).toEqual(["C"]);
  });

  it("keeps working offline and catches up when the server is back", async () => {
    const { server, storage } = setup();
    await storage.read();
    server.down = true;
    storage.write("A");
    await vi.advanceTimersByTimeAsync(10);
    expect(storage.getSnapshot()).toBe("offline");
    server.down = false;
    await vi.advanceTimersByTimeAsync(50);
    expect(storage.getSnapshot()).toBe("saved");
    expect(server.sent.map((s) => s.state)).toEqual(["A"]);
  });

  it("opens with the server's save on a new device", async () => {
    const { server, storage } = setup();
    await server.save(slot, { state: "from the laptop", savedAt: 500 });
    expect(await storage.read()).toBe("from the laptop");
    expect(storage.getSnapshot()).toBe("saved");
  });

  it("prefers this device's save when it is newer, and sends it", async () => {
    const clock = { t: 1000 };
    const first = setup(clock);
    await first.server.save(slot, { state: "old", savedAt: 100 });
    first.local.setItem("save:lesson-02/game", JSON.stringify({ state: "newer", savedAt: 900 }));
    expect(await first.storage.read()).toBe("newer");
    await vi.advanceTimersByTimeAsync(10);
    expect(await first.server.load(slot)).toEqual({ state: "newer", savedAt: 900 });
  });

  it("uses this device's save when the server cannot be reached", async () => {
    const { server, local, storage } = setup();
    local.setItem("save:lesson-02/game", JSON.stringify({ state: "local", savedAt: 900 }));
    server.down = true;
    expect(await storage.read()).toBe("local");
  });
});
