import type { Outcome } from "@/features/storybook/StoryGame";
import type { Round } from "./content";

/**
 * guessing: the class spells the gift. choosing: good use or bad use. solved: the piece is in place.
 * verse: the whole picture and the verse. prompt: the writing card.
 */
export type Phase = "guessing" | "choosing" | "solved" | "verse" | "prompt";

/** What is saved. The pieces in place are worked out from `round` and `phase`. */
export interface Progress {
  /** The gift being guessed, which is also how many pieces are in place before it is solved. */
  round: number;
  phase: Phase;
  /** Letters typed so far for this gift. */
  entry: string;
  /** Goes up each time a gift starts, so a replay of the same gift starts fresh too. */
  attempt: number;
}

export type Action =
  | { type: "letter"; letter: string }
  | { type: "backspace" }
  | { type: "hint" }
  | { type: "choose"; good: boolean }
  | { type: "next" }
  | { type: "jump"; round: number }
  | { type: "reset" };

type Word = Pick<Round, "word" | "extras">;

export function initialProgress(): Progress {
  return { round: 0, phase: "guessing", entry: "", attempt: 0 };
}

function start(progress: Progress, round: number, phase: Phase = "guessing"): Progress {
  return { round, phase, entry: "", attempt: progress.attempt + 1 };
}

/** The gift on screen. After the last one, `round` counts every piece, so this stays on the last gift. */
export function currentRound(progress: Progress, rounds: number): number {
  return Math.min(progress.round, rounds - 1);
}

/** A small seeded random number source, so the letter bank looks the same after a refresh. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The word's letters and the extras, mixed the same way every time for this round. */
export function letterBank(round: number, { word, extras }: Word): string[] {
  const tiles = [...word, ...extras];
  const random = seeded(round + 1);
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

/** Which tiles the entry has used, matching each letter to the first free tile. */
export function usedTiles(entry: string, tiles: readonly string[]): boolean[] {
  const used = tiles.map(() => false);
  for (const letter of entry) {
    const index = tiles.findIndex((tile, i) => tile === letter && !used[i]);
    if (index >= 0) used[index] = true;
  }
  return used;
}

/** Whether the good use is shown first. Mixed per round, the same after a refresh. */
export function goodFirst(round: number): boolean {
  return seeded(round + 101)() < 0.5;
}

function correctPrefix(entry: string, word: string): number {
  let n = 0;
  while (n < entry.length && entry[n] === word[n]) n++;
  return n;
}

/** A full entry moves on when right, or empties when wrong. */
function settle(progress: Progress, entry: string, word: string): [Progress, Outcome] {
  if (entry.length < word.length) return [{ ...progress, entry }, "done"];
  if (entry === word) return [{ ...progress, entry, phase: "choosing" }, "right"];
  return [{ ...progress, entry: "" }, "wrong"];
}

/** One step of the game, with what it did. */
export function step(progress: Progress, action: Action, words: readonly Word[]): [Progress, Outcome] {
  const current = words[progress.round];
  switch (action.type) {
    case "letter": {
      if (progress.phase !== "guessing" || !current) return [progress, "ignored"];
      const letter = action.letter.toUpperCase();
      const tiles = letterBank(progress.round, current);
      const free = tiles.some((tile, i) => tile === letter && !usedTiles(progress.entry, tiles)[i]);
      if (!free) return [progress, "ignored"];
      return settle(progress, progress.entry + letter, current.word);
    }
    case "backspace":
      if (progress.phase !== "guessing" || progress.entry === "") return [progress, "ignored"];
      return [{ ...progress, entry: progress.entry.slice(0, -1) }, "done"];
    case "hint": {
      if (progress.phase !== "guessing" || !current) return [progress, "ignored"];
      const keep = correctPrefix(progress.entry, current.word);
      return settle(progress, current.word.slice(0, keep + 1), current.word);
    }
    case "choose":
      if (progress.phase !== "choosing") return [progress, "ignored"];
      return action.good ? [{ ...progress, phase: "solved" }, "right"] : [progress, "wrong"];
    case "next":
      if (progress.phase === "solved") {
        const round = progress.round + 1;
        return [start(progress, round, round < words.length ? "guessing" : "verse"), "done"];
      }
      if (progress.phase === "verse") return [{ ...progress, phase: "prompt" }, "done"];
      return [progress, "ignored"];
    case "jump":
      if (!Number.isInteger(action.round) || action.round < 0 || action.round >= words.length) return [progress, "ignored"];
      return [start(progress, action.round), "done"];
    case "reset":
      return [{ ...initialProgress(), attempt: progress.attempt + 1 }, "done"];
  }
}

/** Pieces of the barangay picture in place. */
export function piecesPlaced(progress: Progress): number {
  return progress.phase === "solved" ? progress.round + 1 : progress.round;
}

const PHASES: readonly Phase[] = ["guessing", "choosing", "solved", "verse", "prompt"];

/** Reads a save back. Anything out of range falls back to the nearest valid progress. */
export function sanitizeProgress(raw: unknown, words: readonly Word[]): Progress {
  if (typeof raw !== "object" || raw === null) return initialProgress();
  const data = raw as Record<string, unknown>;
  const whole = (value: unknown) => (typeof value === "number" && Number.isInteger(value) ? value : 0);
  const attempt = Math.max(0, whole(data.attempt));
  const phase = PHASES.find((p) => p === data.phase) ?? "guessing";
  if (phase === "verse" || phase === "prompt") return { round: words.length, phase, entry: "", attempt };
  const round = Math.max(0, Math.min(words.length - 1, whole(data.round)));
  // Choosing and solved mean the word was spelled.
  if (phase !== "guessing") return { round, phase, entry: words[round].word, attempt };
  // Typed letters are kept only as far as they could have been typed from the bank.
  let progress: Progress = { round, phase, entry: "", attempt };
  for (const letter of typeof data.entry === "string" ? data.entry : "") {
    const [next, outcome] = step(progress, { type: "letter", letter }, words);
    if (outcome === "ignored" || outcome === "wrong") break;
    progress = next;
    if (outcome === "right") break;
  }
  return progress;
}
