/** The shape of a Build Our Bayan lesson's words. Every word on screen comes from one of these. */

export type LotId = "house" | "school" | "hall" | "church";

/** Lots in the order they are listed, which is also the order of the four groups in Stage 5. */
export const LOT_IDS: readonly LotId[] = ["house", "school", "hall", "church"];

/** Questions each lot's leaders ask in Stage 1. */
export const QUESTIONS_PER_LOT = 4;

/** Someone in the town. The id is the name of their object in the Tiled map. */
export interface Person {
  /** Shown over their words. */
  name: string;
  /** Their row in the people sheet, or an animal's frame in the extra sheet. */
  sprite: string;
}

/** One thing said by one person, by id. */
export interface Line {
  speaker: string;
  text: string;
}

export interface Question {
  /** Who asks, by id. */
  speaker: string;
  prompt: string;
  choices: readonly [string, string, string];
  /** Index of the right choice. */
  answer: 0 | 1 | 2;
  /** Said after a wrong choice, in the leader's own voice, to nudge without giving it away. */
  hint: Line;
  /** Said after the right choice. */
  praise: Line;
}

export interface Card {
  title: string;
  body: string;
}

export interface LotContent {
  /** Short name shown on the quest list, for example "home". */
  name: string;
  /** Who leads there. Shown once the leaders are found. */
  leaders: string;
  /** Who leads, what they do for us, how they lead, and how we help them. */
  questions: readonly [Question, Question, Question, Question];
  script: {
    /** The first visit, before the first question. */
    greet: readonly Line[];
    /** Coming back before every question is answered. */
    resume: readonly Line[];
    /** After the last right answer, before the building goes up. */
    done: readonly Line[];
    /** Visits after that. */
    thanks: readonly Line[];
  };
  /** What the builders at the lot say now and then, before and after the leaders are found. */
  chatter: { waiting: readonly string[]; done: readonly string[] };
  /** Stage 5: the group's name and how their answer must start. */
  group: string;
  starter: string;
}

export interface Figure {
  title: string;
  /** Left out where the figure stands for everyone in that role. */
  name?: string;
  role: string;
}

export interface StageContent {
  title: string;
  /** One line telling the class what to do now. Shown on the quest card. */
  instructions: string;
}

export interface GuideContent {
  /** The guide's id. */
  id: string;
  /** The opening, one line at a time. */
  opening: readonly string[];
  /** Said when the class has not found a leader for a while. */
  idle: readonly string[];
  /** Said when all four leaders are found, before the closing card. */
  allFound: readonly string[];
}

export interface BayanContent {
  /** The five stages, in order. */
  stages: readonly [StageContent, StageContent, StageContent, StageContent, StageContent];
  /** The title card the lesson opens on. */
  title: Card;
  guide: GuideContent;
  /** Everyone in the town, people and animals, by id. */
  people: Readonly<Record<string, Person>>;
  lots: Readonly<Record<LotId, LotContent>>;
  /** Lines townsfolk say now and then, by id. */
  townsfolk: Readonly<Record<string, readonly string[]>>;
  /** Stage 1 ends with this card. */
  closing: Card;
  verse: { reference: string; text: string };
  /** Stage 2: foundation, walls, then capstone. */
  churchQuestions: readonly [Question, Question, Question];
  /** Stage 3: in the order they stand. */
  figures: readonly Figure[];
  /** Stage 4: opened one at a time. */
  plaques: readonly [Card, Card, Card];
  feedback: { right: string; tryAgain: string };
}

/** Words still to be supplied by the teacher start with this. They show as "to be added". */
export const TODO_PREFIX = "TODO";

export function isTodo(text: string): boolean {
  return text.startsWith(TODO_PREFIX);
}
