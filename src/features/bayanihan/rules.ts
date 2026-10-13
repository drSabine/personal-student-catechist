import { WORKER_GIFTS, type WorkerGift } from "@/features/storybook/cast";
import type { Outcome } from "@/features/storybook/StoryGame";

/**
 * assigning: the leader gives out jobs. working: everyone walks and works. done: the scene is finished.
 * end: the last question, after every scene.
 */
export type Phase = "assigning" | "working" | "done" | "end";

/** What is saved. Which spots are clean is worked out from this, never stored. */
export interface Progress {
  scenario: number;
  phase: Phase;
  /** Workers already on their job. A worker's job is the one with the same gift. */
  placed: readonly WorkerGift[];
  /** Goes up each time a scene starts, so a replay of the same scene starts fresh too. */
  attempt: number;
}

export type Action =
  | { type: "assign"; worker: WorkerGift; job: WorkerGift }
  | { type: "go" }
  | { type: "finish" }
  | { type: "next" }
  | { type: "jump"; scenario: number }
  | { type: "reset" };

export function initialProgress(): Progress {
  return { scenario: 0, phase: "assigning", placed: [], attempt: 0 };
}

function start(progress: Progress, scenario: number): [Progress, Outcome] {
  return [{ scenario, phase: "assigning", placed: [], attempt: progress.attempt + 1 }, "done"];
}

export function allPlaced(progress: Pick<Progress, "placed">): boolean {
  return WORKER_GIFTS.every((gift) => progress.placed.includes(gift));
}

/** Scenes the class has finished. */
export function scenesDone(progress: Progress): number {
  return progress.phase === "done" || progress.phase === "end" ? progress.scenario + 1 : progress.scenario;
}

/** One step of the game, with what it did. A wrong match changes nothing. */
export function step(progress: Progress, action: Action, scenarios: number): [Progress, Outcome] {
  switch (action.type) {
    case "assign":
      if (progress.phase !== "assigning" || progress.placed.includes(action.job)) return [progress, "ignored"];
      if (action.worker !== action.job) return [progress, "wrong"];
      return [{ ...progress, placed: [...progress.placed, action.job] }, "right"];
    case "go":
      if (progress.phase !== "assigning" || !allPlaced(progress)) return [progress, "ignored"];
      return [{ ...progress, phase: "working" }, "done"];
    case "finish":
      return progress.phase === "working" ? [{ ...progress, phase: "done" }, "done"] : [progress, "ignored"];
    case "next":
      if (progress.phase !== "done") return [progress, "ignored"];
      return progress.scenario + 1 < scenarios ? start(progress, progress.scenario + 1) : [{ ...progress, phase: "end" }, "done"];
    case "jump":
      if (!Number.isInteger(action.scenario) || action.scenario < 0 || action.scenario >= scenarios) return [progress, "ignored"];
      return start(progress, action.scenario);
    case "reset":
      return [{ ...initialProgress(), attempt: progress.attempt + 1 }, "done"];
  }
}

const PHASES: readonly Phase[] = ["assigning", "working", "done", "end"];

/** Reads a save back. Anything out of range falls back to the nearest valid progress. */
export function sanitizeProgress(raw: unknown, scenarios: number): Progress {
  if (typeof raw !== "object" || raw === null) return initialProgress();
  const data = raw as Record<string, unknown>;
  const whole = (value: unknown) => (typeof value === "number" && Number.isInteger(value) ? value : 0);
  const scenario = Math.max(0, Math.min(scenarios - 1, whole(data.scenario)));
  const placed = Array.isArray(data.placed) ? WORKER_GIFTS.filter((gift) => (data.placed as unknown[]).includes(gift)) : [];
  const phase = PHASES.find((p) => p === data.phase) ?? "assigning";
  const progress = { scenario, phase, placed, attempt: Math.max(0, whole(data.attempt)) };
  // Working, done, and end all need every job taken.
  return phase === "assigning" || allPlaced(progress) ? progress : { ...progress, phase: "assigning" };
}
