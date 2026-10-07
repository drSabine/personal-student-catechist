import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bayan } from "@/content/lessons/lesson-02/bayan";
import { lesson02 } from "@/content/lessons/lesson-02/lesson";
import { BayanActivity } from "./BayanActivity";
import { LOT_IDS, type Line } from "./content";

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
const peopleRows = publicJson<Record<string, number>>(activity.assets.peopleIndex);
const extras = publicJson<Record<string, number>>(activity.assets.extraIndex);
const objects = town.layers.find((layer) => layer.name === "objects")?.objects ?? [];
const prop = (object: TiledObject, name: string) => object.properties?.find((p) => p.name === name)?.value;

const PERSON_TYPES = ["spawn", "guide", "leader", "villager", "townsfolk", "vendor", "animal"];
const everyone = objects.filter((object) => PERSON_TYPES.includes(object.type));

const allQuestions = [...LOT_IDS.flatMap((lot) => bayan.lots[lot].questions), ...bayan.churchQuestions];
const allLines: Line[] = [
  ...allQuestions.flatMap((q) => [q.hint, q.praise]),
  ...LOT_IDS.flatMap((lot) => Object.values(bayan.lots[lot].script).flat()),
];

describe("Lesson 02 words", () => {
  it("gives every question three different choices and a right answer among them", () => {
    for (const question of allQuestions) {
      expect(question.choices).toHaveLength(3);
      expect(new Set(question.choices).size).toBe(3);
      expect(question.choices[question.answer]).toBeTruthy();
    }
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
    for (const lot of ["house", "school", "hall"]) expect(buildings).toEqual(expect.arrayContaining([`${lot}-site`, `${lot}-built`]));
    expect(buildings).toEqual(
      expect.arrayContaining(["church-wall", "church-foundation", "church-walls", "church-complete"]),
    );
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

  it("puts a leader at every lot", () => {
    const leaderLots = new Set(objects.filter((o) => o.type === "leader").map((o) => prop(o, "lotId")));
    expect([...leaderLots].sort()).toEqual([...LOT_IDS].sort());
  });
});
