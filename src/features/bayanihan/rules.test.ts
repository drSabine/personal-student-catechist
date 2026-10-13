import { describe, expect, it } from "vitest";
import { WORKER_GIFTS } from "@/features/storybook/cast";
import { initialProgress, sanitizeProgress, scenesDone, step, type Action, type Progress } from "./rules";

const SCENARIOS = 3;
const run = (progress: Progress, action: Action) => step(progress, action, SCENARIOS);

function allAssigned(scenario = 0): Progress {
  return { scenario, phase: "assigning", placed: [...WORKER_GIFTS], attempt: 0 };
}

describe("assigning", () => {
  it("places a worker on the job that fits their gift", () => {
    const [progress, outcome] = run(initialProgress(), { type: "assign", worker: "building", job: "building" });
    expect(outcome).toBe("right");
    expect(progress.placed).toEqual(["building"]);
  });

  it("refuses a wrong match and changes nothing", () => {
    const start = initialProgress();
    const [progress, outcome] = run(start, { type: "assign", worker: "singing", job: "building" });
    expect(outcome).toBe("wrong");
    expect(progress).toBe(start);
  });

  it("ignores a job that is already taken", () => {
    const [once] = run(initialProgress(), { type: "assign", worker: "hands", job: "hands" });
    const [twice, outcome] = run(once, { type: "assign", worker: "hands", job: "hands" });
    expect(outcome).toBe("ignored");
    expect(twice.placed).toEqual(["hands"]);
  });
});

describe("go and done", () => {
  it("waits until every job is taken", () => {
    const [progress, outcome] = run({ ...initialProgress(), placed: ["hands"] }, { type: "go" });
    expect(outcome).toBe("ignored");
    expect(progress.phase).toBe("assigning");
  });

  it("sends everyone to work, then shows the card", () => {
    const [working] = run(allAssigned(), { type: "go" });
    expect(working.phase).toBe("working");
    const [done] = run(working, { type: "finish" });
    expect(done.phase).toBe("done");
  });
});

describe("next and end", () => {
  it("opens the next scenario empty", () => {
    const [progress] = run({ ...allAssigned(0), phase: "done" }, { type: "next" });
    expect(progress).toEqual({ scenario: 1, phase: "assigning", placed: [], attempt: 1 });
  });

  it("ends after the last scenario", () => {
    const [progress] = run({ ...allAssigned(2), phase: "done" }, { type: "next" });
    expect(progress.phase).toBe("end");
    expect(progress.scenario).toBe(2);
  });
});

describe("teacher controls", () => {
  it("replays the current scenario as a fresh attempt", () => {
    const [progress] = run({ ...allAssigned(1), phase: "done" }, { type: "jump", scenario: 1 });
    expect(progress).toEqual({ scenario: 1, phase: "assigning", placed: [], attempt: 1 });
  });

  it("jumps to any scenario, and ignores one that does not exist", () => {
    expect(run(initialProgress(), { type: "jump", scenario: 2 })[0].scenario).toBe(2);
    expect(run(initialProgress(), { type: "jump", scenario: 3 })[1]).toBe("ignored");
  });

  it("resets to the first scenario", () => {
    expect(run({ ...allAssigned(2), phase: "end" }, { type: "reset" })[0]).toEqual({ ...initialProgress(), attempt: 1 });
  });
});

describe("progress", () => {
  it("counts a place as finished once its work is done", () => {
    expect(scenesDone({ ...allAssigned(1), phase: "working" })).toBe(1);
    expect(scenesDone({ ...allAssigned(1), phase: "done" })).toBe(2);
  });
});

describe("reading a save", () => {
  it("keeps a valid save", () => {
    const saved = { scenario: 1, phase: "working", placed: [...WORKER_GIFTS], attempt: 4 };
    expect(sanitizeProgress(saved, SCENARIOS)).toEqual(saved);
  });

  it("drops unknown workers and clamps the scenario", () => {
    expect(sanitizeProgress({ scenario: 9, phase: "assigning", placed: ["hands", "dancing"] }, SCENARIOS)).toEqual({
      scenario: 2,
      phase: "assigning",
      placed: ["hands"],
      attempt: 0,
    });
  });

  it("goes back to assigning when a later phase is missing workers", () => {
    expect(sanitizeProgress({ scenario: 0, phase: "done", placed: ["hands"] }, SCENARIOS).phase).toBe("assigning");
  });

  it("starts fresh from anything else", () => {
    expect(sanitizeProgress("broken", SCENARIOS)).toEqual(initialProgress());
  });
});
