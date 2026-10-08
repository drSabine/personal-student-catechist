import { Lesson } from "@/core/lesson/Lesson";
import { BayanActivity } from "@/features/bayan/BayanActivity";
import { bayan } from "./bayan";

const dir = "/lessons/lesson-02";
const sound = (file: string) => `${dir}/sounds/${file}`;

/** Lesson 2. Everything this lesson shows lives in this folder and public/lessons/lesson-02/. */
export const lesson02 = new Lesson({
  id: "lesson-02",
  number: 2,
  title: "The Church Is Guided by Jesus Christ's Chosen Leaders",
  theme: "Jesus Christ chose leaders to guide His Church, and every community has leaders who help us grow.",
  // Draft for the teacher to review.
  reflectionPrompt: "Who is a leader who guides you, and how can you help them?",
  reflectionStarters: ["A leader who guides me is", "I can help my leaders by", "I will pray for"],
  activities: [
    new BayanActivity({
      id: "build-our-bayan",
      title: "Build our bayan",
      instructions: "Find each leader, and our community builds its town.",
      content: bayan,
      assets: {
        townMap: `${dir}/maps/town.json`,
        churchMap: `${dir}/maps/church.json`,
        tiles: { town: `${dir}/tiles/town.png`, extra: `${dir}/tiles/extra.png` },
        people: `${dir}/sprites/people.png`,
        peopleIndex: `${dir}/sprites/people.json`,
        extraIndex: `${dir}/sprites/extra.json`,
        buildings: `${dir}/sprites/buildings.png`,
        vehicles: `${dir}/sprites/vehicles.png`,
        statue: `${dir}/sprites/statue.png`,
        sounds: {
          music: sound("town-loop.wav"),
          talk: sound("talk.ogg"),
          blip: sound("blip.wav"),
          pop: sound("pop.wav"),
          right: sound("right.ogg"),
          wrong: sound("wrong.wav"),
          sparkle: sound("sparkle.wav"),
          hammer: sound("hammer.wav"),
          rise: sound("rise.wav"),
          build: sound("build.ogg"),
          cheer: sound("cheer.wav"),
          stage: sound("stage.ogg"),
          door: sound("door.ogg"),
        },
      },
    }),
  ],
});
