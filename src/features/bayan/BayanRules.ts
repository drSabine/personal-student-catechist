import { LOT_IDS, QUESTIONS_PER_LOT, type BayanContent, type LotId, type Question } from "./content";

export type Stage = 1 | 2 | 3 | 4 | 5;

/** The church as it rises: the Lesson 01 wall, then foundation, walls, and the capstone. */
export type ChurchLevel = 0 | 1 | 2 | 3;

export const CHURCH_LAYERS = ["church-wall", "church-foundation", "church-walls", "church-complete"] as const;

/** Lots whose building rises in Stage 1. The church waits for Stage 2. */
export type TownLot = Exclude<LotId, "church">;

/** Everything the class has done. Saved, so a refresh or another laptop keeps it. */
export interface BayanProgress {
  stage: Stage;
  /** Right answers given at each lot in Stage 1, from 0 to QUESTIONS_PER_LOT. */
  answered: Record<LotId, number>;
  church: ChurchLevel;
  openingSeen: boolean;
  closingSeen: boolean;
}

export function initialProgress(): BayanProgress {
  return {
    stage: 1,
    answered: { house: 0, school: 0, hall: 0, church: 0 },
    church: 0,
    openingSeen: false,
    closingSeen: false,
  };
}

/** Reads a save that came from storage or the network. Anything odd falls back to the start. */
export function sanitizeProgress(value: unknown): BayanProgress {
  const start = initialProgress();
  if (typeof value !== "object" || value === null) return start;
  const raw = value as Record<string, unknown>;
  const answered = { ...start.answered };
  const rawAnswered = (typeof raw.answered === "object" && raw.answered !== null ? raw.answered : {}) as Record<
    string,
    unknown
  >;
  for (const lot of LOT_IDS) answered[lot] = wholeNumber(rawAnswered[lot], 0, QUESTIONS_PER_LOT) ?? 0;
  return {
    stage: (wholeNumber(raw.stage, 1, 5) ?? 1) as Stage,
    answered,
    church: (wholeNumber(raw.church, 0, 3) ?? 0) as ChurchLevel,
    openingSeen: raw.openingSeen === true,
    closingSeen: raw.closingSeen === true,
  };
}

function wholeNumber(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max ? value : null;
}

/** Every one of the lot's questions is answered, so its leaders are found. */
export function isLotDone(progress: BayanProgress, lot: LotId): boolean {
  return progress.answered[lot] >= QUESTIONS_PER_LOT;
}

export function leadersFound(progress: BayanProgress): number {
  return LOT_IDS.filter((lot) => isLotDone(progress, lot)).length;
}

export function allLeadersFound(progress: BayanProgress): boolean {
  return leadersFound(progress) === LOT_IDS.length;
}

/** Where the guide's arrow points: the first lot whose leaders are not found yet. */
export function nextLot(progress: BayanProgress): LotId | null {
  if (progress.stage !== 1) return null;
  return LOT_IDS.find((lot) => !isLotDone(progress, lot)) ?? null;
}

/** The question a lot's leader asks now, or null when there is none to ask. */
export function currentQuestion(progress: BayanProgress, lot: LotId, content: BayanContent): Question | null {
  if (progress.stage !== 1 || isLotDone(progress, lot)) return null;
  return content.lots[lot].questions[progress.answered[lot]];
}

export interface AnswerResult {
  progress: BayanProgress;
  correct: boolean;
  /** This answer found the lot's leaders. */
  lotDone: boolean;
}

/** A wrong choice changes nothing, so the class can simply try again. */
export function answer(progress: BayanProgress, lot: LotId, choice: number, content: BayanContent): AnswerResult {
  const question = currentQuestion(progress, lot, content);
  if (!question || choice !== question.answer) return { progress, correct: false, lotDone: false };
  const next = { ...progress, answered: { ...progress.answered, [lot]: progress.answered[lot] + 1 } };
  return { progress: next, correct: true, lotDone: isLotDone(next, lot) };
}

/** A lot other than the church is built once its leaders are found. */
export function isBuilt(progress: BayanProgress, lot: TownLot): boolean {
  return isLotDone(progress, lot) || progress.stage > 1;
}

/** Names of the map's building layers to show. Every other building layer is hidden. */
export function visibleBuildingLayers(progress: BayanProgress): string[] {
  const layers: string[] = LOT_IDS.filter((lot): lot is TownLot => lot !== "church").map((lot) =>
    isBuilt(progress, lot) ? `${lot}-built` : `${lot}-site`,
  );
  layers.push(CHURCH_LAYERS[progress.church]);
  return layers;
}
