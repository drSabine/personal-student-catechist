import { describe, expect, it } from "vitest";
import type { SaveRepository } from "./SaveRepository";

const slot = { lessonId: "lesson-02", activityId: "build-our-bayan" };

/** The behaviour every SaveRepository must have. Call it from the repository's own test. */
export function saveRepositoryContract(create: () => SaveRepository) {
  describe("save repository contract", () => {
    it("has nothing before the first save", async () => {
      expect(await create().load(slot)).toBeNull();
    });

    it("gives back the last save", async () => {
      const repo = create();
      await repo.save(slot, { state: '{"a":1}', savedAt: 1 });
      await repo.save(slot, { state: '{"a":2}', savedAt: 2 });
      expect(await repo.load(slot)).toEqual({ state: '{"a":2}', savedAt: 2 });
    });

    it("keeps each activity's save apart", async () => {
      const repo = create();
      await repo.save(slot, { state: "{}", savedAt: 1 });
      expect(await repo.load({ ...slot, activityId: "other" })).toBeNull();
    });

    it("refuses an empty or oversized state", async () => {
      const repo = create();
      await expect(repo.save(slot, { state: "", savedAt: 1 })).rejects.toThrow();
      await expect(repo.save(slot, { state: "x".repeat(20_000), savedAt: 1 })).rejects.toThrow();
      expect(await repo.load(slot)).toBeNull();
    });
  });
}
