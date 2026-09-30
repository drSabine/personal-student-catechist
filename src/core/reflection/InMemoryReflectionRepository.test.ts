import { describe, expect, it } from "vitest";
import { InMemoryReflectionRepository } from "./InMemoryReflectionRepository";

function clock(): () => Date {
  let t = Date.UTC(2026, 0, 1);
  return () => {
    t += 1000;
    return new Date(t);
  };
}

describe("InMemoryReflectionRepository", () => {
  it("saves a trimmed reflection with an id and date", async () => {
    const repo = new InMemoryReflectionRepository(clock());
    const saved = await repo.save({ lessonId: "lesson-01", pupilName: "  Ana ", content: " We build together. " });
    expect(saved.id).toBeTruthy();
    expect(saved.pupilName).toBe("Ana");
    expect(saved.content).toBe("We build together.");
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  it("lists only the asked lesson, newest first", async () => {
    const repo = new InMemoryReflectionRepository(clock());
    const first = await repo.save({ lessonId: "lesson-01", pupilName: "A", content: "one" });
    await repo.save({ lessonId: "lesson-02", pupilName: "B", content: "other lesson" });
    const third = await repo.save({ lessonId: "lesson-01", pupilName: "C", content: "three" });
    const list = await repo.listByLesson("lesson-01");
    expect(list.map((r) => r.id)).toEqual([third.id, first.id]);
  });

  it("keeps newest first even when saved in the same instant", async () => {
    const fixed = new Date(Date.UTC(2026, 0, 1));
    const repo = new InMemoryReflectionRepository(() => fixed);
    const a = await repo.save({ lessonId: "lesson-01", pupilName: "A", content: "one" });
    const b = await repo.save({ lessonId: "lesson-01", pupilName: "B", content: "two" });
    expect((await repo.listByLesson("lesson-01")).map((r) => r.id)).toEqual([b.id, a.id]);
  });

  it("deletes an entry", async () => {
    const repo = new InMemoryReflectionRepository(clock());
    const saved = await repo.save({ lessonId: "lesson-01", pupilName: "A", content: "one" });
    await repo.delete(saved.id);
    expect(await repo.listByLesson("lesson-01")).toEqual([]);
  });

  it("refuses empty names and empty reflections", async () => {
    const repo = new InMemoryReflectionRepository(clock());
    await expect(repo.save({ lessonId: "lesson-01", pupilName: " ", content: "hi" })).rejects.toThrow();
    await expect(repo.save({ lessonId: "lesson-01", pupilName: "A", content: "  " })).rejects.toThrow();
  });
});
