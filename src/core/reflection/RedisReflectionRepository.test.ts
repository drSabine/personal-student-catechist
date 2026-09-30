import { describe, expect, it } from "vitest";
import { RedisReflectionRepository, type HashClient } from "./RedisReflectionRepository";
import { reflectionRepositoryContract, steppingClock } from "./repositoryContract";

/** A stand-in for Redis: one hash held in a Map. */
function fakeClient(): HashClient & { hash: Map<string, unknown> } {
  const hash = new Map<string, unknown>();
  return {
    hash,
    async hset(_key, fields) {
      for (const [name, value] of Object.entries(fields)) hash.set(name, value);
      return hash.size;
    },
    async hgetall() {
      return hash.size ? Object.fromEntries(hash) : null;
    },
    async hdel(_key, ...names) {
      for (const name of names) hash.delete(name);
      return names.length;
    },
  };
}

describe("RedisReflectionRepository", () => {
  reflectionRepositoryContract((now) => new RedisReflectionRepository(fakeClient(), now));

  it("reads entries a client already parsed into objects, and skips broken ones", async () => {
    const client = fakeClient();
    const repo = new RedisReflectionRepository(client, steppingClock());
    const saved = await repo.save({ lessonId: "lesson-01", pupilName: "A", content: "one" });
    client.hash.set(saved.id, JSON.parse(client.hash.get(saved.id) as string));
    client.hash.set("broken", "not json");
    client.hash.set("odd", { id: 5 });
    expect((await repo.listByLesson("lesson-01")).map((r) => r.id)).toEqual([saved.id]);
  });

  it("stores nothing when the input is refused", async () => {
    const client = fakeClient();
    const repo = new RedisReflectionRepository(client, steppingClock());
    await expect(repo.save({ lessonId: "lesson-01", pupilName: " ", content: "hi" })).rejects.toThrow();
    expect(client.hash.size).toBe(0);
  });
});
