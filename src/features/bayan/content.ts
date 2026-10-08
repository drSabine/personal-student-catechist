/** The shape of a Build Our Bayan lesson's words: every line, question, card, and name. Button labels live with their buttons. */

export type LotId = "house" | "school" | "hall" | "church";

/** Lots in the order they are listed, which is also the order of the four groups in Stage 5. */
export const LOT_IDS: readonly LotId[] = ["house", "school", "hall", "church"];

/** Questions each lot's leaders ask in Stage 1. */
export const QUESTIONS_PER_LOT = 3;

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

export interface Choice {
  text: string;
  /** Said when this wrong choice is picked, so each wrong answer gets its own nudge. The right choice has none. */
  hint?: Line;
}

export interface Question {
  /** Who asks, by id. */
  speaker: string;
  prompt: string;
  choices: readonly [Choice, Choice, Choice];
  /** Index of the right choice. */
  answer: 0 | 1 | 2;
  /** Said after the right choice. */
  praise: Line;
}

export interface Card {
  title: string;
  body: string;
}

/** Stage 2: a part of the church in the close-up, and who it stands for once it lights up. */
export interface ChurchPart extends Card {
  who: string;
}

export interface LotContent {
  /** Short name shown on the quest list, for example "home". */
  name: string;
  /** What rises on the lot, for the built card, for example "home" or "town hall". */
  building: string;
  /** Who leads there. Shown once the leaders are found. */
  leaders: string;
  /** Who leads, what they do for us, and how we help them. */
  questions: readonly [Question, Question, Question];
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
  /** Their row in the people sheet. */
  sprite: string;
}

export interface StageContent {
  title: string;
  /** One line telling the class what to do now. Shown on the quest card. */
  instructions: string;
  /** What the guide says as the stage begins. Stage 1 has the opening instead. */
  start: readonly string[];
  /** The card that closes the stage. The last stage has none. */
  end?: Card;
}

export interface GuideContent {
  /** The guide's id. */
  id: string;
  /** The opening, one line at a time. */
  opening: readonly string[];
  /** Said when the class has not found a leader for a while. */
  idle: readonly string[];
  /** Said when all four leaders are found, before Stage 1's closing card. */
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
  /** Shown after the title card, before the guide's opening: what the class did in Lesson 01. */
  recall: Card;
  /** Stage 2: the parish priest reads the verse with the class, then asks about each part of the standing church. */
  church: {
    greet: readonly Line[];
    resume: readonly Line[];
    /** After the whole church is lit, before Stage 2's closing card. */
    done: readonly Line[];
  };
  verse: { reference: string; text: string };
  /** Stage 2: foundation, walls, then capstone. */
  churchQuestions: readonly [Question, Question, Question];
  /** Stage 2: the close-up of the church after the verse, every part still dark. */
  closeUp: Card;
  /** Stage 2: the foundation, walls, and capstone, lit one per right answer. */
  churchParts: readonly [ChurchPart, ChurchPart, ChurchPart];
  /** Stage 2: the whole church lit after the capstone. */
  heldTogether: Card;
  /** Stage 3: the card on St. Peter's statue by the church door, read before going in. */
  peter: Card;
  /** Stage 3: in the order they stand, and the order the class meets them. */
  figures: readonly [Figure, Figure, Figure, Figure, Figure, Figure];
  /** Said by a figure the class reaches before it is their turn. */
  figureWait: string;
  /** Stage 4: opened one at a time. */
  plaques: readonly [Card, Card, Card];
  /** Said by the guide when a plaque is opened out of order. */
  plaqueWait: string;
  /** Stage 5: the last screen, opened by the teacher when the groups are done. */
  prayer: Card;
}

/** Which questions an ask comes from: a lot's leaders in Stage 1, or the church's parts in Stage 2. */
export type QuestionSet = LotId | "reveal";

export function questionIn(content: BayanContent, set: QuestionSet, index: number): Question {
  return set === "reveal" ? content.churchQuestions[index] : content.lots[set].questions[index];
}

/** Words still to be supplied by the teacher start with this. They show as "to be added". */
export function isTodo(text: string): boolean {
  return text.startsWith("TODO");
}
