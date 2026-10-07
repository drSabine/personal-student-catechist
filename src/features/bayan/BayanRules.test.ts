import { describe, expect, it } from "vitest";
import { bayan } from "@/content/lessons/lesson-02/bayan";
import {
  allLeadersFound,
  answer,
  currentQuestion,
  initialProgress,
  leadersFound,
  nextLot,
  sanitizeProgress,
  visibleBuildingLayers,
  type BayanProgress,
} from "./BayanRules";
import { LOT_IDS, QUESTIONS_PER_LOT, type LotId } from "./content";

function rightAnswer(progress: BayanProgress, lot: LotId): number {
  const question = currentQuestion(progress, lot, bayan);
  if (!question) throw new Error(`No question at ${lot}.`);
  return question.answer;
}

function findLeaders(progress: BayanProgress, lot: LotId): BayanProgress {
  let next = progress;
  for (let i = 0; i < QUESTIONS_PER_LOT; i++) next = answer(next, lot, rightAnswer(next, lot), bayan).progress;
  return next;
}

describe("Stage 1 questions", () => {
  it("asks who leads, then what the leader does", () => {
    const start = initialProgress();
    expect(currentQuestion(start, "house", bayan)).toBe(bayan.lots.house.questions[0]);
    const after = answer(start, "house", rightAnswer(start, "house"), bayan).progress;
    expect(currentQuestion(after, "house", bayan)).toBe(bayan.lots.house.questions[1]);
  });

  it("changes nothing on a wrong answer", () => {
    const start = initialProgress();
    const wrong = (bayan.lots.house.questions[0].answer + 1) % 3;
    const result = answer(start, "house", wrong, bayan);
    expect(result).toEqual({ progress: start, correct: false, lotDone: false });
  });

  it("finds a lot's leaders only after every question is answered right", () => {
    let progress = initialProgress();
    for (let i = 0; i < QUESTIONS_PER_LOT; i++) {
      const result = answer(progress, "school", rightAnswer(progress, "school"), bayan);
      expect(result.lotDone).toBe(i === QUESTIONS_PER_LOT - 1);
      progress = result.progress;
    }
    expect(currentQuestion(progress, "school", bayan)).toBeNull();
  });

  it("points the arrow at the next lot in order, then nowhere", () => {
    let progress = initialProgress();
    for (const lot of LOT_IDS) {
      expect(nextLot(progress)).toBe(lot);
      progress = findLeaders(progress, lot);
    }
    expect(nextLot(progress)).toBeNull();
    expect(leadersFound(progress)).toBe(4);
    expect(allLeadersFound(progress)).toBe(true);
  });
});

describe("buildings", () => {
  it("starts with every site and the Lesson 01 wall", () => {
    expect(visibleBuildingLayers(initialProgress())).toEqual(["house-site", "school-site", "hall-site", "church-wall"]);
  });

  it("raises a building when its leaders are found", () => {
    const progress = findLeaders(initialProgress(), "hall");
    expect(visibleBuildingLayers(progress)).toContain("hall-built");
  });

  it("keeps the church a wall after its leader is found", () => {
    const progress = findLeaders(initialProgress(), "church");
    expect(visibleBuildingLayers(progress)).toContain("church-wall");
  });
});

describe("sanitizeProgress", () => {
  it("keeps a good save", () => {
    const progress = findLeaders(initialProgress(), "house");
    expect(sanitizeProgress(JSON.parse(JSON.stringify(progress)))).toEqual(progress);
  });

  it("falls back to the start for anything damaged", () => {
    expect(sanitizeProgress(null)).toEqual(initialProgress());
    expect(sanitizeProgress({ stage: 9, answered: { house: 7 }, church: "x" })).toEqual(initialProgress());
  });
});
