import { describe, expect, it, vi } from "vitest";
import { HttpReflectionRepository } from "./HttpReflectionRepository";

type Send = typeof fetch;

function repoWith(response: () => Response | Promise<Response>) {
  const send = vi.fn<Send>(async () => response());
  return { repo: new HttpReflectionRepository("/api/reflections", send), send };
}

const stored = {
  id: "abc",
  lessonId: "lesson-01",
  pupilName: "Ana",
  content: "We build together.",
  createdAt: "2026-01-01T00:00:01.000Z",
};

describe("HttpReflectionRepository", () => {
  it("posts a trimmed reflection and returns it with a real date", async () => {
    const { repo, send } = repoWith(() => Response.json(stored, { status: 201 }));
    const saved = await repo.save({ lessonId: "lesson-01", pupilName: " Ana ", content: " We build together. " });

    const [url, init] = send.mock.calls[0];
    expect(url).toBe("/api/reflections");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      lessonId: "lesson-01",
      pupilName: "Ana",
      content: "We build together.",
    });
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.createdAt.toISOString()).toBe(stored.createdAt);
  });

  it("checks the input before it asks the server", async () => {
    const { repo, send } = repoWith(() => Response.json(stored));
    await expect(repo.save({ lessonId: "lesson-01", pupilName: " ", content: "hi" })).rejects.toThrow(
      "Please write your name.",
    );
    expect(send).not.toHaveBeenCalled();
  });

  it("lists one lesson and turns dates back into Dates", async () => {
    const { repo, send } = repoWith(() => Response.json([stored]));
    const list = await repo.listByLesson("lesson 01");
    expect(send.mock.calls[0][0]).toBe("/api/reflections?lessonId=lesson%2001");
    expect(list).toHaveLength(1);
    expect(list[0].createdAt).toBeInstanceOf(Date);
  });

  it("deletes by id", async () => {
    const { repo, send } = repoWith(() => new Response(null, { status: 204 }));
    await repo.delete("a/b");
    expect(send.mock.calls[0][0]).toBe("/api/reflections/a%2Fb");
    expect(send.mock.calls[0][1]?.method).toBe("DELETE");
  });

  it("uses the server's message when a request fails", async () => {
    const { repo } = repoWith(() => Response.json({ error: "Reflections are not set up yet." }, { status: 503 }));
    await expect(repo.listByLesson("lesson-01")).rejects.toThrow("Reflections are not set up yet.");
  });

  it("gives a readable message when the server cannot be reached or sends no message", async () => {
    const offline = repoWith(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(offline.repo.listByLesson("lesson-01")).rejects.toThrow("Could not reach the server");

    const broken = repoWith(() => new Response("oops", { status: 500 }));
    await expect(broken.repo.listByLesson("lesson-01")).rejects.toThrow("Could not reach the server");
  });
});
