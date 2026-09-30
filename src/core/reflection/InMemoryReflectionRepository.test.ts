import { describe, expect, it } from "vitest";
import { InMemoryReflectionRepository } from "./InMemoryReflectionRepository";
import { reflectionRepositoryContract } from "./repositoryContract";

describe("InMemoryReflectionRepository", () => {
  reflectionRepositoryContract((now) => new InMemoryReflectionRepository(now));

  it("keeps newest first even when saved in the same instant", async () => {
    const fixed = new Date(Date.UTC(2026, 0, 1));
    const repo = new InMemoryReflectionRepository(() => fixed);
    const a = await repo.save({ lessonId: "lesson-01", pupilName: "A", content: "one" });
    const b = await repo.save({ lessonId: "lesson-01", pupilName: "B", content: "two" });
    expect((await repo.listByLesson("lesson-01")).map((r) => r.id)).toEqual([b.id, a.id]);
  });
});
