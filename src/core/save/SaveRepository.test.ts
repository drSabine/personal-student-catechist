import { describe, expect, it } from "vitest";
import { readSave } from "./GameSave";
import { InMemorySaveRepository } from "./InMemorySaveRepository";
import { RedisSaveRepository, type KeyValueClient } from "./RedisSaveRepository";
import { saveRepositoryContract } from "./saveContract";

/** Stands in for Upstash, which hands back parsed JSON. */
class FakeRedis implements KeyValueClient {
  readonly values = new Map<string, string>();
  async get(key: string) {
    const value = this.values.get(key);
    return value === undefined ? null : JSON.parse(value);
  }
  async set(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("InMemorySaveRepository", () => {
  saveRepositoryContract(() => new InMemorySaveRepository());
});

describe("RedisSaveRepository", () => {
  saveRepositoryContract(() => new RedisSaveRepository(new FakeRedis()));

  it("stores one key per activity", async () => {
    const redis = new FakeRedis();
    await new RedisSaveRepository(redis).save({ lessonId: "lesson-02", activityId: "game" }, { state: "{}", savedAt: 5 });
    expect([...redis.values.keys()]).toEqual(["saves:lesson-02/game"]);
  });

  it("treats a damaged value as no save", async () => {
    const redis = new FakeRedis();
    redis.values.set("saves:lesson-02/game", JSON.stringify({ state: 3 }));
    expect(await new RedisSaveRepository(redis).load({ lessonId: "lesson-02", activityId: "game" })).toBeNull();
  });
});

describe("readSave", () => {
  it("accepts text or an object", () => {
    expect(readSave('{"state":"{}","savedAt":1}')).toEqual({ state: "{}", savedAt: 1 });
    expect(readSave({ state: "{}", savedAt: 1 })).toEqual({ state: "{}", savedAt: 1 });
  });

  it("refuses anything else", () => {
    expect(readSave("not json")).toBeNull();
    expect(readSave({ state: "{}", savedAt: -1 })).toBeNull();
    expect(readSave(null)).toBeNull();
  });
});
