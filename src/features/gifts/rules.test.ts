import { describe, expect, it } from "vitest";
import {
  currentRound,
  goodFirst,
  initialProgress,
  letterBank,
  piecesPlaced,
  sanitizeProgress,
  step,
  usedTiles,
  type Action,
  type Progress,
} from "./rules";

const WORDS = [
  { word: "HANDS", extras: "ROT" },
  { word: "SINGING", extras: "ROT" },
];
const run = (progress: Progress, action: Action) => step(progress, action, WORDS);

function type(progress: Progress, letters: string): Progress {
  return [...letters].reduce((current, letter) => run(current, { type: "letter", letter })[0], progress);
}

describe("the letter bank", () => {
  it("holds the word and the extras, mixed the same way every time", () => {
    const tiles = letterBank(0, WORDS[0]);
    expect([...tiles].sort()).toEqual([..."HANDSROT"].sort());
    expect(letterBank(0, WORDS[0])).toEqual(tiles);
  });

  it("marks each typed letter on its own tile, repeats included", () => {
    const tiles = letterBank(1, WORDS[1]);
    const used = usedTiles("SIN", tiles);
    expect(used.filter(Boolean)).toHaveLength(3);
    expect(tiles.filter((tile, i) => used[i] && tile === "I")).toHaveLength(1);
  });
});

describe("guessing", () => {
  it("types letters from the bank, in any case", () => {
    expect(type(initialProgress(), "ha").entry).toBe("HA");
  });

  it("ignores a letter the bank does not have free", () => {
    const [progress, outcome] = run(type(initialProgress(), "H"), { type: "letter", letter: "H" });
    expect(outcome).toBe("ignored");
    expect(progress.entry).toBe("H");
  });

  it("removes the last letter with backspace", () => {
    expect(run(type(initialProgress(), "HAN"), { type: "backspace" })[0].entry).toBe("HA");
  });

  it("clears a wrong full word with no penalty", () => {
    const [progress, outcome] = run(type(initialProgress(), "HAND"), { type: "letter", letter: "T" });
    expect(outcome).toBe("wrong");
    expect(progress).toEqual(initialProgress());
  });

  it("moves to choosing when the word is right", () => {
    const [progress, outcome] = run(type(initialProgress(), "HAND"), { type: "letter", letter: "S" });
    expect(outcome).toBe("right");
    expect(progress.phase).toBe("choosing");
  });
});

describe("the hint", () => {
  it("adds the next correct letter", () => {
    expect(run(type(initialProgress(), "HA"), { type: "hint" })[0].entry).toBe("HAN");
  });

  it("fixes a wrong start before adding", () => {
    expect(run(type(initialProgress(), "HT"), { type: "hint" })[0].entry).toBe("HA");
  });

  it("finishes the word on the last letter", () => {
    expect(run(type(initialProgress(), "HAND"), { type: "hint" })[0].phase).toBe("choosing");
  });
});

describe("choosing", () => {
  const choosing: Progress = { round: 0, phase: "choosing", entry: "HANDS", attempt: 0 };

  it("lets the class choose again after the bad use", () => {
    const [progress, outcome] = run(choosing, { type: "choose", good: false });
    expect(outcome).toBe("wrong");
    expect(progress).toBe(choosing);
  });

  it("places the piece after the good use", () => {
    const [progress, outcome] = run(choosing, { type: "choose", good: true });
    expect(outcome).toBe("right");
    expect(piecesPlaced(progress)).toBe(1);
  });

  it("orders the two cards the same way every time", () => {
    expect(goodFirst(3)).toBe(goodFirst(3));
  });
});

describe("next, verse, and prompt", () => {
  it("opens the next gift", () => {
    expect(run({ round: 0, phase: "solved", entry: "HANDS", attempt: 0 }, { type: "next" })[0]).toEqual({
      round: 1,
      phase: "guessing",
      entry: "",
      attempt: 1,
    });
  });

  it("shows the verse after the last gift, then the writing card", () => {
    const [verse] = run({ round: 1, phase: "solved", entry: "SINGING", attempt: 0 }, { type: "next" });
    expect(verse.phase).toBe("verse");
    expect(piecesPlaced(verse)).toBe(2);
    expect(run(verse, { type: "next" })[0].phase).toBe("prompt");
  });
});

describe("teacher controls", () => {
  it("jumps to a gift and resets", () => {
    expect(run(initialProgress(), { type: "jump", round: 1 })[0]).toEqual({ round: 1, phase: "guessing", entry: "", attempt: 1 });
    expect(run(initialProgress(), { type: "jump", round: 2 })[1]).toBe("ignored");
    expect(run({ round: 2, phase: "prompt", entry: "", attempt: 3 }, { type: "reset" })[0]).toEqual({
      ...initialProgress(),
      attempt: 4,
    });
  });

  it("keeps the last gift on screen after the picture is whole", () => {
    expect(currentRound({ round: 2, phase: "verse", entry: "", attempt: 0 }, 2)).toBe(1);
  });
});

describe("reading a save", () => {
  it("keeps a complete correct word and opens its choice", () => {
    expect(sanitizeProgress({ round: 0, phase: "guessing", entry: "HANDS" }, WORDS)).toEqual({
      round: 0, phase: "choosing", entry: "HANDS", attempt: 0,
    });
  });

  it("keeps typed letters only as far as the bank allows", () => {
    expect(sanitizeProgress({ round: 0, phase: "guessing", entry: "HAHX" }, WORDS).entry).toBe("HA");
  });

  it("fills the word back in once it was spelled", () => {
    expect(sanitizeProgress({ round: 1, phase: "choosing", entry: "" }, WORDS).entry).toBe("SINGING");
  });

  it("keeps the end screens and clamps the round", () => {
    expect(sanitizeProgress({ round: 0, phase: "prompt" }, WORDS)).toEqual({ round: 2, phase: "prompt", entry: "", attempt: 0 });
    expect(sanitizeProgress({ round: 9, phase: "guessing" }, WORDS).round).toBe(1);
  });

  it("starts fresh from anything else", () => {
    expect(sanitizeProgress(null, WORDS)).toEqual(initialProgress());
  });
});
