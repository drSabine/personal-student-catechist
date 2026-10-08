import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bayan } from "@/content/lessons/lesson-02/bayan";
import { lesson02 } from "@/content/lessons/lesson-02/lesson";
import { BayanActivity } from "./BayanActivity";
import { FIGURE_COUNT, PLAQUE_COUNT } from "./BayanRules";
import { LOT_IDS, QUESTIONS_PER_LOT, type Line } from "./content";

const activity = lesson02.activities[0];
if (!(activity instanceof BayanActivity)) throw new Error("Lesson 02 should open with Build Our Bayan.");

function publicJson<T>(url: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "public", url), "utf8")) as T;
}

interface TiledObject {
  type: string;
  name: string;
  properties?: { name: string; value: unknown }[];
}
interface TiledMap {
  layers: { name: string; type: string; layers?: { name: string }[]; objects?: TiledObject[] }[];
}

const town = publicJson<TiledMap>(activity.assets.townMap);
const church = publicJson<TiledMap>(activity.assets.churchMap);
const peopleRows = publicJson<Record<string, number>>(activity.assets.peopleIndex);
const extras = publicJson<Record<string, number>>(activity.assets.extraIndex);
const objects = town.layers.find((layer) => layer.name === "objects")?.objects ?? [];
const prop = (object: TiledObject, name: string) => object.properties?.find((p) => p.name === name)?.value;

const PERSON_TYPES = ["spawn", "guide", "leader", "villager", "townsfolk", "vendor", "animal"];
const everyone = objects.filter((object) => PERSON_TYPES.includes(object.type));

const allQuestions = [...LOT_IDS.flatMap((lot) => bayan.lots[lot].questions), ...bayan.churchQuestions];
const allLines: Line[] = [
  ...allQuestions.flatMap((q) => [q.praise, ...q.choices.flatMap((choice) => (choice.hint ? [choice.hint] : []))]),
  ...LOT_IDS.flatMap((lot) => Object.values(bayan.lots[lot].script).flat()),
  ...Object.values(bayan.church).flat(),
];

describe("Lesson 02 words", () => {
  it("asks each lot's leaders the same number of questions", () => {
    for (const lot of LOT_IDS) expect(bayan.lots[lot].questions).toHaveLength(QUESTIONS_PER_LOT);
  });

  it("gives every question three different choices and a right answer among them", () => {
    for (const question of allQuestions) {
      expect(question.choices).toHaveLength(3);
      expect(new Set(question.choices.map((choice) => choice.text)).size).toBe(3);
      expect(question.choices[question.answer]).toBeTruthy();
    }
  });

  it("answers every wrong choice with its own nudge, and the right one with none", () => {
    for (const question of allQuestions) {
      question.choices.forEach((choice, i) => {
        if (i === question.answer) expect(choice.hint, choice.text).toBeUndefined();
        else expect(choice.hint?.text, choice.text).toBeTruthy();
      });
      const hints = question.choices.flatMap((choice) => (choice.hint ? [choice.hint.text] : []));
      expect(new Set(hints).size, question.prompt).toBe(hints.length);
    }
  });

  it("has every stage, figure, and plaque Stages 2 to 5 need", () => {
    expect(bayan.figures).toHaveLength(FIGURE_COUNT);
    expect(bayan.plaques).toHaveLength(PLAQUE_COUNT);
    for (const figure of bayan.figures) expect(peopleRows[figure.sprite], figure.title).toBeTypeOf("number");
    bayan.stages.forEach((stage, i) => {
      if (i > 0) expect(stage.start.length, stage.title).toBeGreaterThan(0);
      if (i < bayan.stages.length - 1) expect(stage.end, stage.title).toBeDefined();
    });
  });

  it("only lets people in the town speak", () => {
    for (const line of allLines) expect(bayan.people[line.speaker], line.speaker).toBeDefined();
    for (const question of allQuestions) expect(bayan.people[question.speaker], question.speaker).toBeDefined();
    expect(bayan.people[bayan.guide.id]).toBeDefined();
  });

  it("does not always hide the right answer in the same place", () => {
    for (const lot of LOT_IDS) {
      const places = new Set(bayan.lots[lot].questions.map((question) => question.answer));
      expect(places.size, lot).toBeGreaterThan(1);
    }
  });
});

describe("the town map", () => {
  it("has the layers the scene needs", () => {
    const names = town.layers.map((layer) => layer.name);
    expect(names).toEqual(expect.arrayContaining(["grass", "ground", "forest", "buildings", "collisions", "objects", "above"]));
    const buildings = town.layers.find((layer) => layer.name === "buildings")?.layers?.map((layer) => layer.name) ?? [];
    for (const lot of LOT_IDS) expect(buildings).toEqual(expect.arrayContaining([`${lot}-site`, `${lot}-built`]));
    expect(objects.some((object) => object.type === "view")).toBe(true);
  });

  it("gives everyone on the map their own id, known to the lesson and drawn in a sprite sheet", () => {
    const ids = everyone.map((object) => object.name);
    expect(new Set(ids).size).toBe(ids.length);
    for (const object of everyone) {
      const person = bayan.people[object.name];
      expect(person, object.name).toBeDefined();
      const sheet = object.type === "animal" ? extras : peopleRows;
      expect(sheet[person.sprite], `${object.name} looks like ${person.sprite}`).toBeTypeOf("number");
      if (object.type !== "spawn") expect(prop(object, "behavior"), object.name).toBeTypeOf("string");
    }
  });

  it("puts each figure in the church, in its place in line", () => {
    const figures = church.layers.find((layer) => layer.name === "objects")?.objects?.filter((o) => o.type === "figure") ?? [];
    expect(figures.map((o) => prop(o, "index")).sort()).toEqual(bayan.figures.map((_, i) => i));
  });

  it("has the plaques, the church door, St. Peter, and the road", () => {
    expect(objects.filter((o) => o.type === "plaque")).toHaveLength(PLAQUE_COUNT);
    expect(objects.some((o) => o.type === "door")).toBe(true);
    expect(objects.some((o) => o.type === "statue")).toBe(true);
    expect(objects.some((o) => o.type === "lane")).toBe(true);
  });

  it("puts a leader at every lot", () => {
    const leaderLots = new Set(objects.filter((o) => o.type === "leader").map((o) => prop(o, "lotId")));
    expect([...leaderLots].sort()).toEqual([...LOT_IDS].sort());
  });
});
